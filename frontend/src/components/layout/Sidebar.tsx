"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Settings,
  Database,
  ShieldCheck,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recommendations", href: "/recommendations", icon: Sparkles },
  { label: "Impact & Saturation", href: "/impact", icon: TrendingUp },
  { label: "Data Sources", href: "/sources", icon: Database },
  { label: "Audit Ledger", href: "/audit", icon: ShieldCheck },
  { label: "Rules & Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#C6C6CD] bg-white flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#C6C6CD]/60 gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#0F172A] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
            W
          </div>
          <div>
            <h1 className="font-headline text-[17px] font-semibold tracking-tight text-[#0B1C30] leading-none">
              Ad Waste Finder
            </h1>
            <span className="font-sans text-[11px] text-[#64748B] tracking-wider uppercase font-semibold">
              Evidence Engine
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] font-sans text-[14px] font-medium transition-colors ${
                  isActive
                    ? "text-[#0F172A] font-semibold"
                    : "text-[#45464D] hover:text-[#0B1C30] hover:bg-[#EFF4FF]/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 bg-[#E5EEFF] rounded-[4px] border border-[#B9C7E0]"
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 28,
                      mass: 0.8,
                    }}
                  />
                )}
                <span className="relative z-10">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#0F172A]" : "text-[#76777D]"
                    }`}
                  />
                </span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-[#C6C6CD]/60 m-3 bg-[#EFF4FF] rounded-[4px]">
        <div className="flex items-center gap-2 mb-1.5">
          <Activity className="w-3.5 h-3.5 text-[#0F172A]" />
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#0F172A]">
            Read-Only Guardian
          </span>
        </div>
        <p className="font-sans text-[12px] text-[#45464D] leading-relaxed">
          Zero automated write-backs. All capital reallocation requires explicit human sign-off.
        </p>
      </div>
    </aside>
  );
};
