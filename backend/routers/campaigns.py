"""
Ad Waste Finder – Campaign endpoints:
GET /api/v1/campaigns
GET /api/v1/campaigns/{id}/metrics
POST /api/v1/campaigns/{id}/diagnose
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from database import get_session
from models import Campaign, DailyMetric, AnalysisSnapshot, CampaignDiagnostic, AuditLog
from schemas import CampaignOut, CampaignMetricsResponse, DailyMetricOut, DiagnosticResponse
from analysis.diagnostics import run_funnel_diagnostics
from simulator.clock import simulator_clock

router = APIRouter(prefix="/api/v1/campaigns", tags=["campaigns"])


@router.get("", response_model=list[CampaignOut])
async def list_campaigns(session: AsyncSession = Depends(get_session)):
    camps_res = await session.execute(select(Campaign))
    campaigns = camps_res.scalars().all()

    output = []
    for c in campaigns:
        # Latest snapshot
        snap_res = await session.execute(
            select(AnalysisSnapshot)
            .where(AnalysisSnapshot.campaign_id == c.id)
            .order_by(desc(AnalysisSnapshot.as_of_date))
            .limit(1)
        )
        snap = snap_res.scalar_one_or_none()

        # Cumulative metrics
        tot_res = await session.execute(
            select(
                func.coalesce(func.sum(DailyMetric.spend), 0.0),
                func.coalesce(func.sum(DailyMetric.conversions), 0.0),
            ).where(DailyMetric.campaign_id == c.id)
        )
        tot_spend, tot_conv = tot_res.one()
        tot_spend = float(tot_spend or 0.0)
        tot_conv = float(tot_conv or 0.0)

        cpa = snap.cpa if snap else ((tot_spend / tot_conv) if tot_conv > 0 else None)

        output.append(
            CampaignOut(
                id=c.id,
                name=c.name,
                channel=c.channel,
                goal_type=c.goal_type,
                target_cpa=c.target_cpa,
                daily_budget=c.daily_budget,
                start_date=c.start_date,
                status=c.status,
                analysis_status=snap.status if snap else "collecting_data",
                total_spend=round(tot_spend, 2),
                total_conversions=round(tot_conv, 2),
                current_cpa=round(cpa, 2) if cpa is not None else None,
                confidence=snap.confidence_worse_than_benchmark if snap else None,
                estimated_waste=round(snap.estimated_waste, 2) if snap else 0.0,
            )
        )

    return output


@router.get("/{campaign_id}/metrics", response_model=CampaignMetricsResponse)
async def get_campaign_metrics(campaign_id: str, session: AsyncSession = Depends(get_session)):
    c_res = await session.execute(select(Campaign).where(Campaign.id == campaign_id))
    camp = c_res.scalar_one_or_none()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    m_res = await session.execute(
        select(DailyMetric)
        .where(DailyMetric.campaign_id == campaign_id)
        .order_by(DailyMetric.date)
    )
    metrics = m_res.scalars().all()

    snap_res = await session.execute(
        select(AnalysisSnapshot)
        .where(AnalysisSnapshot.campaign_id == campaign_id)
        .order_by(desc(AnalysisSnapshot.as_of_date))
        .limit(1)
    )
    snap = snap_res.scalar_one_or_none()

    metric_outs = [
        DailyMetricOut(
            id=m.id,
            date=m.date,
            spend=m.spend,
            impressions=m.impressions,
            clicks=m.clicks,
            conversions=m.conversions,
            revenue=m.revenue,
            budget_exhausted=m.budget_exhausted,
            is_mature=m.is_mature,
        )
        for m in metrics
    ]

    return CampaignMetricsResponse(
        campaign_id=camp.id,
        campaign_name=camp.name,
        metrics=metric_outs,
        analysis_status=snap.status if snap else "collecting_data",
        current_cpa=snap.cpa if snap else None,
        target_cpa=camp.target_cpa,
        confidence=snap.confidence_worse_than_benchmark if snap else None,
        estimated_waste=snap.estimated_waste if snap else 0.0,
        reasons=snap.reasons if snap else None,
    )


@router.post("/{campaign_id}/diagnose", response_model=DiagnosticResponse)
async def diagnose_campaign(campaign_id: str, session: AsyncSession = Depends(get_session)):
    c_res = await session.execute(select(Campaign).where(Campaign.id == campaign_id))
    camp = c_res.scalar_one_or_none()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Fetch mature metrics
    m_res = await session.execute(
        select(DailyMetric)
        .where(DailyMetric.campaign_id == campaign_id, DailyMetric.is_mature == True)
        .order_by(DailyMetric.date)
    )
    mature_metrics = m_res.scalars().all()

    diag_result = run_funnel_diagnostics(camp, mature_metrics)

    # Save diagnostic record
    diag_record = CampaignDiagnostic(
        campaign_id=camp.id,
        health_score=diag_result["health_score"],
        primary_bottleneck=diag_result["primary_bottleneck"],
        suggestions_json=diag_result["suggestions"],
    )
    session.add(diag_record)

    # Audit log
    audit = AuditLog(
        action="diagnose_campaign",
        object_type="campaign",
        object_id=camp.id,
        details={"primary_bottleneck": diag_result["primary_bottleneck"]},
    )
    session.add(audit)
    await session.commit()

    return DiagnosticResponse(
        id=diag_record.id,
        campaign_id=camp.id,
        requested_at=diag_record.requested_at,
        health_score=diag_result["health_score"],
        primary_bottleneck=diag_result["primary_bottleneck"],
        suggestions=diag_result["suggestions"],
    )
