"""
Ad Waste Finder – Simulator background runner.
Periodically advances the simulator clock when is_playing is True, generates metrics,
triggers daily analysis, saves snapshots/recommendations, and broadcasts SSE ticks.
"""

import asyncio
from datetime import datetime, date
from sqlalchemy import select

from database import async_session_factory
from models import Campaign, DailyMetric, AnalysisSnapshot, Recommendation, Alert, OrgSettings
from simulator.clock import simulator_clock
from simulator.engine import simulator_engine
from analysis.maturity import split_mature_metrics
from analysis.classifier import classify_campaign
from analysis.recommender import select_receiving_campaign, generate_budget_shift_recommendation
from event_bus import event_bus

ORG_ID = "00000000-0000-0000-0000-000000000001"


async def run_daily_tick(day_number: int, current_date: date) -> dict:
    """
    Executes a single virtual day simulation step and updates DB state.
    """
    async with async_session_factory() as session:
        # Load org settings
        st_res = await session.execute(select(OrgSettings).where(OrgSettings.organization_id == ORG_ID))
        settings = st_res.scalar_one_or_none()
        if not settings:
            from config import settings as app_settings
            settings = OrgSettings(
                organization_id=ORG_ID,
                min_days=app_settings.DEFAULT_MIN_DAYS,
                min_spend=app_settings.DEFAULT_MIN_SPEND,
                spend_multiple_of_target_cpa=app_settings.DEFAULT_SPEND_MULTIPLE_OF_TARGET_CPA,
                min_clicks=app_settings.DEFAULT_MIN_CLICKS,
                maturity_days=app_settings.DEFAULT_MATURITY_DAYS,
                flag_cpa_ratio=app_settings.DEFAULT_FLAG_CPA_RATIO,
                confidence_threshold=app_settings.DEFAULT_CONFIDENCE_THRESHOLD,
                shift_percent=app_settings.DEFAULT_SHIFT_PERCENT,
                recheck_days=app_settings.DEFAULT_RECHECK_DAYS,
                saturation_tolerance=app_settings.DEFAULT_SATURATION_TOLERANCE,
            )

        # Generate metrics from simulator engine
        day_metrics_data = simulator_engine.generate_day(day_number, current_date)

        # Persist daily metrics
        for row in day_metrics_data:
            metric = DailyMetric(
                campaign_id=row["campaign_id"],
                date=row["date"],
                spend=row["spend"],
                impressions=row["impressions"],
                clicks=row["clicks"],
                conversions=row["conversions"],
                revenue=row["revenue"],
                budget_exhausted=row["budget_exhausted"],
                is_mature=True,
            )
            session.add(metric)
        await session.commit()

        # Update maturity flags for all metrics (last maturity_days days are immature)
        all_metrics_res = await session.execute(select(DailyMetric))
        all_metrics = all_metrics_res.scalars().all()

        for m in all_metrics:
            is_mat = (current_date - m.date).days >= settings.maturity_days
            m.is_mature = is_mat
        await session.commit()

        # Fetch campaigns
        camps_res = await session.execute(select(Campaign))
        campaigns = camps_res.scalars().all()

        # Group metrics by campaign
        metrics_by_camp: dict[str, list[DailyMetric]] = {}
        for m in all_metrics:
            metrics_by_camp.setdefault(m.campaign_id, []).append(m)

        # Run analysis classification for each campaign
        campaign_snapshots: dict[str, dict] = {}
        underperforming_camps = []
        new_alerts = []

        for camp in campaigns:
            camp_metrics = metrics_by_camp.get(camp.id, [])
            mature_metrics = [m for m in camp_metrics if m.is_mature]

            eval_res = classify_campaign(
                campaign=camp,
                mature_metrics=mature_metrics,
                benchmark_cpa=camp.target_cpa,
                settings=settings,
            )
            campaign_snapshots[camp.id] = eval_res

            # Record analysis snapshot
            snap = AnalysisSnapshot(
                campaign_id=camp.id,
                as_of_date=current_date,
                cpa=eval_res["cpa"],
                roas=eval_res["metrics"]["roas"],
                cvr=eval_res["cvr"],
                confidence_worse_than_benchmark=eval_res["confidence"],
                status=eval_res["status"],
                estimated_waste=eval_res["estimated_waste"],
                reasons=eval_res["reasons"],
            )
            session.add(snap)

            # Check for alerts
            if eval_res["status"] == "underperforming":
                underperforming_camps.append(camp)
                alert = Alert(
                    campaign_id=camp.id,
                    level="critical",
                    message=f"Campaign '{camp.name}' flagged as Underperforming. Estimated waste: ₹{eval_res['estimated_waste']:,.2f}.",
                )
                session.add(alert)
                new_alerts.append({"campaign": camp.name, "message": alert.message})
            elif eval_res["status"] == "watch":
                alert = Alert(
                    campaign_id=camp.id,
                    level="warning",
                    message=f"Campaign '{camp.name}' entered Watch status. CPA trending above target.",
                )
                session.add(alert)

        # Generate recommendations for any underperforming campaign if no active recommendation exists
        for u_camp in underperforming_camps:
            # Check existing open recommendations
            rec_check = await session.execute(
                select(Recommendation).where(
                    Recommendation.from_campaign_id == u_camp.id,
                    Recommendation.status == "open",
                )
            )
            if rec_check.scalar_one_or_none() is None:
                # Select receiving campaign
                recipient = select_receiving_campaign(
                    source_campaign=u_camp,
                    all_campaigns=campaigns,
                    campaign_snapshots=campaign_snapshots,
                    recent_metrics_by_camp=metrics_by_camp,
                )
                rec_dict = generate_budget_shift_recommendation(
                    source_campaign=u_camp,
                    source_snapshot=campaign_snapshots[u_camp.id],
                    target_campaign=recipient,
                    target_snapshot=campaign_snapshots.get(recipient.id) if recipient else None,
                    shift_percent=settings.shift_percent,
                    diminishing_returns_penalty=0.20,
                )
                rec_entry = Recommendation(
                    organization_id=ORG_ID,
                    type=rec_dict["type"],
                    from_campaign_id=rec_dict["from_campaign_id"],
                    to_campaign_id=rec_dict["to_campaign_id"],
                    shift_percent=rec_dict["shift_percent"],
                    amount_per_day=rec_dict["amount_per_day"],
                    expected_gain_low=rec_dict["expected_gain_low"],
                    expected_gain_high=rec_dict["expected_gain_high"],
                    confidence=rec_dict["confidence"],
                    reasons=rec_dict["reasons"],
                    status="open",
                )
                session.add(rec_entry)

        await session.commit()

        # Broadcast SSE tick
        tick_data = {
            "day": day_number,
            "date": current_date.isoformat(),
            "new_alerts_count": len(new_alerts),
        }
        await event_bus.broadcast("tick", tick_data)
        return tick_data


async def simulator_background_worker():
    """Continuous async worker that ticks when simulator_clock.is_playing is true."""
    while True:
        try:
            if simulator_clock.is_playing:
                new_day = simulator_clock.tick()
                cur_date = simulator_clock.current_date
                await run_daily_tick(new_day, cur_date)
            # Sleep duration inversely proportional to speed: base 1.0s / speed
            sleep_time = max(0.2, 1.0 / max(0.1, simulator_clock.speed))
            await asyncio.sleep(sleep_time)
        except asyncio.CancelledError:
            break
        except Exception as e:
            await asyncio.sleep(1.0)
