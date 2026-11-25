const BASE_URL = "http://localhost:8000/api/v1";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// Dashboard
export function fetchDashboardSummary() {
  return request<import("./types").DashboardSummary>("/dashboard/summary");
}

// Campaigns
export function fetchCampaigns() {
  return request<import("./types").CampaignRow[]>("/campaigns");
}

export function fetchCampaignMetrics(id: string) {
  return request<import("./types").DailyMetric[]>(`/campaigns/${id}/metrics`);
}

export function diagnoseCampaign(id: string) {
  return request<import("./types").CampaignDiagnostic>(
    `/campaigns/${id}/diagnose`,
    { method: "POST" }
  );
}

// Recommendations
export function fetchRecommendations() {
  return request<import("./types").Recommendation[]>("/recommendations");
}

export function submitDecision(
  id: string,
  decision: "approve" | "dismiss" | "snooze",
  reason?: string
) {
  return request<{ success: boolean }>(`/recommendations/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}

// Simulator
export function simulatorControl(
  command: "play" | "pause" | "speed" | "jump" | "reset",
  value?: number
) {
  return request<import("./types").SimulatorState>("/simulator/control", {
    method: "POST",
    body: JSON.stringify({ command, value }),
  });
}

export function simulatorScenario(
  scenario: "sudden_failure" | "lag_spike" | "reset_seed"
) {
  return request<{ success: boolean }>("/simulator/scenario", {
    method: "POST",
    body: JSON.stringify({ scenario }),
  });
}

// Data Sources
export function uploadCSV(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${BASE_URL}/sources/csv`, {
    method: "POST",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  });
}

// Settings
export function fetchSettings() {
  return request<import("./types").Settings>("/settings");
}

export function updateSettings(settings: Partial<import("./types").Settings>) {
  return request<import("./types").Settings>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

// Audit
export function fetchAuditLog(page = 1, limit = 50) {
  return request<{ items: import("./types").AuditEntry[]; total: number }>(
    `/audit?page=${page}&limit=${limit}`
  );
}

// Impact / Shift followups
export function fetchShiftFollowups() {
  return request<import("./types").ShiftFollowup[]>("/recommendations/followups");
}

// Alerts
export function fetchAlerts() {
  return request<import("./types").Alert[]>("/alerts");
}
