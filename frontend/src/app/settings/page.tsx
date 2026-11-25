"use client";

import React, { useState, useEffect } from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { Settings } from "@/lib/types";
import { fetchSettings, updateSettings } from "@/lib/api";

const DEFAULT_SETTINGS: Settings = {
  organization_id: "org-default",
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
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        if (s) setSettings(s);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (updated: Partial<Settings>) => {
    try {
      const res = await updateSettings(updated);
      if (res) setSettings(res);
    } catch {
      // Local state fallback
      setSettings((prev) => ({ ...prev, ...updated }));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#755937]">
            Screen 6 • Analytical Governance
          </span>
        </div>
        <h1 className="font-headline text-[32px] font-semibold tracking-tight text-[#0B1C30]">
          Rules & Evidence Thresholds
        </h1>
        <p className="font-sans text-[14px] text-[#45464D] max-w-3xl mt-1">
          Configure the mathematical and temporal parameters governing when Ad Waste Finder triggers warnings, computes wasted capital, and issues 25% budget reallocations.
        </p>
      </div>

      <SettingsForm initialSettings={settings} onSave={handleSave} />
    </div>
  );
}
