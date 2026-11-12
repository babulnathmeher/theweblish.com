import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/legacy-redirects";

const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: {
    // Shared builders can report far more CPUs than their process limit allows.
    cpus: 2,
  },
  async headers() {
    if (process.env.STAGING_NOINDEX !== "true") return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
