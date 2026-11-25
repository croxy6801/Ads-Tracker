"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { CampaignRow } from "@/lib/types";
import { ArrowUpDown, ChevronRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface CampaignTableProps {
  campaigns: CampaignRow[];
}

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns }) => {
  const [sortField, setSortField] = useState<keyof CampaignRow>("spend");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof CampaignRow) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  return (
    <div className="bg-white border border-[#C6C6CD] rounded-[4px] overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-[#C6C6CD] flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[20px] font-semibold text-[#0B1C30]">
            Monitored Campaigns
          </h2>
          <p className="font-sans text-[13px] text-[#45464D]">
            Statistical observation windows, CPA benchmark adherence, and diagnostic status
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#D3E4FE] text-[#0B1C30] font-sans text-[13px] font-semibold border-b border-[#C6C6CD]">
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 cursor-pointer hover:bg-[#C6DBFD] transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Campaign Name</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#45464D]" />
                </div>
              </th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Status</th>
              <th
                onClick={() => handleSort("spend")}
                className="py-3 px-4 cursor-pointer hover:bg-[#C6DBFD] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Total Spend</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#45464D]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("conversions")}
                className="py-3 px-4 cursor-pointer hover:bg-[#C6DBFD] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Conversions</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#45464D]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cpa")}
                className="py-3 px-4 cursor-pointer hover:bg-[#C6DBFD] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Actual CPA / Target</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#45464D]" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Trend</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="divide-y divide-[#E5EEFF] font-sans text-[13px] text-[#0B1C30]"
          >
            {sortedCampaigns.map((camp) => {
              const isOverTarget = camp.cpa > camp.target_cpa * 1.2;
              return (
                <motion.tr
                  key={camp.id}
                  variants={staggerItem}
                  className="hover:bg-[#EFF4FF] transition-colors group"
                >
                  <td className="py-3.5 px-4 font-semibold text-[#0B1C30]">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{camp.name}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-[#45464D]">
                    <span className="px-2 py-0.5 bg-[#EFF4FF] border border-[#C6C6CD] rounded-[4px] text-[11px] font-medium uppercase tracking-wider text-[#45464D]">
                      {camp.channel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={camp.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium">
                    ₹{camp.spend.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium">
                    {camp.conversions.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        isOverTarget && camp.status === "Underperforming"
                          ? "text-[#BA1A1A]"
                          : "text-[#0B1C30]"
                      }`}
                    >
                      ₹{camp.cpa.toLocaleString()}
                    </span>
                    <span className="text-[#64748B] text-[11px] ml-1">
                      / ₹{camp.target_cpa.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 text-[#755937]">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono">7d</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-[#0F172A] bg-white border border-[#C6C6CD] hover:bg-[#EFF4FF] rounded-[4px] transition-colors"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};
