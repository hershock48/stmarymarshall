import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";
import { after } from "next/server";
import { bump } from "@/lib/tally";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HolyDayNotice from "@/components/HolyDayNotice";
import { strings } from "@/lib/i18n";
import { DioceseFooter, DioceseHeader } from "@/components/DioceseChrome";
import { DsDemoBar, DsFooter, DsHeader } from "@/components/DsChrome";
import { getDiocese, getParish, isNoindexHost, onDioceseHost, onDioceseSiteHost } from "@/lib/parish";
import { siteBySlug } from "@/dioceses/sites";
import { dioceseName } from "@/dioceses";
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
  // The diocese host carries no parish: its own title and description, no parish link card.
  if (await onDioceseHost()) return { title: `${dioceseName(await getDiocese(), p.lang)} · ${s.diocese.chrome.sub}`, description: s.diocese.chrome.lede, robots: { index: false } };
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
  // On a diocese's own website (lib/dsite.ts) every page, the diocese pages
  // included, wears the site's header and footer, under a line that says
  // the site is a demonstration until the diocese's own domain points here.
  if (await onDioceseSiteHost()) {
    const d = await getDiocese();
    const site = siteBySlug(d.slug);
    if (site) {
      return (
        <html lang={p.lang} className={`${display.variable} ${body.variable}`} style={themeStyle(p)}>
          <body>
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy">
              {s.header.skip}
            </a>
            <DsDemoBar site={site} diocese={d} />
            <DsHeader lang={p.lang} diocese={d} site={site} />
            <main id="main">{children}</main>
            <DsFooter lang={p.lang} diocese={d} site={site} />
          </body>
        </html>
      );
    }
  }
  // On the diocese layer's own host the pages wear the diocese's chrome and
  // carry no parish: no parish header, footer or Church record.
  if (await onDioceseHost()) {
    const d = await getDiocese();
    return (
      <html lang={p.lang} className={`${display.variable} ${body.variable}`} style={themeStyle(p)}>
        <body>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-navy">
            {s.header.skip}
          </a>
          <DioceseHeader lang={p.lang} diocese={d} />
          <main id="main">{children}</main>
          <DioceseFooter lang={p.lang} diocese={d} />
        </body>
      </html>
    );
  }
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
        <HolyDayNotice parish={p} />
        <main id="main">{children}</main>
        <Footer parish={p} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(churchSchema(p)) }} />
      </body>
    </html>
  );
}
