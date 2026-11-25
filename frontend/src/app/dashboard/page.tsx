"use client";

import React, { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import type { DashboardSummary, CampaignRow, Alert } from "@/lib/types";
import { fetchDashboardSummary, fetchCampaigns, fetchAlerts } from "@/lib/api";
import { connectSSE } from "@/lib/sse";
import {
  DollarSign,
  TrendingDown,
  Target,
  AlertOctagon,
  Layers,
} from "lucide-react";

// Initial seed mock data for smooth immediate hydration (Day 0 Baseline)
const INITIAL_SUMMARY: DashboardSummary = {
  today_spend: 0,
  total_spend: 0,
  total_conversions: 0,
  blended_cpa: 0,
  estimated_waste: 0,
  campaign_count: 6,
  underperforming_count: 0,
  current_day: 0,
  current_date: "Nov 1",
  is_playing: true,
  speed: 1,
};

const INITIAL_CAMPAIGNS: CampaignRow[] = [
  {
    id: "star-1",
    name: "The Star (High ROAS Scaler)",
    channel: "Google Search",
    status: "Strong",
    spend: 64200,
    conversions: 82,
    cpa: 782,
    target_cpa: 1200,
    daily_budget: 4500,
    trend: [820, 810, 795, 790, 785, 780, 782],
  },
  {
    id: "slow-burner-2",
    name: "The Slow Burner (Creative Fatigue)",
    channel: "Meta Feed",
    status: "Underperforming",
    spend: 52400,
    conversions: 24,
    cpa: 2183,
    target_cpa: 1200,
    daily_budget: 3800,
    trend: [1400, 1650, 1850, 1980, 2100, 2150, 2183],
  },
  {
    id: "saturator-3",
    name: "The Saturator (Audience Depleted)",
    channel: "Meta Stories",
    status: "Watch",
    spend: 48900,
    conversions: 35,
    cpa: 1397,
    target_cpa: 1200,
    daily_budget: 3500,
    trend: [1100, 1150, 1220, 1310, 1350, 1380, 1397],
  },
  {
    id: "lucky-streak-4",
    name: "The Lucky Streak (Early Volatility)",
    channel: "Google PMax",
    status: "Collecting Data",
    spend: 28400,
    conversions: 31,
    cpa: 916,
    target_cpa: 1200,
    daily_budget: 2000,
    trend: [600, 1400, 750, 1300, 820, 950, 916],
  },
  {
    id: "awareness-5",
    name: "Top-Funnel Brand Lift",
    channel: "YouTube Video",
    status: "Awareness",
    spend: 34500,
    conversions: 12,
    cpa: 2875,
    target_cpa: 3000,
    daily_budget: 2500,
    trend: [2900, 2850, 2920, 2800, 2850, 2890, 2875],
  },
  {
    id: "steady-6",
    name: "Core Catalog Evergreen",
    channel: "Google Shopping",
    status: "Healthy",
    spend: 29900,
    conversions: 31,
    cpa: 964,
    target_cpa: 1200,
    daily_budget: 2200,
    trend: [980, 970, 965, 950, 960, 955, 964],
  },
];

const INITIAL_TREND = [
  { date: "Oct 15", spend: 16500, cpa: 1050, isMature: true },
  { date: "Oct 16", spend: 17200, cpa: 1080, isMature: true },
  { date: "Oct 17", spend: 16900, cpa: 1110, isMature: true },
  { date: "Oct 18", spend: 18100, cpa: 1140, isMature: true },
  { date: "Oct 19", spend: 17800, cpa: 1120, isMature: true },
  { date: "Oct 20", spend: 18400, cpa: 1170, isMature: true },
  { date: "Oct 21", spend: 18900, cpa: 1190, isMature: true },
  { date: "Oct 22", spend: 19100, cpa: 1230, isMature: true },
  { date: "Oct 23", spend: 18800, cpa: 1210, isMature: true },
  { date: "Oct 24", spend: 19400, cpa: 1280, isMature: true },
  { date: "Oct 25", spend: 19200, cpa: 1310, isMature: true },
  { date: "Oct 26", spend: 18600, cpa: 1290, isMature: false },
  { date: "Oct 27", spend: 19000, cpa: 1350, isMature: false },
  { date: "Oct 28", spend: 18450, cpa: 1320, isMature: false },
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: "a-1",
    campaign_id: "slow-burner-2",
    level: "critical",
    message:
      "Campaign 'The Slow Burner' flagged Underperforming: 14 mature days satisfied, CPA ₹2,183 (1.82x target), estimated waste ₹42,650.",
    created_at: "10 mins ago",
    read: false,
  },
  {
    id: "a-2",
    campaign_id: "saturator-3",
    level: "warning",
    message:
      "Campaign 'The Saturator' entered Watch status: CPA trending up 16% over 7-day rolling window.",
    created_at: "1 hour ago",
    read: false,
  },
  {
    id: "a-3",
    campaign_id: "lucky-streak-4",
    level: "info",
    message:
      "Campaign 'The Lucky Streak' in observation: 8/14 days elapsed. Refusing to judge early volatility.",
    created_at: "2 hours ago",
    read: true,
  },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(INITIAL_SUMMARY);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(INITIAL_CAMPAIGNS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [trendData, setTrendData] = useState(INITIAL_TREND);

  // Initial fetch from backend with graceful fallback
  useEffect(() => {
    fetchDashboardSummary()
      .then((s) => setSummary(s))
      .catch(() => {});
    fetchCampaigns()
      .then((c) => setCampaigns(c))
      .catch(() => {});
    fetchAlerts()
      .then((a) => setAlerts(a))
      .catch(() => {});
  }, []);

  // SSE real-time stream subscription
  useEffect(() => {
    const cleanup = connectSSE((event) => {
      if (event.type === "tick" && event.data) {
        // Refresh summary or campaigns when tick arrives
        fetchDashboardSummary()
          .then((s) => setSummary(s))
          .catch(() => {});
      } else if (event.type === "alert" && event.data) {
        setAlerts((prev) => [event.data as unknown as Alert, ...prev]);
      } else if (event.type === "refresh") {
        fetchCampaigns().then(setCampaigns).catch(() => {});
      }
    });
    return cleanup;
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#755937]">
            Screen 2 • Live Operations
          </span>
        </div>
        <h1 className="font-headline text-[32px] font-semibold tracking-tight text-[#0B1C30]">
          Active Ad Campaign Operations & Waste Radar
        </h1>
        <p className="font-sans text-[14px] text-[#45464D] max-w-3xl mt-1">
          Evidence-grounded portfolio performance. System strictly withholds judgment until 14 mature observation days and minimum spend thresholds are satisfied.
        </p>
      </div>

      {/* Top Row: 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Daily Run-Rate"
          value={summary.today_spend}
          prefix="₹"
          subtitle="Spend today across 6 channels"
          icon={DollarSign}
        />
        <KPICard
          title="Total Period Spend"
          value={summary.total_spend}
          prefix="₹"
          subtitle="Cumulative evaluated spend"
          icon={Layers}
        />
        <KPICard
          title="Total Conversions"
          value={summary.total_conversions}
          subtitle="Attributed conversions"
          icon={Target}
        />
        <KPICard
          title="Blended CPA"
          value={summary.blended_cpa}
          prefix="₹"
          subtitle="Target portfolio benchmark: ₹1,200"
          icon={TrendingDown}
          change={{ value: "+0.1% vs target", isPositive: true }}
        />
        {/* Estimated Waste Highlight Card */}
        <KPICard
          title="Estimated Waste So Far"
          value={summary.estimated_waste}
          prefix="₹"
          subtitle="Accumulated on 1 underperformer"
          variant="error"
          icon={AlertOctagon}
          change={{ value: "Action Required", isPositive: false }}
        />
      </div>

      {/* Performance Trajectory & Maturity Window Chart */}
      <TrendChart data={trendData} targetCpa={1200} />

      {/* Grid: Monitored Campaigns Table (2/3) + Real-Time Alert Feed (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CampaignTable campaigns={campaigns} />
        </div>
        <div className="lg:col-span-1">
          <AlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
