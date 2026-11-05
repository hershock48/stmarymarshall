import { watchSource } from "@/lib/stream";
import type { Parish } from "@/lib/types";
import registry from "@/parishes/registry.json";
import kalamazooSite from "@/dioceses/kalamazoo/site/slugs.json";
import stmarymarshall from "@/parishes/stmarymarshall/data";
import stphilipbc from "@/parishes/stphilipbc/data";
import sanfelipe from "@/parishes/sanfelipe/data";

/**
 * Which parish a host is, and which paths that parish answers. Shared by
 * lib/parish.ts (pages) and proxy.ts (the request edge), so it imports
 * nothing from next/headers and nothing marked server-only.
 */
export const ALL: Parish[] = [stmarymarshall, stphilipbc, sanfelipe];
const BY_SLUG = new Map(ALL.map((p) => [p.slug, p]));

export function parishForHost(host: string | null | undefined): Parish {
  const h = (host ?? "").toLowerCase().split(":")[0];
  for (const p of ALL) {
    if (p.hosts.includes(h) || p.pitchHost === h) return p;
  }
  // PARISH_DEFAULT lets a local server answer as another parish on
  // 127.0.0.1, so the auditor (which takes a base URL, not a host) can
  // run against each one: PARISH_DEFAULT=sanfelipe npm start.
  return BY_SLUG.get(process.env.PARISH_DEFAULT ?? registry.default) ?? ALL[0];
}

export function parishBySlug(slug: string): Parish | undefined {
  return BY_SLUG.get(slug);
}

/**
 * A diocese layer's own host: the finder at /, the diocese pages under
 * /diocese, nothing of any parish. A diocese can point its Parish Finder
 * page at it before a single parish moves; the day a diocese gives the
 * layer a host it owns, that host goes in the registry. Returns the
 * diocese's slug, or null when the host is a parish's.
 */
export function dioceseHostSlug(host: string | null | undefined): string | null {
  const h = (host ?? "").toLowerCase().split(":")[0];
  // DIOCESE_DEFAULT=<slug> makes a local server answer as that diocese's host
  // on 127.0.0.1, so the auditor (base URL, no Host header) can run against it.
  if (process.env.DIOCESE_DEFAULT && /^(127\.0\.0\.1|localhost)$/.test(h)) return process.env.DIOCESE_DEFAULT === "1" ? registry.dioceses[0]?.slug ?? null : process.env.DIOCESE_DEFAULT;
  return registry.dioceses.find((d) => d.host === h)?.slug ?? dioceseSiteSlug(h);
}

/**
 * A diocese's own website, served from the platform (lib/dsite.ts): the
 * pages read from the diocese's current site, with the finder, the
 * calendar and the bishop's voice built in. Until the diocese points its
 * own domain here it answers on a demonstration host. The host is also a
 * diocese host, so the diocese pages under /diocese wear the site's chrome
 * there. Returns the diocese's slug, or null.
 */
export function dioceseSiteSlug(host: string | null | undefined): string | null {
  const h = (host ?? "").toLowerCase().split(":")[0];
  // DIOCESE_SITE_DEFAULT=<slug> makes a local server answer as that diocese's site on 127.0.0.1.
  if (process.env.DIOCESE_SITE_DEFAULT && /^(127\.0\.0\.1|localhost)$/.test(h)) return process.env.DIOCESE_SITE_DEFAULT;
  return registry.dioceses.find((d) => d.demoSiteHost && d.demoSiteHost === h)?.slug ?? null;
}

export function isDioceseHost(host: string | null | undefined): boolean {
  return dioceseHostSlug(host) !== null;
}

/** Which diocese a host is for: its own layer host, its letter host, or the host's parish's diocese. */
export function dioceseSlugForHost(host: string | null | undefined): string {
  const h = (host ?? "").toLowerCase().split(":")[0];
  return dioceseHostSlug(h) ?? registry.dioceses.find((d) => d.pitchHost === h)?.slug ?? parishForHost(h).diocese.slug;
}

/** The diocese whose letter a host serves at /, or none. */
export function letterSlugForHost(host: string | null | undefined): string | null {
  const h = (host ?? "").toLowerCase().split(":")[0];
  return registry.dioceses.find((d) => d.pitchHost === h)?.slug ?? null;
}

/** The host a letter under public/pitch/<slug>/ belongs to, or none: a diocese's letter or a parish's. */
export function letterHost(slug: string): string | undefined {
  return registry.dioceses.find((d) => d.slug === slug)?.pitchHost || BY_SLUG.get(slug)?.pitchHost;
}

const SITE_PATHS: Record<string, Set<string>> = { kalamazoo: new Set([...kalamazooSite, "directory"]) };

/** True when a diocese's own site answers this one-segment path: one of the pages read from the diocese, or the staff directory. */
export function knowsSitePath(slug: string, segment: string): boolean {
  return SITE_PATHS[slug]?.has(segment) ?? false;
}

/** True when the parish has anywhere to watch Mass right now: the same test the Watch page makes, so a hosted-video parish without its credentials has no /watch rather than a broken one. */
export function hasWatch(p: Parish): boolean {
  return watchSource(p) !== null;
}

/** The one-segment paths every parish has, whatever its data. */
const ALWAYS = new Set(["", "new", "mass-times", "about", "sacraments", "register", "mass-intentions", "prayer-request", "demo", "diocese", "news", "bulletin-insert"]);

/**
 * True when the parish answers this one-segment path. The pages that
 * depend on data (ministries, faith formation, the calendar, the bulletin,
 * give) exist only when the data does; a parish's own section pages are
 * its `pages`. Anything else is a 404.
 */
export function knowsPath(p: Parish, segment: string): boolean {
  if (ALWAYS.has(segment)) return true;
  if (segment === "faith-formation") return p.formation.length > 0;
  if (segment === "ministries") return p.ministries.length > 0;
  if (segment === "events") return p.events.length > 0;
  if (segment === "bulletin") return Boolean(p.bulletins);
  if (segment === "give") return Boolean(p.give.url || p.give.extras?.length);
  if (segment === "watch") return hasWatch(p);
  if (segment === "enroll") return p.formation.length > 0;
  return p.pages.some((pg) => pg.slug === segment);
}
