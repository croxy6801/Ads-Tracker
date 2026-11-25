"use client";

import React from "react";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "error" | "accent";
  change?: {
    value: string;
    isPositive: boolean;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  subtitle,
  icon: Icon,
  variant = "default",
  change,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case "error":
        return "bg-[#FFF4F2] border-[#FFB4AB] hover:border-[#BA1A1A]/50";
      case "accent":
        return "bg-[#FFFBF5] border-[#FDE68A] hover:border-[#755937]/50";
      default:
        return "bg-white border-[#C6C6CD] hover:border-[#0F172A]/40";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "error":
        return "text-[#BA1A1A]";
      case "accent":
        return "text-[#755937]";
      default:
        return "text-[#0B1C30]";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.8 }}
      className={`p-5 rounded-[4px] border shadow-xs transition-colors flex flex-col justify-between ${getContainerStyle()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-[#45464D]">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-7 h-7 rounded-[4px] flex items-center justify-center ${
              variant === "error"
                ? "bg-[#FFDAD6] text-[#BA1A1A]"
                : variant === "accent"
                ? "bg-[#FDD6AB] text-[#755937]"
                : "bg-[#EFF4FF] text-[#0F172A]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className={`font-sans text-[28px] font-semibold leading-tight tracking-tight ${getTextColor()}`}>
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px] font-sans">
        {subtitle && <span className="text-[#64748B]">{subtitle}</span>}
        {change && (
          <span
            className={`font-medium ${
              change.isPositive ? "text-[#065F46]" : "text-[#BA1A1A]"
            }`}
          >
            {change.value}
          </span>
        )}
      </div>
    </motion.div>
  );
};
