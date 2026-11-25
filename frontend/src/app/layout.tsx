import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ads Tracker | Live Ad Campaign Waste Tracker",
  description:
    "Evidence before advice. Statistical ad waste detection, on-demand funnel diagnostics, and conservative budget reallocations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
