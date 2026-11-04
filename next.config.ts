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
// Each diocese: a letter host (public/pitch/<slug>/index.html at /) and the
// layer's own host (lib/paths.ts; proxy.ts serves the finder at its /). Both
// are noindex, and the finder may be framed by that diocese's own site.
const dioceses = registry.dioceses.map((d) => ({ ...d, letter: fs.existsSync(path.join(process.cwd(), "public/pitch", d.slug, "index.html")) }));
const pitchHosts = [...pitch.map((p) => p.host), ...dioceses.flatMap((d) => [d.pitchHost, d.host].filter(Boolean) as string[])];

const nextConfig: NextConfig = {
  // YouTube thumbnails for the bishop's messages are the one remote image source.
  images: { formats: ["image/avif", "image/webp"], remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }] },
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
        ...dioceses.filter((d) => d.letter && d.pitchHost).map((d) => ({ source: "/", destination: `/pitch/${d.slug}/index.html`, has: onHost(d.pitchHost as string) })),
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
    // other site may put these pages in a frame, with one exception: the
    // finder may sit in a frame on the diocese's own site, so the diocese can
    // embed it on its Parish Finder page without moving anything.
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=(), payment=()" },
    ];
    const framing = (ancestors: string) => ({ key: "Content-Security-Policy", value: `frame-ancestors ${ancestors}` });
    // The finder may be framed only by its own diocese's site: on a diocese's
    // hosts by that diocese, on a parish's hosts by the parish's diocese.
    const ancestorsOf = (slug: string) => ["'self'", ...(dioceses.find((d) => d.slug === slug)?.siteHosts ?? []).map((h) => `https://${h}`)].join(" ");
    const finderHosts: { host: string; slug: string }[] = [
      ...dioceses.flatMap((d) => [d.host, d.pitchHost].filter(Boolean).map((host) => ({ host: host as string, slug: d.slug }))),
      ...registry.parishes.flatMap((p) => [...p.hosts, p.pitchHost].filter(Boolean).map((host) => ({ host: host as string, slug: p.diocese }))),
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/:path((?!diocese/near$).*)", headers: [framing("'self'")] },
      ...finderHosts.map((f) => ({ source: "/diocese/near", has: onHost(f.host), headers: [framing(ancestorsOf(f.slug))] })),
      ...dioceses.filter((d) => d.host).map((d) => ({ source: "/", has: onHost(d.host as string), headers: [framing(ancestorsOf(d.slug))] })),
      ...pitchHosts.map((h) => ({ source: "/:path*", has: onHost(h), headers: noindex })),
      { source: "/:path*", has: [{ type: "host" as const, value: "(.*)\\.vercel\\.app" }], headers: noindex },
    ];
  },
};

export default nextConfig;
