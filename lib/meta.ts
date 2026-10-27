import type { Metadata } from "next";
import { SITE } from "@/lib/site";

/**
 * Per-page metadata with a correct og:url.
 *
 * Next.js does not deep-merge `openGraph`: a page that sets only `url`
 * loses the root layout's image, type and site name, and a root `url`
 * makes every inner page's share preview point at the home page (the
 * crawl caught it). So each page builds its whole block here, from one
 * base, with its own path.
 */
const OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: "The nave of St. Mary Catholic Church in Marshall, Michigan, during Mass." };

export function pageMetadata({ title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false } } : {}),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE.name,
      url: path,
      title: `${title} | ${SITE.name}`,
      description,
      images: [OG_IMAGE],
    },
  };
}

export const HOME_OG = {
  type: "website" as const,
  locale: "en_US",
  siteName: SITE.name,
  url: "/",
  title: "St. Mary Catholic Church | Marshall, MI",
  description: "A Catholic parish in Marshall, Michigan, since 1852. Mass times, confession, sacraments, faith formation and ministries.",
  images: [OG_IMAGE],
};
