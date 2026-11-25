"use client";

import React from "react";
import type { ShiftFollowup } from "@/lib/types";
import { CheckCircle2, AlertTriangle, ArrowRight, TrendingDown } from "lucide-react";

interface ShiftTrackerProps {
  followups: ShiftFollowup[];
  cumulativeWasteAvoided: number;
}

export const ShiftTracker: React.FC<ShiftTrackerProps> = ({
  followups,
  cumulativeWasteAvoided,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Cumulative waste avoided counter */}
      <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-6 rounded-[4px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#065F46]">
            Cumulative Capital Salvaged
          </span>
          <h2 className="font-headline text-[32px] font-bold text-[#065F46] mt-0.5">
            ₹{cumulativeWasteAvoided.toLocaleString()}
          </h2>
          <p className="font-sans text-[13px] text-[#065F46]/80 mt-1">
            Total marketing spend redirected from failing campaigns to profitable growth channels.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-white/70 border border-[#A7F3D0] rounded-[4px]">
          <TrendingDown className="w-5 h-5 text-[#065F46]" />
          <div className="text-[12px] font-sans">
            <span className="font-semibold text-[#0B1C30] block">
              7-Day Saturation Check Policy
            </span>
            <span className="text-[#45464D]">
              Budgets auto-freeze if recipient CPA degrades by &gt; 20%
            </span>
          </div>
        </div>
      </div>

      {/* Follow-up audit table */}
      <div className="bg-white border border-[#C6C6CD] rounded-[4px] overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#C6C6CD]">
          <h3 className="font-headline text-[20px] font-semibold text-[#0B1C30]">
            7-Day Post-Shift Audit Ledger
          </h3>
          <p className="font-sans text-[13px] text-[#45464D]">
            Verification of recipient campaign cost-per-acquisition to detect audience saturation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-[13px]">
            <thead>
              <tr className="bg-[#D3E4FE] text-[#0B1C30] font-semibold border-b border-[#C6C6CD]">
                <th className="py-3 px-4">Shift Reference</th>
                <th className="py-3 px-4">Audit Date</th>
                <th className="py-3 px-4 text-right">Recipient CPA Before</th>
                <th className="py-3 px-4 text-center">Outcome</th>
                <th className="py-3 px-4 text-right">Recipient CPA After</th>
                <th className="py-3 px-4">Saturation Verdict</th>
                <th className="py-3 px-4">Next Suggested Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EEFF] text-[#0B1C30]">
              {followups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    No approved shifts ready for 7-day saturation audit yet.
                  </td>
                </tr>
              ) : (
                followups.map((f) => {
                  const isHeld = f.result === "Held";
                  return (
                    <tr key={f.id} className="hover:bg-[#EFF4FF] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-[#0F172A]">
                        {f.recommendation_id.slice(0, 8)}...
                      </td>
                      <td className="py-3.5 px-4 text-[#45464D]">{f.check_date}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        ₹{f.receiving_cpa_before.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <ArrowRight className="w-3.5 h-3.5 inline text-[#76777D]" />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        ₹{f.receiving_cpa_after.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {isHeld ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[12px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Held (Healthy)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#FDD6AB] text-[#5B4222] border border-[#E5C096] text-[12px] font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#755937]" />
                            <span>Saturated (&gt;20% CPA Rise)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#45464D] font-medium">
                        {f.next_step_suggested}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
