"use client";

import React from "react";

interface WhatIfSliderProps {
  value: number; // Percentage, 10 to 50
  onChange: (val: number) => void;
  baseAmount: number;
  expectedGainLow: number;
  expectedGainHigh: number;
}

export const WhatIfSlider: React.FC<WhatIfSliderProps> = ({
  value,
  onChange,
  baseAmount,
  expectedGainLow,
  expectedGainHigh,
}) => {
  // Scale expected conversions proportionally from 25% default
  const scale = value / 25;
  const currentAmount = Math.round((baseAmount / 25) * value);
  const adjustedGainLow = Math.round(expectedGainLow * scale);
  const adjustedGainHigh = Math.round(expectedGainHigh * scale);

  return (
    <div className="bg-[#EFF4FF] border border-[#C6C6CD] rounded-[4px] p-4 space-y-3">
      <div className="flex items-center justify-between text-[13px] font-sans">
        <span className="font-semibold text-[#0B1C30]">
          Interactive "What-If" Reallocation Sizing:
        </span>
        <span className="font-headline text-[17px] font-bold text-[#0F172A]">
          {value}% of daily budget (₹{currentAmount.toLocaleString()} / day)
        </span>
      </div>

      <div className="space-y-1">
        <input
          type="range"
          min="10"
          max="50"
          step="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-[#D3E4FE] rounded-[2px] appearance-none cursor-pointer accent-[#0F172A]"
        />
        <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
          <span>10% (Conservative)</span>
          <span className="font-semibold text-[#0F172A]">25% (Standard Default)</span>
          <span>50% (Aggressive)</span>
        </div>
      </div>

      {/* Dynamic calculation result */}
      <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-2.5 flex items-center justify-between text-[12px] font-sans">
        <span className="text-[#45464D]">
          Projected 7-Day Net Conversion Gain:
        </span>
        <span className="font-headline text-[15px] font-bold text-[#065F46]">
          +{adjustedGainLow} to +{adjustedGainHigh} Conversions
        </span>
      </div>
    </div>
  );
};
