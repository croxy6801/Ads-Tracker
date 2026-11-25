"""
Ad Waste Finder – Alerts API router.
GET /api/v1/alerts
PATCH /api/v1/alerts/{alert_id}/read
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_session
from models import Alert
from schemas import AlertOut

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    unread_only: bool = False,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    query = select(Alert).order_by(desc(Alert.created_at)).limit(limit)
    if unread_only:
        query = query.where(Alert.read == False)
    res = await session.execute(query)
    return res.scalars().all()


@router.patch("/{alert_id}/read", response_model=AlertOut)
async def mark_alert_read(
    alert_id: str,
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Alert).where(Alert.id == alert_id))
    alert = res.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.read = True
    await session.commit()
    return alert
