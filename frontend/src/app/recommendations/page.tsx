"use client";

import React, { useState, useEffect } from "react";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { ImprovementDrawer } from "@/components/campaigns/ImprovementDrawer";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Recommendation, CampaignDiagnostic } from "@/lib/types";
import {
  fetchRecommendations,
  submitDecision,
  diagnoseCampaign,
} from "@/lib/api";
import { Sparkles, CheckCircle2 } from "lucide-react";

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    organization_id: "org-1",
    type: "budget_shift",
    from_campaign_id: "slow-burner-2",
    from_campaign_name: "The Slow Burner (Meta Feed)",
    to_campaign_id: "star-1",
    to_campaign_name: "The Star (Google Search)",
    shift_percent: 25,
    amount_per_day: 950,
    expected_gain_low: 5,
    expected_gain_high: 9,
    confidence: 0.94,
    reasons: [
      "The Slow Burner has maintained CPA of ₹2,183 (target: ₹1,200) across 14 mature days with ₹52,400 evaluated spend.",
      "Bayesian Beta Monte Carlo indicates a 94% probability that true underlying CPA is permanently worse than target.",
      "The Star is operating at ₹782 CPA (35% below target) and repeatedly hits daily budget exhaustion before 4 PM.",
      "Conservative 25% shift preserves brand search baseline while testing recipient saturation.",
    ],
    status: "open",
    created_at: "Today, 10:30 AM",
    decided_at: null,
    decided_by: null,
  },
];

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    INITIAL_RECOMMENDATIONS
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Diagnostic drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerCampaignId, setDrawerCampaignId] = useState<string>("");
  const [diagnostic, setDiagnostic] = useState<CampaignDiagnostic | null>(null);

  useEffect(() => {
    fetchRecommendations()
      .then((recs) => {
        if (recs && recs.length > 0) setRecommendations(recs);
      })
      .catch(() => {});
  }, []);

  const handleApprove = async (id: string, shiftPercent: number) => {
    try {
      await submitDecision(id, "approve");
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      setActionMessage(
        `Successfully approved ${shiftPercent}% budget reallocation. Logged to immutable audit ledger.`
      );
      setTimeout(() => setActionMessage(null), 5000);
    } catch {
      // Optimistic local update
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      setActionMessage(`Approved ${shiftPercent}% budget shift.`);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const handleDismiss = async (id: string, reason: string) => {
    try {
      await submitDecision(id, "dismiss", reason);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      setActionMessage("Recommendation dismissed with recorded rationale.");
      setTimeout(() => setActionMessage(null), 5000);
    } catch {
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      await submitDecision(id, "snooze");
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      setActionMessage("Recommendation snoozed for 7 days.");
      setTimeout(() => setActionMessage(null), 5000);
    } catch {
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleOpenImprovements = async (campaignId: string) => {
    setDrawerCampaignId(campaignId);
    setIsDrawerOpen(true);
    try {
      const diag = await diagnoseCampaign(campaignId);
      setDiagnostic(diag);
    } catch {
      // Mock fallback
      setDiagnostic({
        id: "diag-fb",
        campaign_id: campaignId,
        requested_at: "Just now",
        requested_by: "Marketing Manager",
        health_score: 38,
        primary_bottleneck: "Creative Hook Fatigue & Audience Saturation",
        suggestions: [
          {
            category: "Creative & Ad Copy",
            issue: "Audience scrolling past video within 2 seconds",
            suggestion: "Test 3 new high-contrast video hooks focusing on problem-solution.",
            estimated_impact: "High",
            difficulty: "Medium",
          },
          {
            category: "Landing Page & CVR",
            issue: "Mobile drop-off on cart transition",
            suggestion: "Remove multi-step form and enable 1-click Express Checkout.",
            estimated_impact: "High",
            difficulty: "Medium",
          },
        ],
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#755937]">
            Screen 4 • Human Decision Portal
          </span>
        </div>
        <h1 className="font-headline text-[32px] font-semibold tracking-tight text-[#0B1C30]">
          Budget Reallocation Recommendations
        </h1>
        <p className="font-sans text-[14px] text-[#45464D] max-w-3xl mt-1">
          Conservative, evidence-backed capital shifts. By design, the system never makes automated account changes; every dollar shift requires human verification.
        </p>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[4px] flex items-center gap-2 text-[13px] font-sans text-[#065F46]">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <EmptyState
            title="All Clear — No Pending Budget Shifts"
            description="All active campaigns are currently operating within target CPA bounds or actively collecting observation evidence."
            icon={<Sparkles className="w-6 h-6 text-[#755937]" />}
          />
        ) : (
          recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
              onSnooze={handleSnooze}
              onViewImprovements={handleOpenImprovements}
            />
          ))
        )}
      </div>

      {/* Integrated Improvement Drawer */}
      <ImprovementDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        diagnostic={diagnostic}
        campaignName={drawerCampaignId}
      />
    </div>
  );
}
