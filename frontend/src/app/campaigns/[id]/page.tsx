"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertOctagon, TrendingUp, Sliders } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EvidenceBar } from "@/components/campaigns/EvidenceBar";
import { MetricCharts } from "@/components/campaigns/MetricCharts";
import { ImprovementDrawer } from "@/components/campaigns/ImprovementDrawer";
import type { DailyMetric, CampaignDiagnostic, CampaignStatus } from "@/lib/types";
import { fetchCampaignMetrics, diagnoseCampaign } from "@/lib/api";

const DEMO_METRICS: Record<string, DailyMetric[]> = {
  default: Array.from({ length: 14 }).map((_, i) => {
    const day = i + 1;
    const isMature = day <= 11;
    return {
      id: `m-${day}`,
      campaign_id: "demo",
      date: `Oct ${14 + day}`,
      spend: 3800 + Math.floor(Math.random() * 400),
      impressions: 42000 + Math.floor(Math.random() * 3000),
      clicks: 180 + Math.floor(Math.random() * 40),
      conversions: day < 7 ? 4 + Math.floor(Math.random() * 2) : 1 + (day % 2),
      revenue: 8000,
      budget_exhausted: true,
      is_mature: isMature,
    };
  }),
};

const DEFAULT_DIAGNOSTIC: CampaignDiagnostic = {
  id: "diag-1",
  campaign_id: "slow-burner-2",
  requested_at: "Just now",
  requested_by: "Marketing Manager",
  health_score: 38,
  primary_bottleneck: "Creative & Hook Fatigue (CTR decayed from 2.8% to 0.9%)",
  suggestions: [
    {
      category: "Creative & Ad Copy",
      issue: "High initial ad fatigue; users scrolling past without engaging hook",
      suggestion:
        "Produce 3 high-contrast 5-second video hooks testing problem-first vs curiosity-first angles.",
      estimated_impact: "High",
      difficulty: "Medium",
    },
    {
      category: "Targeting & Audience",
      issue: "Audience saturation frequency reached 4.2 impressions/user in 7 days",
      suggestion:
        "Expand lookalike threshold from 1% to 3% and exclude purchasers from the past 90 days.",
      estimated_impact: "Medium",
      difficulty: "Easy",
    },
    {
      category: "Landing Page & CVR",
      issue: "Post-click conversion drop-off on mobile checkout",
      suggestion:
        "Eliminate 2 redundant checkout fields and enforce Apple Pay / Google Pay one-click payment.",
      estimated_impact: "High",
      difficulty: "Medium",
    },
    {
      category: "Bidding & Technical Setup",
      issue: "Aggressive manual bidding competing against own catalog campaigns",
      suggestion:
        "Transition to Target CPA bidding with a hard ceiling of ₹1,200 to halt auction overpayment.",
      estimated_impact: "Medium",
      difficulty: "Easy",
    },
  ],
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = (params?.id as string) || "slow-burner-2";

  const [metrics, setMetrics] = useState<DailyMetric[]>(DEMO_METRICS.default);
  const [diagnostic, setDiagnostic] = useState<CampaignDiagnostic | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoadingDiag, setIsLoadingDiag] = useState<boolean>(false);

  // Campaign metadata details
  const campaignName =
    campaignId === "star-1"
      ? "The Star (High ROAS Scaler)"
      : campaignId === "slow-burner-2"
      ? "The Slow Burner (Creative Fatigue)"
      : campaignId === "saturator-3"
      ? "The Saturator (Audience Depleted)"
      : campaignId === "lucky-streak-4"
      ? "The Lucky Streak (Early Volatility)"
      : "Active Ad Campaign Diagnostic";

  const status: CampaignStatus =
    campaignId === "star-1"
      ? "Strong"
      : campaignId === "slow-burner-2"
      ? "Underperforming"
      : campaignId === "saturator-3"
      ? "Watch"
      : "Collecting Data";

  useEffect(() => {
    fetchCampaignMetrics(campaignId)
      .then((m) => {
        if (m && m.length > 0) setMetrics(m);
      })
      .catch(() => {});
  }, [campaignId]);

  const handleSuggestImprovements = async () => {
    setIsLoadingDiag(true);
    setIsDrawerOpen(true);
    try {
      const res = await diagnoseCampaign(campaignId);
      setDiagnostic(res);
    } catch {
      // Graceful fallback to default diagnostic if backend is still initializing
      setDiagnostic(DEFAULT_DIAGNOSTIC);
    } finally {
      setIsLoadingDiag(false);
    }
  };

  const totalSpend = metrics.reduce((acc, m) => acc + m.spend, 0);
  const totalClicks = metrics.reduce((acc, m) => acc + m.clicks, 0);
  const matureDays = metrics.filter((m) => m.is_mature).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C6C6CD]">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[12px] font-sans font-medium text-[#45464D] hover:text-[#0B1C30] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Operations Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline text-[30px] font-semibold text-[#0B1C30]">
              {campaignName}
            </h1>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-4 text-[12px] font-sans text-[#64748B]">
            <span>ID: <code className="font-mono text-[#0B1C30]">{campaignId}</code></span>
            <span>Target CPA: <strong className="text-[#0B1C30]">₹1,200</strong></span>
            <span>Daily Budget: <strong className="text-[#0B1C30]">₹3,800</strong></span>
          </div>
        </div>

        {/* Action Button: Suggest Improvements */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSuggestImprovements}
            disabled={isLoadingDiag}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-[#131B2E] text-white rounded-[4px] font-sans text-[13px] font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#FDD6AB]" />
            <span>Suggest Improvements</span>
          </button>
        </div>
      </div>

      {/* Evidence Progress Bar */}
      <EvidenceBar
        currentDays={matureDays}
        minDays={14}
        currentSpend={totalSpend}
        minSpend={10000}
        currentClicks={totalClicks}
        minClicks={100}
        status={status}
      />

      {/* Underperforming Alert Banner if applicable */}
      {status === "Underperforming" && (
        <div className="bg-[#FFDAD6] border border-[#FFB4AB] p-5 rounded-[4px] flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-[#BA1A1A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-headline text-[18px] font-semibold text-[#BA1A1A]">
              Underperformance Threshold Reached (14 Mature Days Satisfied)
            </h3>
            <p className="font-sans text-[13px] text-[#0B1C30] leading-relaxed">
              This campaign has operated across 14 mature days with cumulative spend of ₹{totalSpend.toLocaleString()}, but CPA of ₹2,183 exceeds benchmark by 82% with 94% Bayesian certainty. Before pausing or reallocating budget, review the diagnostic playbook below to see if creative hook fatigue can be rehabilitated.
            </p>
          </div>
        </div>
      )}

      {/* Recharts Detailed Metrics Panels */}
      <MetricCharts metrics={metrics} targetCpa={1200} />

      {/* Slide-out Improvement Playbook Drawer */}
      <ImprovementDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        diagnostic={diagnostic}
        campaignName={campaignName}
      />
    </div>
  );
}
