"use client";

import React from "react";
import { Clock, DollarSign, MousePointer, ShieldAlert } from "lucide-react";

interface EvidenceBarProps {
  currentDays: number;
  minDays?: number;
  currentSpend: number;
  minSpend?: number;
  currentClicks: number;
  minClicks?: number;
  status: string;
}

export const EvidenceBar: React.FC<EvidenceBarProps> = ({
  currentDays,
  minDays = 14,
  currentSpend,
  minSpend = 10000,
  currentClicks,
  minClicks = 100,
  status,
}) => {
  const dayProgress = Math.min(100, Math.round((currentDays / minDays) * 100));
  const spendProgress = Math.min(100, Math.round((currentSpend / minSpend) * 100));
  const clickProgress = Math.min(100, Math.round((currentClicks / minClicks) * 100));

  const allMet =
    currentDays >= minDays && currentSpend >= minSpend && currentClicks >= minClicks;

  return (
    <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#C6C6CD] gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#755937]" />
          <h3 className="font-headline text-[18px] font-semibold text-[#0B1C30]">
            Statistical Evidence & Maturity Gauge
          </h3>
        </div>
        <div className="text-[12px] font-sans font-medium text-[#45464D]">
          {allMet ? (
            <span className="text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-[4px]">
              ✓ Full Statistical Significance Achieved
            </span>
          ) : (
            <span className="text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 rounded-[4px]">
              Collecting Evidence — System Refuses to Judge Prematurely
            </span>
          )}
        </div>
      </div>

      <p className="font-sans text-[13px] text-[#45464D] mb-5">
        To protect against volatile day-to-day fluctuations, Ad Waste Finder mandates three strict observation gates before flagging underperformance:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gate 1: Days */}
        <div className="p-3.5 bg-[#EFF4FF] border border-[#C6C6CD] rounded-[4px]">
          <div className="flex items-center justify-between text-[12px] font-sans font-semibold text-[#0B1C30] mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0F172A]" />
              Observation Days
            </span>
            <span className="font-mono text-[#45464D]">
              {currentDays} / {minDays} d
            </span>
          </div>
          <div className="w-full bg-[#D3E4FE] h-2 rounded-[2px] overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-500 rounded-[2px] ${
                currentDays >= minDays ? "bg-[#10B981]" : "bg-[#0F172A]"
              }`}
              style={{ width: `${dayProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-sans text-[#64748B]">
            {currentDays >= minDays
              ? "✓ Threshold satisfied"
              : `${minDays - currentDays} more mature days required`}
          </span>
        </div>

        {/* Gate 2: Spend */}
        <div className="p-3.5 bg-[#EFF4FF] border border-[#C6C6CD] rounded-[4px]">
          <div className="flex items-center justify-between text-[12px] font-sans font-semibold text-[#0B1C30] mb-1">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#0F172A]" />
              Cumulative Spend
            </span>
            <span className="font-mono text-[#45464D]">
              ₹{currentSpend.toLocaleString()} / ₹{minSpend.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-[#D3E4FE] h-2 rounded-[2px] overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-500 rounded-[2px] ${
                currentSpend >= minSpend ? "bg-[#10B981]" : "bg-[#0F172A]"
              }`}
              style={{ width: `${spendProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-sans text-[#64748B]">
            {currentSpend >= minSpend
              ? "✓ Minimum capital threshold met"
              : `₹${(minSpend - currentSpend).toLocaleString()} spend remaining`}
          </span>
        </div>

        {/* Gate 3: Clicks */}
        <div className="p-3.5 bg-[#EFF4FF] border border-[#C6C6CD] rounded-[4px]">
          <div className="flex items-center justify-between text-[12px] font-sans font-semibold text-[#0B1C30] mb-1">
            <span className="flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-[#0F172A]" />
              Sample Clicks
            </span>
            <span className="font-mono text-[#45464D]">
              {currentClicks} / {minClicks}
            </span>
          </div>
          <div className="w-full bg-[#D3E4FE] h-2 rounded-[2px] overflow-hidden my-2">
            <div
              className={`h-full transition-all duration-500 rounded-[2px] ${
                currentClicks >= minClicks ? "bg-[#10B981]" : "bg-[#0F172A]"
              }`}
              style={{ width: `${clickProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-sans text-[#64748B]">
            {currentClicks >= minClicks
              ? "✓ Minimum sample size valid"
              : `${minClicks - currentClicks} more clicks needed for Bayesian confidence`}
          </span>
        </div>
      </div>
    </div>
  );
};
