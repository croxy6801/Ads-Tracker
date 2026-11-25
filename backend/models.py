"""
Ad Waste Finder – SQLAlchemy ORM models (12 tables).
"""

import uuid
from datetime import datetime, date
from typing import Optional

from sqlalchemy import (
    Column, String, Float, Integer, Boolean, Text, Date, DateTime,
    ForeignKey, JSON,
)
from sqlalchemy.orm import relationship

from database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# 1. organizations
# ---------------------------------------------------------------------------
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    currency = Column(String, default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    data_sources = relationship("DataSource", back_populates="organization")
    recommendations = relationship("Recommendation", back_populates="organization")
    settings = relationship("OrgSettings", back_populates="organization", uselist=False)


# ---------------------------------------------------------------------------
# 2. users
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    role = Column(String, default="admin")

    organization = relationship("Organization", back_populates="users")


# ---------------------------------------------------------------------------
# 3. data_sources
# ---------------------------------------------------------------------------
class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String, primary_key=True, default=_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    type = Column(String, nullable=False)  # "simulator" | "csv" | "google_ads" | "meta"
    status = Column(String, default="active")
    last_synced_at = Column(DateTime, nullable=True)
    config = Column(JSON, nullable=True)

    organization = relationship("Organization", back_populates="data_sources")
    campaigns = relationship("Campaign", back_populates="data_source")


# ---------------------------------------------------------------------------
# 4. campaigns
# ---------------------------------------------------------------------------
class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=_uuid)
    data_source_id = Column(String, ForeignKey("data_sources.id"), nullable=False)
    name = Column(String, nullable=False)
    channel = Column(String, default="google_ads")
    goal_type = Column(String, default="conversions")  # "conversions" | "awareness"
    target_cpa = Column(Float, nullable=True)
    target_roas = Column(Float, nullable=True)
    daily_budget = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    data_source = relationship("DataSource", back_populates="campaigns")
    daily_metrics = relationship("DailyMetric", back_populates="campaign", order_by="DailyMetric.date")
    analysis_snapshots = relationship("AnalysisSnapshot", back_populates="campaign")
    diagnostics = relationship("CampaignDiagnostic", back_populates="campaign")
    alerts = relationship("Alert", back_populates="campaign")


# ---------------------------------------------------------------------------
# 5. daily_metrics
# ---------------------------------------------------------------------------
class DailyMetric(Base):
    __tablename__ = "daily_metrics"

    id = Column(String, primary_key=True, default=_uuid)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    date = Column(Date, nullable=False)
    spend = Column(Float, default=0.0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    budget_exhausted = Column(Float, default=0.0)  # fraction 0-1
    is_mature = Column(Boolean, default=True)

    campaign = relationship("Campaign", back_populates="daily_metrics")


# ---------------------------------------------------------------------------
# 6. analysis_snapshots
# ---------------------------------------------------------------------------
class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"

    id = Column(String, primary_key=True, default=_uuid)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    as_of_date = Column(Date, nullable=False)
    cpa = Column(Float, nullable=True)
    roas = Column(Float, nullable=True)
    cvr = Column(Float, nullable=True)
    confidence_worse_than_benchmark = Column(Float, nullable=True)
    status = Column(String, default="collecting_data")
    estimated_waste = Column(Float, default=0.0)
    reasons = Column(JSON, nullable=True)

    campaign = relationship("Campaign", back_populates="analysis_snapshots")


# ---------------------------------------------------------------------------
# 7. recommendations
# ---------------------------------------------------------------------------
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    type = Column(String, default="budget_shift")  # "budget_shift" | "pause"
    from_campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    to_campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True)
    shift_percent = Column(Float, default=25.0)
    amount_per_day = Column(Float, default=0.0)
    expected_gain_low = Column(Float, nullable=True)
    expected_gain_high = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    reasons = Column(JSON, nullable=True)
    status = Column(String, default="open")  # open | approved | dismissed | snoozed
    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)
    decided_by = Column(String, nullable=True)

    organization = relationship("Organization", back_populates="recommendations")
    from_campaign = relationship("Campaign", foreign_keys=[from_campaign_id])
    to_campaign = relationship("Campaign", foreign_keys=[to_campaign_id])
    followups = relationship("ShiftFollowup", back_populates="recommendation")


# ---------------------------------------------------------------------------
# 8. campaign_diagnostics
# ---------------------------------------------------------------------------
class CampaignDiagnostic(Base):
    __tablename__ = "campaign_diagnostics"

    id = Column(String, primary_key=True, default=_uuid)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    requested_at = Column(DateTime, default=datetime.utcnow)
    requested_by = Column(String, nullable=True)
    health_score = Column(Float, nullable=True)
    primary_bottleneck = Column(String, nullable=True)
    suggestions_json = Column(JSON, nullable=True)

    campaign = relationship("Campaign", back_populates="diagnostics")


# ---------------------------------------------------------------------------
# 9. shift_followups
# ---------------------------------------------------------------------------
class ShiftFollowup(Base):
    __tablename__ = "shift_followups"

    id = Column(String, primary_key=True, default=_uuid)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=False)
    check_date = Column(Date, nullable=False)
    receiving_cpa_before = Column(Float, nullable=True)
    receiving_cpa_after = Column(Float, nullable=True)
    result = Column(String, nullable=True)  # "held" | "saturated"
    next_step_suggested = Column(String, nullable=True)

    recommendation = relationship("Recommendation", back_populates="followups")


# ---------------------------------------------------------------------------
# 10. alerts
# ---------------------------------------------------------------------------
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=_uuid)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True)
    level = Column(String, default="info")  # info | warning | critical
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)

    campaign = relationship("Campaign", back_populates="alerts")


# ---------------------------------------------------------------------------
# 11. settings (per organization)
# ---------------------------------------------------------------------------
class OrgSettings(Base):
    __tablename__ = "settings"

    organization_id = Column(String, ForeignKey("organizations.id"), primary_key=True)
    min_days = Column(Integer, default=14)
    min_spend = Column(Float, default=10_000.0)
    spend_multiple_of_target_cpa = Column(Float, default=10.0)
    min_clicks = Column(Integer, default=100)
    maturity_days = Column(Integer, default=3)
    flag_cpa_ratio = Column(Float, default=1.5)
    confidence_threshold = Column(Float, default=0.80)
    shift_percent = Column(Float, default=25.0)
    recheck_days = Column(Integer, default=7)
    saturation_tolerance = Column(Float, default=0.20)

    organization = relationship("Organization", back_populates="settings")


# ---------------------------------------------------------------------------
# 12. audit_log
# ---------------------------------------------------------------------------
class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    object_type = Column(String, nullable=True)
    object_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
