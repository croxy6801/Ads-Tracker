"use client";

import React, { useState, useEffect } from "react";
import type { AuditEntry } from "@/lib/types";
import { fetchAuditLog } from "@/lib/api";
import { ShieldCheck, UserCheck, CheckCircle2, XCircle, Sliders, Sparkles } from "lucide-react";

const INITIAL_LOGS: AuditEntry[] = [
  {
    id: "aud-001",
    user_id: "user-marketing-lead",
    action: "approve_recommendation",
    object_type: "recommendation",
    object_id: "rec-shift-9812",
    details: "Approved 25% reallocation (₹950/day) from 'The Slow Burner' to 'The Star'.",
    created_at: "Today, 10:45 AM",
  },
  {
    id: "aud-002",
    user_id: "user-marketing-lead",
    action: "request_diagnostic",
    object_type: "campaign",
    object_id: "slow-burner-2",
    details: "Requested on-demand funnel root-cause diagnostic playbook. Diagnostic returned: Creative Hook Fatigue (CTR decayed to 0.9%).",
    created_at: "Today, 10:40 AM",
  },
  {
    id: "aud-003",
    user_id: "user-growth-analyst",
    action: "dismiss_recommendation",
    object_type: "recommendation",
    object_id: "rec-prev-4011",
    details: "Dismissed with reason: 'Special promotional event running through weekend; CPA expected to normalize Monday.'",
    created_at: "Yesterday, 4:15 PM",
  },
  {
    id: "aud-004",
    user_id: "user-admin",
    action: "update_settings",
    object_type: "settings",
    object_id: "org-default",
    details: "Updated minimum cumulative spend threshold from ₹8,000 to ₹10,000.",
    created_at: "Oct 24, 2026, 2:30 PM",
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>(INITIAL_LOGS);

  useEffect(() => {
    fetchAuditLog()
      .then((res) => {
        if (res?.items && res.items.length > 0) setLogs(res.items);
      })
      .catch(() => {});
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "approve_recommendation":
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />,
          text: "Approved Shift",
          style: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
        };
      case "dismiss_recommendation":
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-[#BA1A1A]" />,
          text: "Dismissed",
          style: "bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]",
        };
      case "request_diagnostic":
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-[#755937]" />,
          text: "Diagnostic Run",
          style: "bg-[#FDD6AB] text-[#5B4222] border-[#E5C096]",
        };
      case "update_settings":
      default:
        return {
          icon: <Sliders className="w-3.5 h-3.5 text-[#0F172A]" />,
          text: "Rule Change",
          style: "bg-[#EFF4FF] text-[#0B1C30] border-[#C6C6CD]",
        };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#755937]">
            Screen 8 • Immutable Compliance Log
          </span>
        </div>
        <h1 className="font-headline text-[32px] font-semibold tracking-tight text-[#0B1C30]">
          Audit & Governance Ledger
        </h1>
        <p className="font-sans text-[14px] text-[#45464D] max-w-3xl mt-1">
          Tamper-evident record of all human interactions. Every shift approval, dismissal rationale, rule modification, and diagnostic request is recorded with attribution.
        </p>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-[#C6C6CD] rounded-[4px] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#C6C6CD] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F172A]" />
            <h3 className="font-headline text-[18px] font-semibold text-[#0B1C30]">
              Operational Activity Log
            </h3>
          </div>
          <span className="font-sans text-[11px] font-semibold uppercase px-2 py-0.5 rounded-[4px] bg-[#E5EEFF] text-[#0F172A]">
            {logs.length} Entries Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-[13px]">
            <thead>
              <tr className="bg-[#D3E4FE] text-[#0B1C30] font-semibold border-b border-[#C6C6CD]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EEFF] text-[#0B1C30]">
              {logs.map((log) => {
                const badge = getActionBadge(log.action);
                return (
                  <tr key={log.id} className="hover:bg-[#EFF4FF] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#64748B] text-[12px] whitespace-nowrap">
                      {log.created_at}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0F172A]">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#76777D]" />
                        <span>{log.user_id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border text-[11px] font-semibold ${badge.style}`}
                      >
                        {badge.icon}
                        <span>{badge.text}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[#45464D]">
                      {log.object_type}: {log.object_id}
                    </td>
                    <td className="py-3.5 px-4 text-[#0B1C30] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
