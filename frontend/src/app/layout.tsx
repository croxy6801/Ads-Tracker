import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { SimulatorBar } from "@/components/layout/SimulatorBar";
import { PageTransition } from "@/components/layout/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ad Waste Finder | Evidence-Based Ad Campaign Waste Tracker",
  description:
    "Evidence before advice. Statistical ad waste detection, on-demand funnel diagnostics, and conservative budget reallocations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="font-sans bg-[#F8F9FF] text-[#0B1C30] min-h-screen antialiased flex flex-row selection:bg-[#D3E4FE]">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <SimulatorBar />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </body>
    </html>
  );
}
