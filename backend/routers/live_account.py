"""
Ad Waste Finder – Live Ad Account API Router.
Enables real-time spend surveillance directly from live Google Ads, Meta Ads, and other ad networks
using developer API keys, providing continuous waste detection and 25% budget reallocations.
"""

from typing import Dict, Any, List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_session
from models import DataSource, Campaign, DailyMetric, Organization, Recommendation, AuditLog
from schemas import LiveConnectRequest, LiveSyncRequest, LiveAccountStatus
from adapters.live_ad_api import LiveAdAPIAdapter
from analysis.classifier import classify_campaign
from analysis.recommender import select_receiving_campaign, generate_budget_shift_recommendation

router = APIRouter(prefix="/api/v1/live-account", tags=["live-account"])

# In-memory store for active live connection state
_ACTIVE_LIVE_SESSION: Dict[str, Any] = {
    "connected": False,
    "platform": None,
    "account_id": None,
    "account_name": None,
    "developer_token": None,
    "access_token": None,
    "last_synced_at": None,
    "active_campaigns_count": 0,
    "total_spend_tracked": 0.0,
    "total_waste_detected": 0.0,
}


@router.get("/status", response_model=LiveAccountStatus)
async def get_live_status():
    return LiveAccountStatus(
        connected=_ACTIVE_LIVE_SESSION["connected"],
        platform=_ACTIVE_LIVE_SESSION["platform"],
        account_id=_ACTIVE_LIVE_SESSION["account_id"],
        account_name=_ACTIVE_LIVE_SESSION["account_name"],
        last_synced_at=_ACTIVE_LIVE_SESSION["last_synced_at"],
        active_campaigns_count=_ACTIVE_LIVE_SESSION["active_campaigns_count"],
        total_spend_tracked=_ACTIVE_LIVE_SESSION["total_spend_tracked"],
        total_waste_detected=_ACTIVE_LIVE_SESSION["total_waste_detected"],
    )


@router.post("/connect")
async def connect_live_account(
    payload: LiveConnectRequest,
    session: AsyncSession = Depends(get_session),
):
    adapter = LiveAdAPIAdapter(
        platform=payload.platform,
        developer_token=payload.developer_token,
        access_token=payload.access_token,
        account_id=payload.account_id,
    )
    val = adapter.validate_credentials()
    if not val["valid"]:
        raise HTTPException(status_code=400, detail=val["error"])

    # Register/update DataSource in DB
    org_res = await session.execute(select(Organization).limit(1))
    org = org_res.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=500, detail="Default organization not found")

    ds_res = await session.execute(
        select(DataSource).where(DataSource.type == payload.platform).limit(1)
    )
    ds = ds_res.scalar_one_or_none()
    if not ds:
        ds = DataSource(
            organization_id=org.id,
            type=payload.platform,
            status="connected",
            config={
                "account_id": payload.account_id,
                "currency": payload.currency,
                "target_cpa": payload.target_cpa,
            },
        )
        session.add(ds)
    else:
        ds.status = "connected"
        ds.config = {
            "account_id": payload.account_id,
            "currency": payload.currency,
            "target_cpa": payload.target_cpa,
        }

    # Audit log connection
    audit = AuditLog(
        user_id="ApiOwner",
        action="live_account_connected",
        object_type="data_source",
        object_id=ds.id if ds else None,
        details={
            "platform": payload.platform,
            "account_id": payload.account_id,
            "masked_token": f"{payload.developer_token[:4]}...{payload.developer_token[-4:]}" if len(payload.developer_token) > 8 else "***",
        },
    )
    session.add(audit)
    await session.commit()

    # Update in-memory state
    _ACTIVE_LIVE_SESSION.update({
        "connected": True,
        "platform": payload.platform,
        "account_id": payload.account_id,
        "account_name": payload.account_name or f"{payload.platform.replace('_', ' ').title()} - {payload.account_id}",
        "developer_token": payload.developer_token,
        "access_token": payload.access_token,
        "last_synced_at": datetime.utcnow(),
    })

    return {
        "status": "connected",
        "message": f"Successfully connected to {payload.platform} (Account: {payload.account_id}). Ready to sync live telemetry.",
        "account_id": payload.account_id,
        "platform": payload.platform,
    }


@router.post("/sync")
async def sync_live_campaigns(
    payload: LiveSyncRequest,
    session: AsyncSession = Depends(get_session),
):
    if not _ACTIVE_LIVE_SESSION["connected"]:
        raise HTTPException(status_code=400, detail="No live ad account is connected. Please connect with your API key first.")

    adapter = LiveAdAPIAdapter(
        platform=_ACTIVE_LIVE_SESSION["platform"],
        developer_token=_ACTIVE_LIVE_SESSION["developer_token"],
        access_token=_ACTIVE_LIVE_SESSION["access_token"],
        account_id=payload.account_id or _ACTIVE_LIVE_SESSION["account_id"],
    )

    campaign_data = await adapter.fetch_live_campaigns(days=payload.days)

    total_spend = 0.0
    total_waste = 0.0
    campaign_summaries = []

    for c_data in campaign_data:
        spend = sum(m["spend"] for m in c_data["metrics"])
        conv = sum(m["conversions"] for m in c_data["metrics"])
        clicks = sum(m["clicks"] for m in c_data["metrics"])
        cpa = round(spend / conv, 2) if conv > 0 else None

        target = c_data["target_cpa"]
        # Waste estimate: spend - conv * target
        waste = max(0.0, spend - (conv * target)) if target else 0.0

        total_spend += spend
        total_waste += waste

        status = "healthy"
        if cpa and cpa > 1.5 * target and spend >= 10000:
            status = "underperforming"
        elif cpa and cpa <= 0.85 * target:
            status = "strong"

        campaign_summaries.append({
            "id": c_data["id"],
            "name": c_data["name"],
            "channel": c_data["channel"],
            "goal_type": c_data["goal_type"],
            "spend": round(spend, 2),
            "conversions": round(conv, 1),
            "cpa": cpa,
            "target_cpa": target,
            "status": status,
            "estimated_waste": round(waste, 2),
        })

    _ACTIVE_LIVE_SESSION["last_synced_at"] = datetime.utcnow()
    _ACTIVE_LIVE_SESSION["active_campaigns_count"] = len(campaign_data)
    _ACTIVE_LIVE_SESSION["total_spend_tracked"] = round(total_spend, 2)
    _ACTIVE_LIVE_SESSION["total_waste_detected"] = round(total_waste, 2)

    return {
        "status": "synced",
        "synced_at": _ACTIVE_LIVE_SESSION["last_synced_at"],
        "campaigns_count": len(campaign_data),
        "total_spend": round(total_spend, 2),
        "total_waste": round(total_waste, 2),
        "campaigns": campaign_summaries,
    }


@router.post("/disconnect")
async def disconnect_live_account():
    _ACTIVE_LIVE_SESSION.update({
        "connected": False,
        "platform": None,
        "account_id": None,
        "account_name": None,
        "developer_token": None,
        "access_token": None,
        "last_synced_at": None,
        "active_campaigns_count": 0,
        "total_spend_tracked": 0.0,
        "total_waste_detected": 0.0,
    })
    return {"status": "disconnected", "message": "Live ad account disconnected successfully."}
