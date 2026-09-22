import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "/*": [
      "./data/**/*",
      "./.env*",
      "./reports/**/*",
      "./test-results/**/*",
      "./playwright-report/**/*",
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  poweredByHeader: false,
  // Local metadata is cheap to resolve; keep descriptions and noindex in the first head.
  htmlLimitedBots: /.*/,
  // WebP keeps the first uncached photo request inexpensive on the single instance.
  images: { formats: ["image/webp"] },
};

export default nextConfig;
