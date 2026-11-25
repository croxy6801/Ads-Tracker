"use client";

import React, { useState } from "react";
import type { Settings } from "@/lib/types";
import { Check, RotateCcw } from "lucide-react";

interface SettingsFormProps {
  initialSettings: Settings;
  onSave: (settings: Partial<Settings>) => Promise<void>;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialSettings,
  onSave,
}) => {
  const [form, setForm] = useState<Settings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (key: keyof Settings, val: number) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      organization_id: initialSettings.organization_id,
      min_days: 14,
      min_spend: 10000,
      spend_multiple_of_target_cpa: 10,
      min_clicks: 100,
      maturity_days: 3,
      flag_cpa_ratio: 1.5,
      confidence_threshold: 0.8,
      shift_percent: 25,
      recheck_days: 7,
      saturation_tolerance: 0.2,
    });
    setSavedSuccess(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-headline text-[20px] font-semibold text-[#0B1C30]">
            Statistical Confidence & Evidence Gates
          </h3>
          <p className="font-sans text-[13px] text-[#45464D]">
            Parameters governing when the system classifies underperformance and estimates capital waste
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
          {/* Observation Days */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Minimum Observation Window (Days)
            </label>
            <input
              type="number"
              min="7"
              max="60"
              value={form.min_days}
              onChange={(e) => handleChange("min_days", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 14 days. Protects against early volatile days.
            </span>
          </div>

          {/* Maturity Exclusion */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Attribution Lag Shading Window (Days)
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={form.maturity_days}
              onChange={(e) => handleChange("maturity_days", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 3 days. Most recent days excluded from CPA evaluation.
            </span>
          </div>

          {/* Minimum Spend */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Minimum Cumulative Spend Threshold (₹)
            </label>
            <input
              type="number"
              step="500"
              value={form.min_spend}
              onChange={(e) => handleChange("min_spend", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: ₹10,000. Prevents judging low-budget test campaigns.
            </span>
          </div>

          {/* Minimum Clicks */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Minimum Sample Size (Clicks)
            </label>
            <input
              type="number"
              step="10"
              value={form.min_clicks}
              onChange={(e) => handleChange("min_clicks", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 100 clicks. Required for statistical Beta sampling.
            </span>
          </div>

          {/* CPA Flag Ratio */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              CPA Flag Multiplier (Relative to Target Benchmark)
            </label>
            <input
              type="number"
              step="0.1"
              value={form.flag_cpa_ratio}
              onChange={(e) => handleChange("flag_cpa_ratio", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 1.5x. Triggers flag when mature CPA &gt; 150% of target.
            </span>
          </div>

          {/* Bayesian Confidence */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Bayesian Confidence Threshold (Beta Monte Carlo)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="0.99"
              value={form.confidence_threshold}
              onChange={(e) => handleChange("confidence_threshold", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 0.80 (80%). P(Implied CPA &gt; Benchmark) required.
            </span>
          </div>
        </div>
      </div>

      {/* Reallocation & Saturation Rules */}
      <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-headline text-[20px] font-semibold text-[#0B1C30]">
            Budget Reallocation & Saturation Guards
          </h3>
          <p className="font-sans text-[13px] text-[#45464D]">
            Conservative budget shift sizing and post-shift audit guardrails
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Standard Shift Sizing (%)
            </label>
            <input
              type="number"
              value={form.shift_percent}
              onChange={(e) => handleChange("shift_percent", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 25% of failing campaign's daily spend.
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Post-Shift Audit Interval (Days)
            </label>
            <input
              type="number"
              value={form.recheck_days}
              onChange={(e) => handleChange("recheck_days", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 7 days before evaluating recipient CPA delta.
            </span>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#0B1C30] mb-1">
              Saturation CPA Tolerance
            </label>
            <input
              type="number"
              step="0.05"
              value={form.saturation_tolerance}
              onChange={(e) => handleChange("saturation_tolerance", Number(e.target.value))}
              className="w-full text-[13px] p-2.5 border border-[#C6C6CD] rounded-[4px] bg-white focus:outline-hidden focus:border-[#0F172A]"
            />
            <span className="text-[11px] text-[#64748B] mt-1 block">
              Default: 0.20 (20%). Flags saturation if CPA increases &gt;20%.
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#C6C6CD] bg-white text-[#45464D] hover:bg-[#EFF4FF] rounded-[4px] font-sans text-[13px] font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-[#76777D]" />
          <span>Reset to Defaults</span>
        </button>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-[#065F46] font-sans text-[13px] font-medium flex items-center gap-1">
              <Check className="w-4 h-4 text-[#10B981]" />
              Settings updated successfully & logged to audit ledger.
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0F172A] hover:bg-[#131B2E] text-white rounded-[4px] font-sans text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <span>Save Analytical Rules</span>
          </button>
        </div>
      </div>
    </form>
  );
};
