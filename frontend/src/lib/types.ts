// Shared TypeScript interfaces matching backend schemas

export interface Organization {
  id: string;
  name: string;
  currency: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  data_source_id: string;
  name: string;
  channel: string;
  goal_type: string;
  target_cpa: number;
  target_roas: number | null;
  daily_budget: number;
  start_date: string;
  status: CampaignStatus;
  created_at: string;
}

export type CampaignStatus =
  | "Collecting Data"
  | "Healthy"
  | "Watch"
  | "Underperforming"
  | "Strong"
  | "Saturated"
  | "Awareness";

export interface DailyMetric {
  id: string;
  campaign_id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  budget_exhausted: boolean;
  is_mature: boolean;
}

export interface AnalysisSnapshot {
  id: string;
  campaign_id: string;
  as_of_date: string;
  cpa: number;
  roas: number | null;
  cvr: number;
  confidence_worse_than_benchmark: number;
  status: CampaignStatus;
  estimated_waste: number;
  reasons: string[];
}

export interface Recommendation {
  id: string;
  organization_id: string;
  type: string;
  from_campaign_id: string;
  from_campaign_name?: string;
  to_campaign_id: string;
  to_campaign_name?: string;
  shift_percent: number;
  amount_per_day: number;
  expected_gain_low: number;
  expected_gain_high: number;
  confidence: number;
  reasons: string[];
  status: "open" | "approved" | "dismissed" | "snoozed";
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface DiagnosticSuggestion {
  category: string;
  issue: string;
  suggestion: string;
  estimated_impact: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface CampaignDiagnostic {
  id: string;
  campaign_id: string;
  requested_at: string;
  requested_by: string;
  health_score: number;
  primary_bottleneck: string;
  suggestions: DiagnosticSuggestion[];
}

export interface ShiftFollowup {
  id: string;
  recommendation_id: string;
  check_date: string;
  receiving_cpa_before: number;
  receiving_cpa_after: number;
  result: "Held" | "Saturated";
  next_step_suggested: string;
}

export interface Alert {
  id: string;
  campaign_id: string;
  level: "info" | "warning" | "critical";
  message: string;
  created_at: string;
  read: boolean;
}

export interface Settings {
  organization_id: string;
  min_days: number;
  min_spend: number;
  spend_multiple_of_target_cpa: number;
  min_clicks: number;
  maturity_days: number;
  flag_cpa_ratio: number;
  confidence_threshold: number;
  shift_percent: number;
  recheck_days: number;
  saturation_tolerance: number;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  object_type: string;
  object_id: string;
  details: string;
  created_at: string;
}

export interface DashboardSummary {
  today_spend: number;
  total_spend: number;
  total_conversions: number;
  blended_cpa: number;
  estimated_waste: number;
  campaign_count: number;
  underperforming_count: number;
  current_day: number;
  current_date: string;
  is_playing: boolean;
  speed: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  channel: string;
  status: CampaignStatus;
  spend: number;
  conversions: number;
  cpa: number;
  target_cpa: number;
  daily_budget: number;
  trend: number[];
}

export interface SimulatorState {
  is_playing: boolean;
  speed: number;
  current_day: number;
  current_date: string;
}

export interface SSEEvent {
  type: "tick" | "alert" | "status_change" | "recommendation" | "refresh";
  data: Record<string, unknown>;
}

export interface DataSource {
  id: string;
  organization_id: string;
  type: string;
  status: string;
  last_synced_at: string | null;
  config: Record<string, unknown>;
}
