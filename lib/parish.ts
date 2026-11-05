import "server-only";
import { headers } from "next/headers";
import { ALL, dioceseSiteSlug, dioceseSlugForHost, isDioceseHost, parishBySlug as bySlug, parishForHost } from "@/lib/paths";
import type { Diocese, Parish } from "@/lib/types";
import { DIOCESES, dioceseBySlug } from "@/dioceses";

/**
 * Which parish a request is for, from the Host header.
 *
 * One deployment serves every parish; the host decides. A parish answers
 * on its own domain and on its pitch host (where the letter sits at / and
 * the site at /demo, see next.config.ts). An unknown host, such as a
 * Vercel preview URL, gets the registry default so previews always render
 * something real. The host table itself is lib/paths.ts, which proxy.ts
 * shares.
 *
 * Every page that calls this is dynamic by nature; nothing on the platform
 * is statically generated, which is fine at parish traffic levels.
 */
export function allParishes(): Parish[] {
  return ALL;
}

export function parishBySlug(slug: string): Parish | undefined {
  return bySlug(slug);
}

export function parishByHost(host: string | null | undefined): Parish {
  return parishForHost(host);
}

export async function getParish(): Promise<Parish> {
  const h = await headers();
  return parishByHost(h.get("host"));
}

/** True on a host where the site must not be indexed: a pitch host, a preview, or a parish not yet live. */
export async function isNoindexHost(): Promise<boolean> {
  const h = (await headers()).get("host")?.toLowerCase().split(":")[0] ?? "";
  const p = parishByHost(h);
  return !p.live || p.pitchHost === h || isDioceseHost(h) || /\.vercel\.app$/.test(h);
}

/** True on a diocese layer's own host (lib/paths.ts), where the pages wear the diocese's chrome, not a parish's. */
export async function onDioceseHost(): Promise<boolean> {
  return isDioceseHost((await headers()).get("host"));
}

/** True on a diocese's own website (lib/paths.ts dioceseSiteSlug): the whole site, not only the diocese layer. */
export async function onDioceseSiteHost(): Promise<boolean> {
  return dioceseSiteSlug((await headers()).get("host")) !== null;
}

/** The diocese a request is for: the host's own diocese, or the host's parish's diocese. */
export async function getDiocese(): Promise<Diocese> {
  const slug = dioceseSlugForHost((await headers()).get("host"));
  return dioceseBySlug(slug) ?? DIOCESES[0];
}
