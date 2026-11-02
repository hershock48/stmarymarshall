import type { Metadata } from "next";
import type { Parish } from "@/lib/types";

/**
 * Per-page metadata with a correct og:url, per parish.
 *
 * Next.js does not deep-merge `openGraph`: a page that sets only `url`
 * loses the image, type and site name, and a root `url` would make every
 * inner page's share preview point at the home page. So each page builds
 * its whole block here, from the parish, with its own path.
 */
export function pageMetadata(p: Parish, { title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  const base = `https://${p.hosts[0]}`;
  const image = { url: `/parishes/${p.slug}/og.jpg`, width: 1200, height: 630, alt: `${p.name}, ${p.church.city}, Michigan.` };
  return {
    metadataBase: new URL(base),
    title: path === "/" ? `${p.name} | ${p.church.city}, MI` : { absolute: `${title} | ${p.name}, ${p.church.city}` },
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false } } : {}),
    openGraph: {
      type: "website",
      locale: p.lang === "es" ? "es_US" : "en_US",
      siteName: p.name,
      url: path,
      title: path === "/" ? `${p.name} | ${p.church.city}, MI` : `${title} | ${p.name}`,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image" },
    icons: {
      icon: [{ url: `/parishes/${p.slug}/favicon.ico`, sizes: "any" }, { url: `/parishes/${p.slug}/icon.svg`, type: "image/svg+xml" }],
      apple: `/parishes/${p.slug}/apple-icon.png`,
    },
  };
}
