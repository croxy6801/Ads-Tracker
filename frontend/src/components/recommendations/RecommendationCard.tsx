"use client";

import React, { useState } from "react";
import type { Recommendation } from "@/lib/types";
import { ArrowRight, Check, X, Clock, Sparkles, AlertCircle } from "lucide-react";
import { WhatIfSlider } from "./WhatIfSlider";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApprove: (id: string, shiftPercent: number) => Promise<void>;
  onDismiss: (id: string, reason: string) => Promise<void>;
  onSnooze: (id: string) => Promise<void>;
  onViewImprovements?: (campaignId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onApprove,
  onDismiss,
  onSnooze,
  onViewImprovements,
}) => {
  const [shiftPercent, setShiftPercent] = useState<number>(
    recommendation.shift_percent || 25
  );
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const [dismissReason, setDismissReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(recommendation.id, shiftPercent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismissSubmit = async () => {
    if (!dismissReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onDismiss(recommendation.id, dismissReason);
      setIsDismissing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#D3E4FE] rounded-[4px] p-6 shadow-sm space-y-5 transition-all">
      {/* Transfer Equation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#C6C6CD] gap-3">
        <div className="flex items-center gap-2 flex-wrap text-[15px] font-sans font-semibold">
          <span className="px-2.5 py-1 bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB] rounded-[4px]">
            {recommendation.from_campaign_name || recommendation.from_campaign_id}
          </span>
          <div className="flex items-center gap-1.5 text-[#0F172A] px-2 font-mono text-[13px]">
            <span>──</span>
            <span className="font-bold">₹{recommendation.amount_per_day.toLocaleString()} / day</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-[4px]">
            {recommendation.to_campaign_name || recommendation.to_campaign_id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#E5EEFF] text-[#0F172A]">
            {Math.round(recommendation.confidence * 100)}% Confidence
          </span>
        </div>
      </div>

      {/* Explanatory breakdown & reasoning */}
      <div className="space-y-2">
        <h4 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-[#45464D]">
          Mathematical Evidence & Context:
        </h4>
        <ul className="space-y-1.5 font-sans text-[13px] text-[#0B1C30]">
          {recommendation.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#755937] mt-2 shrink-0" />
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cross-channel assistance warning */}
      <div className="flex items-start gap-2 p-3 bg-[#FFFBF5] border border-[#FDE68A] rounded-[4px] text-[12px] font-sans text-[#755937]">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#92400E]" />
        <div>
          <span className="font-semibold text-[#92400E]">Assisted Conversion Note: </span>
          The source campaign may contribute top-of-funnel touchpoints. We recommend a conservative 25% shift rather than a full pause to preserve organic baseline.
        </div>
      </div>

      {/* What-If Slider */}
      <WhatIfSlider
        value={shiftPercent}
        onChange={setShiftPercent}
        baseAmount={recommendation.amount_per_day}
        expectedGainLow={recommendation.expected_gain_low}
        expectedGainHigh={recommendation.expected_gain_high}
      />

      {/* Dismissal Prompt */}
      {isDismissing && (
        <div className="p-3 bg-[#EFF4FF] border border-[#C6C6CD] rounded-[4px] space-y-2">
          <label className="block text-[12px] font-sans font-semibold text-[#0B1C30]">
            Mandatory Dismissal Justification (Logged to Audit Ledger):
          </label>
          <input
            type="text"
            placeholder="e.g. Seasonal brand awareness push running until next week"
            value={dismissReason}
            onChange={(e) => setDismissReason(e.target.value)}
            className="w-full text-[13px] font-sans p-2 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsDismissing(false)}
              className="px-3 py-1 text-[12px] font-sans font-medium text-[#45464D] hover:bg-gray-200 rounded-[4px]"
            >
              Cancel
            </button>
            <button
              onClick={handleDismissSubmit}
              disabled={!dismissReason.trim() || isSubmitting}
              className="px-3 py-1 text-[12px] font-sans font-semibold text-white bg-[#BA1A1A] hover:bg-red-800 rounded-[4px] disabled:opacity-50"
            >
              Confirm Dismissal
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isDismissing && (
        <div className="flex flex-wrap items-center justify-between pt-2 gap-3 border-t border-[#E5EEFF]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] hover:bg-[#131B2E] text-white rounded-[4px] font-sans text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Approve Shift ({shiftPercent}%)</span>
            </button>

            {onViewImprovements && (
              <button
                onClick={() => onViewImprovements(recommendation.from_campaign_id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#EFF4FF] hover:bg-[#DCE9FF] text-[#0F172A] border border-[#B9C7E0] rounded-[4px] font-sans text-[13px] font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#755937]" />
                <span>View Improvement Ideas First</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSnooze(recommendation.id)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-sans font-medium text-[#45464D] hover:text-[#0B1C30] hover:bg-[#EFF4FF] rounded-[4px] transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze (7 Days)</span>
            </button>

            <button
              onClick={() => setIsDismissing(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-sans font-medium text-[#BA1A1A] hover:bg-[#FFDAD6] rounded-[4px] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
