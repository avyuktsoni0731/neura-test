// next.config.ts
import type { NextConfig } from "next";

/**
 * next-pwa is a CommonJS factory, so we require it.
 * We disable it during development to avoid injecting a webpack config
 * while Turbopack is (or might be) active. In production builds the plugin
 * will be enabled and will generate the service worker + precaches.
 */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable during development to avoid Turbopack vs webpack conflict
  disable: process.env.NODE_ENV === "development",

  // Runtime caching rules (Workbox) — adjust TTLs / maxEntries as needed
  runtimeCaching: [
    // Cache Next.js data and page navigations (network first, fallback to cache)
    {
      urlPattern: /^\/(?:_next\/data\/.*|.*\.json)$/, // data routes and JSON
      handler: "NetworkFirst",
      options: {
        cacheName: "data-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }, // 1 day
        networkTimeoutSeconds: 10,
      },
    },
    // Cache the _next static assets (JS/CSS/chunks) — stale-while-revalidate
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
      },
    },
    // Cache images (cache first)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
      },
    },
    // Cache fonts (cache first)
    {
      urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "font-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }, // 1 year
      },
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Add any Next.js config flags you need here (images, rewrites, etc.)
  // Note: do NOT add experimental.turbo here; it caused TS errors in newer Next versions.
};

export default withPWA(nextConfig);
