"""
Ad Waste Finder – Settings endpoints:
GET /api/v1/settings
PUT /api/v1/settings
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_session
from models import OrgSettings, AuditLog
from schemas import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

ORG_ID = "00000000-0000-0000-0000-000000000001"


@router.get("", response_model=SettingsOut)
async def get_settings(session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(OrgSettings).where(OrgSettings.organization_id == ORG_ID))
    st = res.scalar_one_or_none()
    if not st:
        st = OrgSettings(organization_id=ORG_ID)
        session.add(st)
        await session.commit()
    return st


@router.put("", response_model=SettingsOut)
async def update_settings(payload: SettingsUpdate, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(OrgSettings).where(OrgSettings.organization_id == ORG_ID))
    st = res.scalar_one_or_none()
    if not st:
        st = OrgSettings(organization_id=ORG_ID)
        session.add(st)

    changes = {}
    for field, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            changes[field] = val
            setattr(st, field, val)

    audit = AuditLog(
        action="update_settings",
        object_type="settings",
        object_id=ORG_ID,
        details=changes,
    )
    session.add(audit)
    await session.commit()
    await session.refresh(st)

    return st
