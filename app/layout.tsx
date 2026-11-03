import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";
import { after } from "next/server";
import { bump } from "@/lib/tally";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { strings } from "@/lib/i18n";
import { getParish, isNoindexHost } from "@/lib/parish";
import { navFor } from "@/lib/nav";
import { pageMetadata } from "@/lib/meta";
import { churchSchema, jsonLd } from "@/lib/jsonld";
import { massTimesSentence } from "@/lib/schedule";
import { confessionSentence, whereSentence } from "@/lib/sentences";
import { themeStyle } from "@/lib/theme";
import "./globals.css";

/**
 * One layout for every parish on the platform. The parish comes from the
 * Host header (lib/parish.ts), so everything below is dynamic. Fonts are
 * self-hosted at build time by next/font: Cormorant Garamond for display,
 * Source Sans 3 for text. Both carry the Latin Extended set the Spanish
 * pages need.
 */
const display = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], style: ["normal", "italic"], variable: "--font-display-src", display: "swap" });
const body = Source_Sans_3({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], variable: "--font-body-src", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  const noindex = await isNoindexHost();
  return pageMetadata(p, {
    title: p.name,
    description: s.meta.home(p.name, p.church.city, massTimesSentence(p.masses, p.lang), confessionSentence(p, p.lang), whereSentence(p, p.lang), p.phone),
    path: "/",
    noindex,
  });
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const p = await getParish();
  const s = strings(p.lang);
  const h = await headers();
  // Only what the proxy set: a path, never a client's own header on a route the proxy skips.
  const path = h.get("x-path");
  if (path && path.startsWith("/") && path.length <= 200) after(() => bump(h.get("host") ?? "", "view", path));
  const nameRest = p.name.startsWith(p.shortName) ? p.name.slice(p.shortName.length).trim() : "";
  return (
    <html lang={p.lang} className={`${display.variable} ${body.variable}`} style={themeStyle(p)}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy">
          {s.header.skip}
        </a>
        <Header
          shortName={p.shortName}
          nameRest={nameRest}
          phone={p.phone}
          phoneHref={p.phoneHref}
          nav={navFor(p)}
          mark={p.mark}
          pitchHost={p.pitchHost}
          give={Boolean(p.give.url || p.give.extras?.length)}
          words={{ home: s.header.home, main: s.header.main, mobile: s.header.mobile, openMenu: s.header.openMenu, closeMenu: s.header.closeMenu, register: s.header.register, call: s.header.call(p.phone), give: s.nav.give }}
        />
        <main id="main">{children}</main>
        <Footer parish={p} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(churchSchema(p)) }} />
      </body>
    </html>
  );
}
