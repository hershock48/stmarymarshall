import type { MetadataRoute } from "next";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const p = await getParish();
  const icons = `/parishes/${p.slug}`;
  return {
    name: `${p.name}, ${p.church.city}`,
    short_name: p.shortName,
    description: p.tagline,
    lang: p.lang,
    start_url: "/",
    display: "standalone",
    background_color: "#0e1a2b",
    theme_color: "#0e1a2b",
    icons: [
      { src: `${icons}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${icons}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${icons}/icon-512-maskable.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
