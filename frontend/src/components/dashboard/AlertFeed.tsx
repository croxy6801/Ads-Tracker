"use client";

import React from "react";
import type { Alert } from "@/lib/types";
import { AlertCircle, AlertTriangle, Info, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface AlertFeedProps {
  alerts: Alert[];
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts }) => {
  const getIcon = (level: Alert["level"]) => {
    switch (level) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-[#BA1A1A] shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-[#0F172A] shrink-0 mt-0.5" />;
    }
  };

  const getCardStyle = (level: Alert["level"]) => {
    switch (level) {
      case "critical":
        return "bg-[#FFDAD6]/50 border-[#FFB4AB] text-[#0B1C30]";
      case "warning":
        return "bg-[#FFFBEB] border-[#FDE68A] text-[#0B1C30]";
      default:
        return "bg-[#EFF4FF] border-[#C6C6CD] text-[#0B1C30]";
    }
  };

  return (
    <div className="bg-white border border-[#C6C6CD] rounded-[4px] p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#C6C6CD]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0F172A]" />
          <h2 className="font-headline text-[18px] font-semibold text-[#0B1C30]">
            Real-Time Audit Alerts
          </h2>
        </div>
        <span className="font-sans text-[11px] font-semibold uppercase px-2 py-0.5 rounded-[4px] bg-[#E5EEFF] text-[#0F172A]">
          {alerts.length} Events
        </span>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1"
      >
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-[#76777D] font-sans text-[13px]">
            No active alerts. All campaigns operating within confidence bounds.
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              key={alert.id}
              variants={staggerItem}
              className={`p-3 rounded-[4px] border transition-all text-[13px] font-sans flex items-start gap-2.5 ${getCardStyle(
                alert.level
              )}`}
            >
              {getIcon(alert.level)}
              <div className="flex-1">
                <p className="leading-snug text-[#0B1C30] font-medium">
                  {alert.message}
                </p>
                <span className="text-[11px] text-[#64748B] mt-1 inline-block">
                  {alert.created_at}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};
