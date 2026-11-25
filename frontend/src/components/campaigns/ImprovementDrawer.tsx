"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Layers,
  Palette,
  Crosshair,
  FileText,
  Sliders,
} from "lucide-react";
import type { CampaignDiagnostic, DiagnosticSuggestion } from "@/lib/types";
import { backdropVariants, drawerVariants, drawerItemVariants } from "@/lib/motion";

interface ImprovementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostic: CampaignDiagnostic | null;
  campaignName: string;
}

export const ImprovementDrawer: React.FC<ImprovementDrawerProps> = ({
  isOpen,
  onClose,
  diagnostic,
  campaignName,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "creative":
      case "creative & ad copy":
        return <Palette className="w-4 h-4 text-[#755937]" />;
      case "targeting":
      case "targeting & audience":
        return <Crosshair className="w-4 h-4 text-[#0F172A]" />;
      case "landing page":
      case "landing page & cvr":
        return <FileText className="w-4 h-4 text-[#334155]" />;
      case "bidding":
      case "bidding & technical setup":
      default:
        return <Sliders className="w-4 h-4 text-[#065F46]" />;
    }
  };

  const getImpactBadge = (impact: DiagnosticSuggestion["estimated_impact"]) => {
    switch (impact) {
      case "High":
        return "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]";
      case "Medium":
        return "bg-[#FDD6AB] text-[#5B4222] border-[#E5C096]";
      case "Low":
      default:
        return "bg-[#EFF4FF] text-[#45464D] border-[#C6C6CD]";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1C30]/30 backdrop-blur-xs"
          />

          {/* Slide-out Drawer (480px width) */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#C6C6CD]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#C6C6CD] bg-[#EFF4FF] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#755937]" />
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#755937]">
                    Campaign Diagnostic Engine
                  </span>
                </div>
                <h2 className="font-headline text-[22px] font-semibold text-[#0B1C30]">
                  Rehabilitation Playbook
                </h2>
                <p className="font-sans text-[13px] text-[#45464D] truncate max-w-[380px]">
                  Target: {campaignName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[4px] border border-[#C6C6CD] bg-white hover:bg-[#EFF4FF] flex items-center justify-center text-[#45464D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {!diagnostic ? (
                <div className="text-center py-12 text-[#64748B]">
                  Running root-cause funnel diagnostic...
                </div>
              ) : (
                <>
                  {/* Health Score & Bottleneck Callout */}
                  <div className="bg-[#FFFBF5] border border-[#FDE68A] p-4 rounded-[4px] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[12px] font-semibold uppercase text-[#755937]">
                        Campaign Health Index
                      </span>
                      <span className="font-headline text-[24px] font-bold text-[#0B1C30]">
                        {diagnostic.health_score} / 100
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 border-t border-[#FDE68A]/60">
                      <AlertOctagon className="w-4 h-4 text-[#92400E] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#92400E]">
                          Primary Funnel Bottleneck:
                        </span>
                        <p className="font-headline text-[16px] font-medium text-[#0B1C30] leading-snug">
                          {diagnostic.primary_bottleneck}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remediation Playbook Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-[#45464D] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Prescribed Remediation Actions
                      </h4>
                      <span className="text-[11px] text-[#64748B]">
                        {diagnostic.suggestions.length} Actionable Fixes
                      </span>
                    </div>

                    <div className="space-y-3">
                      {diagnostic.suggestions.map((item, idx) => (
                        <motion.div
                          key={idx}
                          variants={drawerItemVariants}
                          className="p-4 rounded-[4px] border border-[#C6C6CD] bg-white hover:border-[#0F172A]/40 transition-colors shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category)}
                              <span className="font-sans text-[12px] font-semibold text-[#0B1C30]">
                                {item.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[11px] font-sans font-semibold px-2 py-0.5 rounded-[4px] border ${getImpactBadge(
                                  item.estimated_impact
                                )}`}
                              >
                                {item.estimated_impact} Impact
                              </span>
                              <span className="text-[11px] font-sans px-2 py-0.5 rounded-[4px] bg-[#EFF4FF] border border-[#C6C6CD] text-[#45464D]">
                                {item.difficulty}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-[13px] font-sans">
                            <div className="text-[#BA1A1A] font-medium flex items-start gap-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider mt-0.5">
                                Issue:
                              </span>
                              <span>{item.issue}</span>
                            </div>
                            <div className="text-[#0B1C30] leading-relaxed flex items-start gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                              <span>{item.suggestion}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer action bar */}
            <div className="p-4 border-t border-[#C6C6CD] bg-[#EFF4FF] flex items-center justify-between">
              <span className="text-[11px] font-sans text-[#64748B]">
                Diagnostics grounded in 14-day Bayesian Funnel Triangulation
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-[4px] font-sans text-[13px] font-semibold hover:bg-[#131B2E] transition-colors"
              >
                Close Playbook
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
