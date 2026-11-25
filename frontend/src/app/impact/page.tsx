"use client";

import React, { useState, useEffect } from "react";
import { ShiftTracker } from "@/components/impact/ShiftTracker";
import type { ShiftFollowup } from "@/lib/types";
import { fetchShiftFollowups } from "@/lib/api";

const INITIAL_FOLLOWUPS: ShiftFollowup[] = [
  {
    id: "f-1",
    recommendation_id: "rec-shift-9812",
    check_date: "Oct 24, 2026",
    receiving_cpa_before: 740,
    receiving_cpa_after: 765,
    result: "Held",
    next_step_suggested: "Safe to absorb another 15% budget increment on next cycle.",
  },
  {
    id: "f-2",
    recommendation_id: "rec-shift-8419",
    check_date: "Oct 18, 2026",
    receiving_cpa_before: 810,
    receiving_cpa_after: 1045,
    result: "Saturated",
    next_step_suggested: "Recipient CPA rose >20%. Budget capped; revert shift or expand audience pool.",
  },
];

export default function ImpactPage() {
  const [followups, setFollowups] = useState<ShiftFollowup[]>(INITIAL_FOLLOWUPS);
  const [cumulativeWaste, setCumulativeWaste] = useState<number>(114800);

  useEffect(() => {
    fetchShiftFollowups()
      .then((res) => {
        if (res && res.length > 0) setFollowups(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#755937]">
            Screen 5 • Accountability & Post-Shift Verification
          </span>
        </div>
        <h1 className="font-headline text-[32px] font-semibold tracking-tight text-[#0B1C30]">
          Impact & Saturation Tracker
        </h1>
        <p className="font-sans text-[14px] text-[#45464D] max-w-3xl mt-1">
          Tracking the downstream effects of every approved budget reallocation. After 7 days, we audit the recipient campaign to ensure added spend did not induce diminishing returns or audience fatigue.
        </p>
      </div>

      <ShiftTracker
        followups={followups}
        cumulativeWasteAvoided={cumulativeWaste}
      />
    </div>
  );
}
