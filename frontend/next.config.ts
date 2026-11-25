import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  rewrites: async () => {
    return [
      {
        source: "/:path*",
        destination: "/index.html",
      },
    ];
  },
};

export default nextConfig;
