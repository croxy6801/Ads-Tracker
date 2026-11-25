"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

interface DailyTrendPoint {
  date: string;
  spend: number;
  cpa: number;
  targetCpa?: number;
  isMature: boolean;
}

interface TrendChartProps {
  data: DailyTrendPoint[];
  targetCpa?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, targetCpa = 1200 }) => {
  // Find immature boundary (last 3 points usually)
  const immatureStartIndex = data.findIndex((d) => !d.isMature);
  const immatureStartDate =
    immatureStartIndex !== -1 ? data[immatureStartIndex]?.date : undefined;
  const lastDate = data[data.length - 1]?.date;

  return (
    <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-headline text-[20px] font-semibold text-[#0B1C30]">
            Performance Trajectory & Maturity Window
          </h2>
          <p className="font-sans text-[13px] text-[#45464D]">
            Daily Spend (₹) vs Actual CPA (₹) with 3-Day Attribution Lag Shading
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[12px] font-sans font-medium text-[#45464D]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0F172A]" />
            <span>Daily Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#755937]" />
            <span>Actual CPA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#BA1A1A]" />
            <span>Target Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#DCE9FF]/60 border border-[#B9C7E0] rounded-[2px]" />
            <span>Immature (Last 3d)</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5EEFF" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#76777D"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#C6C6CD" }}
            />
            <YAxis
              yAxisId="spend"
              orientation="left"
              stroke="#0F172A"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#C6C6CD" }}
              tickFormatter={(v) => `₹${v}`}
            />
            <YAxis
              yAxisId="cpa"
              orientation="right"
              stroke="#755937"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#C6C6CD" }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pData = payload[0].payload as DailyTrendPoint;
                  return (
                    <div className="bg-[#0F172A] text-white p-3 rounded-[4px] shadow-lg text-[12px] font-sans space-y-1">
                      <div className="font-semibold border-b border-gray-700 pb-1 mb-1 flex items-center justify-between gap-4">
                        <span>{label}</span>
                        {!pData.isMature && (
                          <span className="text-[10px] text-[#FDE68A] uppercase font-bold tracking-wider">
                            Immature
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between gap-4 text-gray-300">
                        <span>Spend:</span>
                        <span className="font-mono text-white">₹{pData.spend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-[#FDD6AB]">
                        <span>CPA:</span>
                        <span className="font-mono text-white">₹{pData.cpa.toLocaleString()}</span>
                      </div>
                      {targetCpa && (
                        <div className="flex justify-between gap-4 text-red-300">
                          <span>Target:</span>
                          <span className="font-mono text-white">₹{targetCpa.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Shaded 3-day maturity band */}
            {immatureStartDate && lastDate && (
              <ReferenceArea
                yAxisId="spend"
                x1={immatureStartDate}
                x2={lastDate}
                fill="#DCE9FF"
                fillOpacity={0.45}
                label={{
                  value: "Data Still Arriving (Last 3 Days Excluded)",
                  position: "insideTopRight",
                  fill: "#45464D",
                  fontSize: 11,
                  fontFamily: "Inter, sans-serif",
                }}
              />
            )}

            {/* Target benchmark horizontal reference line */}
            <ReferenceLine
              yAxisId="cpa"
              y={targetCpa}
              stroke="#BA1A1A"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Spend bar / line */}
            <Line
              yAxisId="spend"
              type="monotone"
              dataKey="spend"
              stroke="#0F172A"
              strokeWidth={2}
              dot={{ r: 2, fill: "#0F172A" }}
              activeDot={{ r: 5 }}
            />

            {/* CPA line */}
            <Line
              yAxisId="cpa"
              type="monotone"
              dataKey="cpa"
              stroke="#755937"
              strokeWidth={2}
              dot={{ r: 2, fill: "#755937" }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
