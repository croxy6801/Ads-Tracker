"""
Ad Waste Finder – Recommendations endpoints:
GET /api/v1/recommendations
POST /api/v1/recommendations/{id}/decision
"""

from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_session
from models import Recommendation, Campaign, AuditLog, ShiftFollowup, AnalysisSnapshot
from schemas import RecommendationOut, DecisionRequest, ShiftFollowupOut
from simulator.engine import simulator_engine

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


@router.get("/followups", response_model=list[ShiftFollowupOut])
async def list_shift_followups(session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(ShiftFollowup).order_by(desc(ShiftFollowup.check_date)))
    return res.scalars().all()


@router.get("", response_model=list[RecommendationOut])
async def list_recommendations(session: AsyncSession = Depends(get_session)):
    rec_res = await session.execute(
        select(Recommendation).order_by(desc(Recommendation.created_at))
    )
    recommendations = rec_res.scalars().all()

    # Preload campaign names
    camps_res = await session.execute(select(Campaign))
    cmap = {c.id: c.name for c in camps_res.scalars().all()}

    output = []
    for r in recommendations:
        output.append(
            RecommendationOut(
                id=r.id,
                type=r.type,
                from_campaign_id=r.from_campaign_id,
                from_campaign_name=cmap.get(r.from_campaign_id),
                to_campaign_id=r.to_campaign_id,
                to_campaign_name=cmap.get(r.to_campaign_id) if r.to_campaign_id else None,
                shift_percent=r.shift_percent,
                amount_per_day=r.amount_per_day,
                expected_gain_low=r.expected_gain_low,
                expected_gain_high=r.expected_gain_high,
                confidence=r.confidence,
                reasons=r.reasons,
                status=r.status,
                created_at=r.created_at,
                decided_at=r.decided_at,
                decided_by=r.decided_by,
            )
        )
    return output


@router.post("/{rec_id}/decision", response_model=RecommendationOut)
async def decide_recommendation(
    rec_id: str,
    payload: DecisionRequest,
    session: AsyncSession = Depends(get_session),
):
    rec_res = await session.execute(select(Recommendation).where(Recommendation.id == rec_id))
    rec = rec_res.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = payload.action
    rec.decided_at = datetime.utcnow()
    rec.decided_by = payload.decided_by or "Demo User"

    # If approved, update simulator budgets
    if payload.action == "approve":
        # Fetch source campaign
        from_camp_res = await session.execute(select(Campaign).where(Campaign.id == rec.from_campaign_id))
        from_camp = from_camp_res.scalar_one_or_none()
        if from_camp:
            current_b = from_camp.daily_budget or 3000.0
            new_from_budget = max(500.0, current_b - rec.amount_per_day)
            from_camp.daily_budget = new_from_budget
            simulator_engine.set_budget(from_camp.id, new_from_budget)

        if rec.to_campaign_id:
            to_camp_res = await session.execute(select(Campaign).where(Campaign.id == rec.to_campaign_id))
            to_camp = to_camp_res.scalar_one_or_none()
            if to_camp:
                to_current_b = to_camp.daily_budget or 3000.0
                new_to_budget = to_current_b + rec.amount_per_day
                to_camp.daily_budget = new_to_budget
                simulator_engine.set_budget(to_camp.id, new_to_budget)

            # Get recipient baseline CPA before shift
            snap_res = await session.execute(
                select(AnalysisSnapshot)
                .where(AnalysisSnapshot.campaign_id == rec.to_campaign_id)
                .order_by(desc(AnalysisSnapshot.created_at))
                .limit(1)
            )
            latest_snap = snap_res.scalar_one_or_none()
            baseline_cpa = latest_snap.cpa if latest_snap else 350.0

            # Schedule 7-day post-shift follow-up verification
            followup = ShiftFollowup(
                recommendation_id=rec.id,
                check_date=date.today() + timedelta(days=7),
                receiving_cpa_before=baseline_cpa,
                result="pending",
                next_step_suggested="Observing 7-day recipient performance window to verify saturation < 20%."
            )
            session.add(followup)

    # Log to audit ledger
    audit = AuditLog(
        user_id=rec.decided_by,
        action=f"recommendation_{payload.action}",
        object_type="recommendation",
        object_id=rec.id,
        details={"reason": payload.reason, "shift_amount": rec.amount_per_day},
    )
    session.add(audit)
    await session.commit()

    return RecommendationOut(
        id=rec.id,
        type=rec.type,
        from_campaign_id=rec.from_campaign_id,
        to_campaign_id=rec.to_campaign_id,
        shift_percent=rec.shift_percent,
        amount_per_day=rec.amount_per_day,
        expected_gain_low=rec.expected_gain_low,
        expected_gain_high=rec.expected_gain_high,
        confidence=rec.confidence,
        reasons=rec.reasons,
        status=rec.status,
        created_at=rec.created_at,
        decided_at=rec.decided_at,
        decided_by=rec.decided_by,
    )
