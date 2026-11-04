import type { Lang } from "@/lib/i18n";
import type { Diocese, Parish } from "@/lib/types";
import kalamazoo from "./kalamazoo/config";
import lansing from "./lansing/config";

/**
 * Every diocese on the platform. A diocese is a folder under dioceses/
 * with a config.ts; adding one is adding it here and in
 * parishes/registry.json (for the hosts next.config.ts needs before
 * routing). Nothing in the pages names a diocese: they ask which one the
 * host or the parish belongs to.
 */
export const DIOCESES: Diocese[] = [kalamazoo, lansing];
const BY_SLUG = new Map(DIOCESES.map((d) => [d.slug, d]));

export function dioceseBySlug(slug: string): Diocese | undefined {
  return BY_SLUG.get(slug);
}

/** The diocese a parish belongs to; a parish with an unknown slug gets the first, so a page never has none. */
export function dioceseOfParish(p: Parish): Diocese {
  return BY_SLUG.get(p.diocese.slug) ?? DIOCESES[0];
}

export function dioceseName(d: Diocese, lang: Lang): string {
  return lang === "es" ? d.nameEs : d.name;
}
