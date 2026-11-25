import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/index.html",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
