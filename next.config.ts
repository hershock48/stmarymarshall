import type { NextConfig } from "next";

/**
 * One host: the parish's own domain is canonical (lib/site.ts). Every
 * *.vercel.app host is noindex so a preview never competes with the parish
 * for its own name.
 */
const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // Tailwind 4 through the Turbopack loader (what create-next-app 16.4
  // wires). The first version of this file dropped the rule and every
  // utility class silently vanished while the build stayed green.
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
