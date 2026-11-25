"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { SimulatorBar } from "@/components/layout/SimulatorBar";
import { PageTransition } from "@/components/layout/PageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <div className="flex flex-row w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <SimulatorBar />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
