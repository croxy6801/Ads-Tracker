"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import type { DailyMetric } from "@/lib/types";

interface MetricChartsProps {
  metrics: DailyMetric[];
  targetCpa?: number;
}

export const MetricCharts: React.FC<MetricChartsProps> = ({
  metrics,
  targetCpa = 1200,
}) => {
  const chartData = metrics.map((m) => ({
    date: m.date,
    spend: m.spend,
    clicks: m.clicks,
    impressions: m.impressions,
    conversions: m.conversions,
    cpa: m.conversions > 0 ? Math.round(m.spend / m.conversions) : m.spend,
    cvr: m.clicks > 0 ? Number(((m.conversions / m.clicks) * 100).toFixed(2)) : 0,
    isMature: m.is_mature,
  }));

  const immatureStartIndex = chartData.findIndex((d) => !d.isMature);
  const immatureStartDate =
    immatureStartIndex !== -1 ? chartData[immatureStartIndex]?.date : undefined;
  const lastDate = chartData[chartData.length - 1]?.date;

  return (
    <div className="space-y-6">
      {/* Chart 1: Spend and Conversions */}
      <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-headline text-[18px] font-semibold text-[#0B1C30]">
              Daily Spend vs Conversions
            </h3>
            <p className="font-sans text-[12px] text-[#45464D]">
              Spend bar in ₹ (Left Axis) vs Conversions generated (Right Axis)
            </p>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-sans font-medium text-[#45464D]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#0F172A] rounded-[2px]" />
              <span>Spend (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#10B981]" />
              <span>Conversions</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5EEFF" vertical={false} />
              <XAxis dataKey="date" stroke="#76777D" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="spend"
                orientation="left"
                stroke="#0F172A"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <YAxis
                yAxisId="conv"
                orientation="right"
                stroke="#10B981"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0F172A] text-white p-3 rounded-[4px] text-[12px] font-sans space-y-1 shadow-lg">
                        <div className="font-semibold border-b border-gray-700 pb-1 mb-1">
                          {label} {!d.isMature && "(Immature)"}
                        </div>
                        <div>Spend: ₹{d.spend.toLocaleString()}</div>
                        <div className="text-emerald-400">Conversions: {d.conversions}</div>
                        <div>CPA: ₹{d.cpa.toLocaleString()}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {immatureStartDate && lastDate && (
                <ReferenceArea
                  yAxisId="spend"
                  x1={immatureStartDate}
                  x2={lastDate}
                  fill="#DCE9FF"
                  fillOpacity={0.4}
                />
              )}
              <Bar yAxisId="spend" dataKey="spend" fill="#0F172A" radius={[2, 2, 0, 0]} />
              <Line
                yAxisId="conv"
                type="monotone"
                dataKey="conversions"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10B981" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: CPA and Conversion Rate (CVR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CPA trajectory */}
        <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-headline text-[17px] font-semibold text-[#0B1C30]">
                CPA Trajectory vs Target
              </h3>
              <p className="font-sans text-[12px] text-[#45464D]">
                Cost Per Acquisition against benchmark
              </p>
            </div>
            <span className="font-sans text-[11px] font-semibold text-[#BA1A1A] bg-[#FFDAD6] px-2 py-0.5 rounded-[4px]">
              Target: ₹{targetCpa}
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EEFF" vertical={false} />
                <XAxis dataKey="date" stroke="#76777D" fontSize={10} tickLine={false} />
                <YAxis stroke="#755937" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip />
                <ReferenceLine y={targetCpa} stroke="#BA1A1A" strokeDasharray="4 4" strokeWidth={1.5} />
                <Line
                  type="monotone"
                  dataKey="cpa"
                  stroke="#755937"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#755937" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CVR trajectory */}
        <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-headline text-[17px] font-semibold text-[#0B1C30]">
                Funnel Conversion Rate (CVR %)
              </h3>
              <p className="font-sans text-[12px] text-[#45464D]">
                Percentage of clicks converting
              </p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5EEFF" vertical={false} />
                <XAxis dataKey="date" stroke="#76777D" fontSize={10} tickLine={false} />
                <YAxis stroke="#334155" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cvr"
                  stroke="#334155"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#334155" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
