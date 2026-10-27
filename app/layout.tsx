import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import { churchSchema, jsonLd } from "@/lib/jsonld";
import "./globals.css";

/**
 * Cormorant Garamond for display, Source Sans 3 for body. A book serif for
 * a parish founded in 1852, self-hosted at build time by next/font so no
 * runtime font CDN (glaze.md). Weights kept to the ones used.
 */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display-src",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-body-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "St. Mary Catholic Church | Marshall, MI",
    template: "%s | St. Mary Catholic Church, Marshall",
  },
  description: `St. Mary Catholic Church in Marshall, Michigan. Mass Saturday 5:00 PM, Sunday 9:00 and 11:00 AM. Confession Saturday 3:30 PM. Corner of Eagle and Green Streets. Office ${SITE.phone}.`,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: "St. Mary Catholic Church | Marshall, MI",
    description: "A Catholic parish in Marshall, Michigan, since 1852. Mass times, confession, sacraments, faith formation and ministries.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The nave of St. Mary Catholic Church in Marshall, Michigan, during Mass." }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(churchSchema) }} />
      </body>
    </html>
  );
}
