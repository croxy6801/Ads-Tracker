import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

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
  title: "Ads Tracker | Live Ad Campaign Waste Tracker",
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
      <body className="font-sans bg-[#F8F9FF] text-[#0B1C30] min-h-screen antialiased selection:bg-[#D3E4FE]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
