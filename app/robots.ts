import type { MetadataRoute } from "next";
import { getParish, isNoindexHost } from "@/lib/parish";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const p = await getParish();
  // A pitch host, a preview, or a parish not yet live: keep every crawler out.
  if (await isNoindexHost()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/register/thanks"] },
    sitemap: `https://${p.hosts[0]}/sitemap.xml`,
  };
}
