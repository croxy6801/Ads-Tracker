"""
Ad Waste Finder – database seed script.
Creates default organization, user, simulator data source, settings, and 6 campaigns.
"""

import uuid
from datetime import datetime, date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import Organization, User, DataSource, Campaign, OrgSettings
from config import settings as app_settings

ORG_ID = "00000000-0000-0000-0000-000000000001"
USER_ID = "00000000-0000-0000-0000-000000000002"
DS_ID = "00000000-0000-0000-0000-000000000003"

# Six planted campaign definitions per spec
CAMPAIGNS = [
    {
        "id": "camp-star-0001",
        "name": "The Star",
        "channel": "google_ads",
        "goal_type": "conversions",
        "target_cpa": 500.0,
        "daily_budget": 3000.0,
    },
    {
        "id": "camp-slow-0002",
        "name": "The Slow Burner",
        "channel": "google_ads",
        "goal_type": "conversions",
        "target_cpa": 500.0,
        "daily_budget": 3000.0,
    },
    {
        "id": "camp-satu-0003",
        "name": "The Saturator",
        "channel": "meta",
        "goal_type": "conversions",
        "target_cpa": 600.0,
        "daily_budget": 4000.0,
    },
    {
        "id": "camp-luck-0004",
        "name": "The Lucky Streak",
        "channel": "google_ads",
        "goal_type": "conversions",
        "target_cpa": 500.0,
        "daily_budget": 2500.0,
    },
    {
        "id": "camp-awar-0005",
        "name": "The Awareness",
        "channel": "meta",
        "goal_type": "awareness",
        "target_cpa": None,
        "daily_budget": 5000.0,
    },
    {
        "id": "camp-midd-0006",
        "name": "The Steady Middle",
        "channel": "google_ads",
        "goal_type": "conversions",
        "target_cpa": 500.0,
        "daily_budget": 2000.0,
    },
]


async def seed_database(session: AsyncSession) -> None:
    """Seed defaults if organization does not exist yet."""
    result = await session.execute(select(Organization).where(Organization.id == ORG_ID))
    if result.scalar_one_or_none() is not None:
        return  # already seeded

    org = Organization(id=ORG_ID, name="Demo Organization", currency="INR")
    session.add(org)

    user = User(id=USER_ID, organization_id=ORG_ID, name="Demo Admin", email="admin@demo.com", role="admin")
    session.add(user)

    ds = DataSource(
        id=DS_ID,
        organization_id=ORG_ID,
        type="simulator",
        status="active",
        last_synced_at=datetime.utcnow(),
        config={"seed": app_settings.SIMULATOR_SEED},
    )
    session.add(ds)

    org_settings = OrgSettings(
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
    session.add(org_settings)

    for cdef in CAMPAIGNS:
        c = Campaign(
            id=cdef["id"],
            data_source_id=DS_ID,
            name=cdef["name"],
            channel=cdef["channel"],
            goal_type=cdef["goal_type"],
            target_cpa=cdef["target_cpa"],
            daily_budget=cdef["daily_budget"],
            start_date=date(2024, 1, 1),
            status="active",
        )
        session.add(c)

    await session.commit()
