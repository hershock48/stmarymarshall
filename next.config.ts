import type { NextConfig } from "next";

/**
 * The host split, per glaze/proposal.md, while the letter is out:
 *
 *   stmarymarshall.glazedweb.com/        -> the letter (public/pitch/stmarymarshall/index.html)
 *   stmarymarshall.glazedweb.com/demo    -> this site
 *   stmarymarshall.org/                  -> this site, no letter anywhere (once DNS moves)
 *
 * The rewrites MUST be in `beforeFiles`: app/page.tsx already answers "/",
 * and an afterFiles rewrite would never fire. Host scoping rather than
 * basePath so the real site is not buried under /demo on launch day.
 * Every path on the pitch host and on *.vercel.app is noindex, so no copy
 * of the parish competes with the parish for its own name.
 *
 * DELETE the pitch rewrites and public/pitch/ once the parish says yes.
 */
const PITCH_HOST = "stmarymarshall.glazedweb.com";
const onPitchHost = [{ type: "host" as const, value: PITCH_HOST }];

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/pitch/stmarymarshall/index.html", has: onPitchHost },
        { source: "/demo", destination: "/", has: onPitchHost },
        { source: "/demo/:path*", destination: "/:path*", has: onPitchHost },
        // The letter lives in public/, so on any other host it resolves to
        // the 404 page rather than being a second URL for the same page.
        { source: "/pitch/:path*", destination: "/_not-found", missing: onPitchHost },
      ],
    };
  },
  // Tailwind 4 through the Turbopack loader (what create-next-app 16.4
  // wires). The first version of this file dropped the rule and every
  // utility class silently vanished while the build stayed green.
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/:path*", has: onPitchHost, headers: noindex },
      { source: "/:path*", has: [{ type: "host", value: "(.*)\\.vercel\\.app" }], headers: noindex },
    ];
  },
};

export default nextConfig;
