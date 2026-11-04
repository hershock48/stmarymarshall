import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import registry from "./parishes/registry.json";

/**
 * One deployment, many hosts. parishes/registry.json lists every parish's
 * hosts and pitch host; the parish itself is picked per request from the
 * Host header in lib/parish.ts. This file only does what has to happen
 * before routing:
 *
 *   <pitchHost>/        -> the letter (public/pitch/<slug>/index.html)
 *   <pitchHost>/demo    -> the parish site
 *   <diocesePitchHost>/ -> the diocese letter (public/pitch/diocese/index.html)
 *   any other host      -> the parish site, no letter anywhere
 *
 * The rewrites MUST be in `beforeFiles`: app/page.tsx already answers "/",
 * and an afterFiles rewrite would never fire. Every path on a pitch host
 * and on *.vercel.app is noindex, so no copy of a parish competes with the
 * parish for its own name.
 *
 * Once a parish says yes, remove its pitchHost from the registry and its
 * data file; its letter stops being served the same minute.
 */
const pitch = registry.parishes.filter((p) => p.pitchHost).map((p) => ({ slug: p.slug, host: p.pitchHost as string, letter: fs.existsSync(path.join(process.cwd(), "public/pitch", p.slug, "index.html")) }));
const onHost = (host: string) => [{ type: "host" as const, value: host.replace(/\./g, "\\.") }];
const diocese = registry.diocesePitchHost;
const pitchHosts = [...pitch.map((p) => p.host), ...(diocese ? [diocese] : [])];

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // The dev server otherwise writes an AGENTS.md into the repo root.
  agentRules: false,
  async rewrites() {
    return {
      beforeFiles: [
        // A pitch host with no letter yet serves the site at / as well as at
        // /demo, so the demo link works before the letter is written.
        ...pitch.flatMap((p) => [
          ...(p.letter ? [{ source: "/", destination: `/pitch/${p.slug}/index.html`, has: onHost(p.host) }] : []),
          { source: "/demo", destination: "/", has: onHost(p.host) },
          { source: "/demo/:path*", destination: "/:path*", has: onHost(p.host) },
        ]),
        ...(diocese ? [{ source: "/", destination: "/pitch/diocese/index.html", has: onHost(diocese) }] : []),
        // Each letter answers only on its own host; proxy.ts sends every
        // other host's request for it to the 404 page.
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
    // What every response carries, on every host, listed on /diocese/security.
    // HSTS comes from Vercel. Geolocation is allowed only for the site's own
    // finder button; no page here ever needs a camera or a microphone, and no
    // other site may put these pages in a frame.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=(), payment=()" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
    ];
    return [
      { source: "/:path*", headers: security },
      ...pitchHosts.map((h) => ({ source: "/:path*", has: onHost(h), headers: noindex })),
      { source: "/:path*", has: [{ type: "host" as const, value: "(.*)\\.vercel\\.app" }], headers: noindex },
    ];
  },
};

export default nextConfig;
