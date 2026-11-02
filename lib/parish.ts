import "server-only";
import { headers } from "next/headers";
import type { Parish } from "@/lib/types";
import registry from "@/parishes/registry.json";
import stmarymarshall from "@/parishes/stmarymarshall/data";
import stphilipbc from "@/parishes/stphilipbc/data";
import sanfelipe from "@/parishes/sanfelipe/data";

/**
 * Which parish a request is for, from the Host header.
 *
 * One deployment serves every parish; the host decides. A parish answers
 * on its own domain and on its pitch host (where the letter sits at / and
 * the site at /demo, see next.config.ts). An unknown host, such as a
 * Vercel preview URL, gets the registry default so previews always render
 * something real.
 *
 * Every page that calls this is dynamic by nature; nothing on the platform
 * is statically generated, which is fine at parish traffic levels.
 */
const ALL: Parish[] = [stmarymarshall, stphilipbc, sanfelipe];
const BY_SLUG = new Map(ALL.map((p) => [p.slug, p]));

export function allParishes(): Parish[] {
  return ALL;
}

export function parishBySlug(slug: string): Parish | undefined {
  return BY_SLUG.get(slug);
}

export function parishByHost(host: string | null | undefined): Parish {
  const h = (host ?? "").toLowerCase().split(":")[0];
  for (const p of ALL) {
    if (p.hosts.includes(h) || p.pitchHost === h) return p;
  }
  return BY_SLUG.get(registry.default) ?? ALL[0];
}

export async function getParish(): Promise<Parish> {
  const h = await headers();
  return parishByHost(h.get("host"));
}

/** True on a host where the site must not be indexed: a pitch host, a preview, or a parish not yet live. */
export async function isNoindexHost(): Promise<boolean> {
  const h = (await headers()).get("host")?.toLowerCase().split(":")[0] ?? "";
  const p = parishByHost(h);
  return !p.live || p.pitchHost === h || /\.vercel\.app$/.test(h);
}
