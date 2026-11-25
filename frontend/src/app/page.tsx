"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  PlayCircle,
  ShieldAlert,
  Shuffle,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans selection:bg-[#755937]/15">
      {/* Top Editorial Header */}
      <header className="border-b border-[#C6C6CD] bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#0F172A] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              A
            </div>
            <div>
              <span className="font-headline text-[18px] font-semibold tracking-tight text-[#0B1C30]">
                Ads Tracker
              </span>
              <span className="text-[11px] text-[#64748B] tracking-wider uppercase font-semibold ml-2 hidden sm:inline">
                Evidence Engine
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F172A] text-white rounded-[4px] text-[13px] font-semibold hover:bg-[#1E293B] shadow-sm transition-colors"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
          {/* Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-[#0B1C30] leading-[1.15] max-w-4xl mx-auto mb-6">
            Stop burning capital on <span className="italic text-[#755937]">immature</span> ads.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-[#45464D] max-w-2xl mx-auto leading-relaxed mb-10">
            Ads Tracker isolates genuine waste from natural attribution lag across Google, Meta, and LinkedIn. Detect underperforming ad spend, calculate salvageable capital, and reallocate with mathematical certainty.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0F172A] text-white rounded-[4px] text-[15px] font-semibold hover:bg-[#1E293B] shadow-md transition-all"
            >
              <span>Get Started — Launch Auditor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#C6C6CD] text-[#0B1C30] rounded-[4px] text-[15px] font-medium hover:bg-[#EFF4FF] transition-all"
            >
              <PlayCircle className="w-5 h-5 text-[#755937]" />
              <span>Explore Simulator Demo (₹85,250 Waste)</span>
            </Link>
          </div>

          {/* 4 Quick Highlight Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-[#C6C6CD] p-4 rounded-[4px] shadow-xs">
              <div className="text-[12px] font-medium text-[#76777D] uppercase tracking-wider mb-1">Protection</div>
              <div className="text-[17px] font-semibold text-[#0B1C30] mb-0.5">7-Day Maturity Lag</div>
              <div className="text-[12px] text-[#45464D]">Shields unripened conversions from premature cuts.</div>
            </div>
            <div className="bg-white border border-[#C6C6CD] p-4 rounded-[4px] shadow-xs">
              <div className="text-[12px] font-medium text-[#76777D] uppercase tracking-wider mb-1">Demo Proof</div>
              <div className="text-[17px] font-semibold text-[#BA1A1A] mb-0.5">₹85,250 Waste Found</div>
              <div className="text-[12px] text-[#45464D]">Identified across 2 underperforming campaigns.</div>
            </div>
            <div className="bg-white border border-[#C6C6CD] p-4 rounded-[4px] shadow-xs">
              <div className="text-[12px] font-medium text-[#76777D] uppercase tracking-wider mb-1">Execution</div>
              <div className="text-[17px] font-semibold text-[#0B1C30] mb-0.5">25% Shift Protocol</div>
              <div className="text-[12px] text-[#45464D]">Safe, non-erratic reallocation to top CPA winners.</div>
            </div>
            <div className="bg-white border border-[#C6C6CD] p-4 rounded-[4px] shadow-xs">
              <div className="text-[12px] font-medium text-[#76777D] uppercase tracking-wider mb-1">Security</div>
              <div className="text-[17px] font-semibold text-[#0B1C30] mb-0.5">100% Client-Side</div>
              <div className="text-[12px] text-[#45464D]">Zero token persistence and zero server tracking.</div>
            </div>
          </div>
        </section>

        {/* Three Core Pillars */}
        <section className="border-t border-[#C6C6CD] bg-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-serif text-3xl font-medium text-[#0B1C30] mb-3">
                Why Traditional Ad Managers Prematurely Kill Good Ads
              </h2>
              <p className="text-[15px] text-[#45464D]">
                Ad platforms take 3 to 7 days to report late-firing conversion pixels. Knee-jerk cuts burn testing budget and destroy momentum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="border border-[#C6C6CD] rounded-[4px] p-6 bg-[#F8F9FF] hover:border-[#0F172A] transition-colors">
                <div className="w-10 h-10 rounded-[4px] bg-[#EFF4FF] border border-[#C6C6CD] flex items-center justify-center text-[#0F172A] mb-4">
                  <ShieldAlert className="w-5 h-5 text-[#755937]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#0B1C30] mb-2">1. Attribution Lag Shield</h3>
                <p className="text-[13px] text-[#45464D] leading-relaxed">
                  Applies an explicit 7-day maturity horizon. Recent spend is flagged as <em>Collecting Data</em>, preventing automated rules from killing campaigns before conversion maturity.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="border border-[#C6C6CD] rounded-[4px] p-6 bg-[#F8F9FF] hover:border-[#0F172A] transition-colors">
                <div className="w-10 h-10 rounded-[4px] bg-[#EFF4FF] border border-[#C6C6CD] flex items-center justify-center text-[#0F172A] mb-4">
                  <Shuffle className="w-5 h-5 text-[#0F172A]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#0B1C30] mb-2">2. Conservative 25% Shift</h3>
                <p className="text-[13px] text-[#45464D] leading-relaxed">
                  Rather than reckless 100% budget cuts that break bidding algorithms, our recommendation engine proposes surgical 25% shifts into proven high-conversion campaigns.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="border border-[#C6C6CD] rounded-[4px] p-6 bg-[#F8F9FF] hover:border-[#0F172A] transition-colors">
                <div className="w-10 h-10 rounded-[4px] bg-[#EFF4FF] border border-[#C6C6CD] flex items-center justify-center text-[#0F172A] mb-4">
                  <Lock className="w-5 h-5 text-[#10B981]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#0B1C30] mb-2">3. Zero-Retention Security</h3>
                <p className="text-[13px] text-[#45464D] leading-relaxed">
                  Calculations occur directly in your browser. Read-only tokens never leave temporary session memory, guaranteeing total privacy and zero account hijacking liability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Auditor Simulation Banner */}
        <section className="border-t border-[#C6C6CD] bg-[#EFF4FF] py-14 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[12px] font-semibold text-[#755937] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-[#C6C6CD] inline-block mb-4">
              Real-World Simulator Engine
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#0B1C30] mb-4">
              See the Bayesian Auditor in Action
            </h2>
            <p className="text-[15px] text-[#45464D] mb-8 leading-relaxed max-w-2xl mx-auto">
              Simulate 30, 60, or 90 days of ad spend volatility. Watch the system accurately isolate underperforming campaigns, calculate salvageable capital, and generate 25% budget reallocations with zero write-back risk.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#0F172A] text-white rounded-[4px] text-[15px] font-semibold hover:bg-[#1E293B] shadow-md transition-all"
            >
              <span>Launch Live Dashboard &amp; Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#C6C6CD] bg-white py-8 px-6 text-center text-[12px] text-[#76777D]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 <strong>Ads Tracker</strong>. Built for Evidence-Based Ad Operations.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-[#0B1C30] transition-colors">
              Live Dashboard
            </Link>
            <Link href="/recommendations" className="hover:text-[#0B1C30] transition-colors">
              Recommendations
            </Link>
            <Link href="/settings" className="hover:text-[#0B1C30] transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
