import type { MetadataRoute } from "next";
import { allPaths } from "@/lib/nav";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const p = await getParish();
  const base = `https://${p.hosts[0]}`;
  return allPaths(p).map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/" || path === "/events" || path === "/bulletin" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/mass-times" ? 0.9 : 0.6,
  }));
}
