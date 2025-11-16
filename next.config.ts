import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    turbo: false, // ← DISABLE turbopack
  },
};

export default withPWA(nextConfig) as NextConfig;
