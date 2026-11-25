"""
Ad Waste Finder – Dashboard summary endpoint.
GET /api/v1/dashboard/summary
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from database import get_session
from models import Campaign, DailyMetric, AnalysisSnapshot, Alert
from schemas import DashboardSummary
from simulator.clock import simulator_clock

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(session: AsyncSession = Depends(get_session)):
    current_date = simulator_clock.current_date
    current_day = simulator_clock.current_day

    # Today's spend
    today_res = await session.execute(
        select(func.coalesce(func.sum(DailyMetric.spend), 0.0)).where(DailyMetric.date == current_date)
    )
    today_spend = float(today_res.scalar() or 0.0)

    # Total spend & conversions
    tot_res = await session.execute(
        select(
            func.coalesce(func.sum(DailyMetric.spend), 0.0),
            func.coalesce(func.sum(DailyMetric.conversions), 0.0),
        )
    )
    total_spend, total_conversions = tot_res.one()
    total_spend = float(total_spend or 0.0)
    total_conversions = float(total_conversions or 0.0)

    blended_cpa = (total_spend / total_conversions) if total_conversions > 0 else None

    # Latest analysis snapshot per campaign for statuses and estimated waste
    camps_res = await session.execute(select(Campaign.id))
    camp_ids = camps_res.scalars().all()

    campaign_counts: dict[str, int] = {}
    total_waste = 0.0

    for cid in camp_ids:
        snap_res = await session.execute(
            select(AnalysisSnapshot)
            .where(AnalysisSnapshot.campaign_id == cid)
            .order_by(desc(AnalysisSnapshot.as_of_date))
            .limit(1)
        )
        snap = snap_res.scalar_one_or_none()
        st = snap.status if snap else "collecting_data"
        campaign_counts[st] = campaign_counts.get(st, 0) + 1
        if snap and snap.estimated_waste:
            total_waste += snap.estimated_waste

    return DashboardSummary(
        today_spend=round(today_spend, 2),
        total_spend=round(total_spend, 2),
        total_conversions=round(total_conversions, 2),
        blended_cpa=round(blended_cpa, 2) if blended_cpa is not None else None,
        estimated_waste=round(total_waste, 2),
        campaign_counts=campaign_counts,
        current_day=current_day,
        current_date=current_date.isoformat(),
        is_playing=simulator_clock.is_playing,
    )
