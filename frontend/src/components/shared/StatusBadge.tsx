"use strict";
import React from "react";
import type { CampaignStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: CampaignStatus | string;
  className?: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
  size = "md",
}) => {
  const norm = (status || "").toLowerCase().replace(/_/g, " ").trim();

  const getStyles = () => {
    switch (norm) {
      case "healthy":
        return {
          label: "Healthy",
          bg: "bg-[#ECFDF5]",
          text: "text-[#065F46]",
          border: "border-[#A7F3D0]",
          dot: "bg-[#10B981]",
          pulse: false,
        };
      case "watch":
        return {
          label: "Watch",
          bg: "bg-[#FFFBEB]",
          text: "text-[#92400E]",
          border: "border-[#FDE68A]",
          dot: "bg-[#F59E0B]",
          pulse: false,
        };
      case "underperforming":
        return {
          label: "Underperforming",
          bg: "bg-[#FFDAD6]",
          text: "text-[#BA1A1A]",
          border: "border-[#FFB4AB]",
          dot: "bg-[#BA1A1A]",
          pulse: true,
        };
      case "strong":
        return {
          label: "Strong",
          bg: "bg-[#E5EEFF]",
          text: "text-[#0B1C30]",
          border: "border-[#B9C7E0]",
          dot: "bg-[#0F172A]",
          pulse: false,
        };
      case "saturated":
        return {
          label: "Saturated",
          bg: "bg-[#FDD6AB]",
          text: "text-[#5B4222]",
          border: "border-[#E5C096]",
          dot: "bg-[#755937]",
          pulse: false,
        };
      case "awareness":
        return {
          label: "Awareness",
          bg: "bg-[#F5F3FF]",
          text: "text-[#5B21B6]",
          border: "border-[#DDD6FE]",
          dot: "bg-[#8B5CF6]",
          pulse: false,
        };
      case "collecting data":
      default:
        return {
          label: "Collecting Data",
          bg: "bg-[#EFF4FF]",
          text: "text-[#45464D]",
          border: "border-[#C6C6CD]",
          dot: "bg-[#76777D]",
          pulse: false,
        };
    }
  };

  const config = getStyles();
  const padClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium rounded-[4px] border transition-colors ${config.bg} ${config.text} ${config.border} ${padClass} ${className}`}
    >
      <span className="relative flex h-2 w-2 items-center justify-center">
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};
