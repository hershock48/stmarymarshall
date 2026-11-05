import "server-only";
import type { DioceseSite } from "@/lib/dsite";
import kalamazoo from "./kalamazoo/site";

/**
 * The dioceses whose own website is on the platform (lib/dsite.ts). Kept
 * apart from dioceses/index.ts so the parish pages, which never show a
 * diocese's site, do not load its pages.
 */
const SITES: Record<string, DioceseSite> = { kalamazoo };

export function siteBySlug(slug: string): DioceseSite | undefined {
  return SITES[slug];
}
