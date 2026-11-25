"""
Ad Waste Finder – Pydantic v2 request / response schemas.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# ── helpers ──────────────────────────────────────────────────────────────────
class _Orm(BaseModel):
    model_config = {"from_attributes": True}


# ── Dashboard ────────────────────────────────────────────────────────────────
class DashboardSummary(_Orm):
    today_spend: float = 0.0
    total_spend: float = 0.0
    total_conversions: float = 0.0
    blended_cpa: Optional[float] = None
    estimated_waste: float = 0.0
    campaign_counts: dict[str, int] = {}
    current_day: int = 0
    current_date: Optional[str] = None
    is_playing: bool = False


# ── Campaign ─────────────────────────────────────────────────────────────────
class CampaignOut(_Orm):
    id: str
    name: str
    channel: str
    goal_type: str
    target_cpa: Optional[float] = None
    daily_budget: Optional[float] = None
    start_date: Optional[date] = None
    status: str = "active"
    # analysis summary (latest snapshot)
    analysis_status: Optional[str] = None
    total_spend: float = 0.0
    total_conversions: float = 0.0
    current_cpa: Optional[float] = None
    confidence: Optional[float] = None
    estimated_waste: float = 0.0


class DailyMetricOut(_Orm):
    id: str
    date: date
    spend: float
    impressions: int
    clicks: int
    conversions: float
    revenue: float
    budget_exhausted: float
    is_mature: bool


class CampaignMetricsResponse(BaseModel):
    campaign_id: str
    campaign_name: str
    metrics: list[DailyMetricOut] = []
    analysis_status: Optional[str] = None
    current_cpa: Optional[float] = None
    target_cpa: Optional[float] = None
    confidence: Optional[float] = None
    estimated_waste: float = 0.0
    reasons: Optional[list[str]] = None


# ── Diagnostics ──────────────────────────────────────────────────────────────
class DiagnosticSuggestion(BaseModel):
    category: str
    issue: str
    suggestion: str
    estimated_impact: str  # High | Medium | Low
    difficulty: str  # Easy | Medium | Hard


class DiagnosticResponse(_Orm):
    id: str
    campaign_id: str
    requested_at: datetime
    health_score: Optional[float] = None
    primary_bottleneck: Optional[str] = None
    suggestions: list[DiagnosticSuggestion] = []


# ── Recommendations ──────────────────────────────────────────────────────────
class RecommendationOut(_Orm):
    id: str
    type: str
    from_campaign_id: str
    from_campaign_name: Optional[str] = None
    to_campaign_id: Optional[str] = None
    to_campaign_name: Optional[str] = None
    shift_percent: float
    amount_per_day: float
    expected_gain_low: Optional[float] = None
    expected_gain_high: Optional[float] = None
    confidence: Optional[float] = None
    reasons: Optional[list[str]] = None
    status: str
    created_at: datetime
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None


class DecisionRequest(BaseModel):
    action: Literal["approve", "dismiss", "snooze"]
    reason: Optional[str] = None
    decided_by: Optional[str] = None


# ── Simulator ────────────────────────────────────────────────────────────────
class SimulatorControlRequest(BaseModel):
    command: Literal["play", "pause", "speed", "jump", "reset"]
    value: Optional[float] = None  # speed multiplier or day number


class SimulatorScenarioRequest(BaseModel):
    scenario: Literal["sudden_failure", "lag_spike", "reset_seed"]
    campaign_id: Optional[str] = None


class SimulatorState(BaseModel):
    is_playing: bool = False
    speed: float = 1.0
    current_day: int = 0
    current_date: Optional[str] = None


# ── Settings ─────────────────────────────────────────────────────────────────
class SettingsOut(_Orm):
    min_days: int = 14
    min_spend: float = 10_000.0
    spend_multiple_of_target_cpa: float = 10.0
    min_clicks: int = 100
    maturity_days: int = 3
    flag_cpa_ratio: float = 1.5
    confidence_threshold: float = 0.80
    shift_percent: float = 25.0
    recheck_days: int = 7
    saturation_tolerance: float = 0.20


class SettingsUpdate(BaseModel):
    min_days: Optional[int] = None
    min_spend: Optional[float] = None
    spend_multiple_of_target_cpa: Optional[float] = None
    min_clicks: Optional[int] = None
    maturity_days: Optional[int] = None
    flag_cpa_ratio: Optional[float] = None
    confidence_threshold: Optional[float] = None
    shift_percent: Optional[float] = None
    recheck_days: Optional[int] = None
    saturation_tolerance: Optional[float] = None


# ── Audit ────────────────────────────────────────────────────────────────────
class AuditLogOut(_Orm):
    id: str
    user_id: Optional[str] = None
    action: str
    object_type: Optional[str] = None
    object_id: Optional[str] = None
    details: Optional[dict] = None
    created_at: datetime


# ── CSV ──────────────────────────────────────────────────────────────────────
class CSVUploadResponse(BaseModel):
    status: str = "ok"
    rows_imported: int = 0
    campaigns_found: list[str] = []
    warnings: list[str] = []


# ── SSE ──────────────────────────────────────────────────────────────────────
class SSEEvent(BaseModel):
    event: str  # "tick" | "alert" | "state_change"
    data: dict = {}


# ── Alerts ───────────────────────────────────────────────────────────────────
class AlertOut(_Orm):
    id: str
    campaign_id: Optional[str] = None
    level: str = "info"
    message: str
    created_at: datetime
    read: bool = False


# ── Live Ad Account API ──────────────────────────────────────────────────────
class LiveConnectRequest(BaseModel):
    platform: Literal["google_ads", "meta_ads", "amazon_ads", "linkedin_ads"]
    developer_token: str
    access_token: Optional[str] = None
    account_id: str
    account_name: Optional[str] = None
    currency: str = "INR"
    target_cpa: Optional[float] = 500.0


class LiveSyncRequest(BaseModel):
    account_id: str
    days: int = 30


class LiveAccountStatus(BaseModel):
    connected: bool
    platform: Optional[str] = None
    account_id: Optional[str] = None
    account_name: Optional[str] = None
    last_synced_at: Optional[datetime] = None
    active_campaigns_count: int = 0
    total_spend_tracked: float = 0.0
    total_waste_detected: float = 0.0


# ── Followup ─────────────────────────────────────────────────────────────────
class ShiftFollowupOut(_Orm):
    id: str
    recommendation_id: str
    check_date: date
    receiving_cpa_before: Optional[float] = None
    receiving_cpa_after: Optional[float] = None
    result: Optional[str] = None
    next_step_suggested: Optional[str] = None
