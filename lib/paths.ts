import type { Parish } from "@/lib/types";
import registry from "@/parishes/registry.json";
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
 * The diocese layer's own host: the finder at /, the diocese pages under
 * /diocese, nothing of any parish. The diocese can point its Parish Finder
 * page at it before a single parish moves; the day the diocese gives the
 * layer a host it owns, that host goes here.
 */
export function isDioceseHost(host: string | null | undefined): boolean {
  const h = (host ?? "").toLowerCase().split(":")[0];
  // DIOCESE_DEFAULT=1 makes a local server answer as the diocese host on
  // 127.0.0.1, so the auditor (base URL, no Host header) can run against it.
  if (process.env.DIOCESE_DEFAULT === "1" && /^(127\.0\.0\.1|localhost)$/.test(h)) return true;
  return Boolean(registry.dioceseHost) && h === registry.dioceseHost;
}

/** The host a letter under public/pitch/<slug>/ belongs to, or none. */
export function letterHost(slug: string): string | undefined {
  if (slug === "diocese") return registry.diocesePitchHost || undefined;
  return BY_SLUG.get(slug)?.pitchHost;
}

/** The one-segment paths every parish has, whatever its data. */
const ALWAYS = new Set(["", "new", "mass-times", "about", "sacraments", "register", "mass-intentions", "prayer-request", "demo", "diocese"]);

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
  return p.pages.some((pg) => pg.slug === segment);
}
