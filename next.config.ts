const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: require("next-pwa/cache"),
});

module.exports = withPWA({
  reactStrictMode: true,
  output: "standalone",
});
