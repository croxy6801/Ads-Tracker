"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, FastForward, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import { simulatorControl, simulatorScenario } from "@/lib/api";
import { connectSSE } from "@/lib/sse";

export const SimulatorBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [currentDay, setCurrentDay] = useState<number>(14);
  const [currentDate, setCurrentDate] = useState<string>("Day 14 | Oct 28");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Listen to SSE simulation ticks
    const cleanup = connectSSE((event) => {
      if (event.type === "tick" && event.data) {
        const d = event.data as Record<string, unknown>;
        if (typeof d.day === "number") setCurrentDay(d.day);
        if (typeof d.date === "string") setCurrentDate(d.date);
        if (typeof d.is_playing === "boolean") setIsPlaying(d.is_playing);
        if (typeof d.speed === "number") setSpeed(d.speed);
      }
    });
    return cleanup;
  }, []);

  const handlePlayPause = async () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    try {
      await simulatorControl(nextState ? "play" : "pause");
    } catch {
      // Revert on error
      setIsPlaying(!nextState);
    }
  };

  const handleToggleSpeed = async () => {
    const nextSpeed = speed === 1 ? 2 : 1;
    setSpeed(nextSpeed);
    try {
      await simulatorControl("speed", nextSpeed);
    } catch {
      setSpeed(speed);
    }
  };

  const handleScenario = async (
    scenario: "sudden_failure" | "lag_spike" | "reset_seed"
  ) => {
    setIsLoading(true);
    try {
      await simulatorScenario(scenario);
      if (scenario === "reset_seed") {
        setCurrentDay(1);
        setCurrentDate("Day 1 | Oct 15");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-[#E5EEFF] border-b border-[#C6C6CD] px-6 py-2.5 flex items-center justify-between text-[#0B1C30]">
      {/* Left: Playback controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] font-sans text-[13px] font-semibold transition-all shadow-sm ${
            isPlaying
              ? "bg-[#0F172A] text-white hover:bg-[#131B2E]"
              : "bg-white text-[#0B1C30] border border-[#C6C6CD] hover:bg-[#EFF4FF]"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Sim</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Sim</span>
            </>
          )}
        </button>

        <button
          onClick={handleToggleSpeed}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#C6C6CD] hover:bg-[#EFF4FF] rounded-[4px] font-sans text-[12px] font-semibold text-[#0B1C30] shadow-sm transition-colors"
        >
          <FastForward className="w-3.5 h-3.5 text-[#76777D]" />
          <span>{speed}x Speed</span>
        </button>

        {/* Date Display */}
        <div className="flex items-center gap-2 pl-2">
          <Clock className="w-4 h-4 text-[#755937]" />
          <span className="font-headline text-[16px] font-medium tracking-tight text-[#0B1C30]">
            {currentDate.includes("Day") ? currentDate : `Day ${currentDay} | ${currentDate}`}
          </span>
        </div>
      </div>

      {/* Right: Planted scenario triggers */}
      <div className="flex items-center gap-2">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mr-1 hidden lg:inline">
          Test Scenarios:
        </span>
        <button
          onClick={() => handleScenario("sudden_failure")}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#FFB4AB] hover:bg-[#FFDAD6] text-[#BA1A1A] font-sans text-[12px] font-medium rounded-[4px] shadow-sm transition-colors"
          title="Simulate sudden conversion rate crash on campaign"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Sudden Failure</span>
        </button>

        <button
          onClick={() => handleScenario("lag_spike")}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#FDE68A] hover:bg-[#FFFBEB] text-[#92400E] font-sans text-[12px] font-medium rounded-[4px] shadow-sm transition-colors"
          title="Inject 3-day attribution latency spike"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Inject Lag Spike</span>
        </button>

        <button
          onClick={() => handleScenario("reset_seed")}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#C6C6CD] hover:bg-[#EFF4FF] text-[#0F172A] font-sans text-[12px] font-medium rounded-[4px] shadow-sm transition-colors"
          title="Reset to Day 1 deterministic state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#76777D]" />
          <span>Reset to Seed</span>
        </button>
      </div>
    </div>
  );
};
