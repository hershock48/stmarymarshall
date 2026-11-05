import Link from "next/link";
import GlazedPlate from "@/components/GlazedPlate";
import type { DioceseSite } from "@/lib/dsite";
import { strings, type Lang } from "@/lib/i18n";
import { fmtDate } from "@/lib/schedule";
import type { Diocese } from "@/lib/types";
import { dioceseName } from "@/dioceses";

/**
 * What a diocese's own website wears on the platform (lib/dsite.ts): the
 * diocese's name, a short menu whose first item is the finder, and a
 * footer with the Pastoral Center, every section, and the feeds.
 *
 * Until the diocese points its own domain here the site is a
 * demonstration, and says so on every page, above the header: nobody
 * should mistake it for the diocese's own site.
 */
export function DsDemoBar({ site, diocese: d }: { site: DioceseSite; diocese: Diocese }) {
  return (
    <aside aria-label="About this site" className="bg-gold text-navy">
      <p className="mx-auto max-w-7xl px-4 py-2 text-sm leading-snug sm:px-6 lg:px-8">
        A demonstration for the {d.name}, built by Glazed Web from {site.sourceHost} as it read on {fmtDate(site.readAt.slice(0, 10), true, "en")}. The diocese’s own website is{" "}
        <a href={site.source} className="font-semibold underline underline-offset-2">
          {site.sourceHost}
        </a>
        .
      </p>
    </aside>
  );
}

export function DsHeader({ lang, diocese: d, site }: { lang: Lang; diocese: Diocese; site: DioceseSite }) {
  const s = strings(lang);
  const item = "inline-flex min-h-11 items-center whitespace-nowrap text-[14px] font-semibold tracking-wide text-dim hover:text-cream xl:text-[15px]";
  return (
    <header className="border-b border-navy-line bg-navy">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-14 items-center gap-3 text-cream">
          <svg width="38" height="38" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7" className="shrink-0 text-gold" aria-hidden="true">
            <circle cx="50" cy="50" r="45" />
            <path d="M50 22v56M32 42h36" strokeWidth="8" />
          </svg>
          <span className="display text-2xl leading-none sm:text-[28px]">
            {dioceseName(d, lang)}
            <span className="sr-only">, home</span>
          </span>
        </Link>
        <nav aria-label={s.header.main} className="hidden flex-wrap items-center gap-x-5 gap-y-1 lg:flex">
          {site.header.map((i) => (
            <Link key={i.href} href={i.href} className={item}>
              {i.label}
            </Link>
          ))}
          <Link href="/give" className="inline-flex min-h-11 items-center rounded-sm bg-gold px-5 text-[14px] font-semibold text-navy hover:bg-gold-light">
            Give
          </Link>
        </nav>
        <details className="group relative lg:hidden">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm border border-navy-line px-4 text-sm font-semibold text-cream [&::-webkit-details-marker]:hidden">
            Menu
            <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <nav aria-label={s.header.mobile} className="absolute right-0 z-50 mt-2 w-64 rounded-sm border border-navy-line bg-navy p-2 shadow-xl">
            <ul>
              {[...site.header, { label: "Give", href: "/give" }].map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="flex min-h-11 items-center rounded-sm px-3 text-[15px] font-semibold text-cream hover:bg-navy-soft">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function DsFooter({ lang, diocese: d, site }: { lang: Lang; diocese: Diocese; site: DioceseSite }) {
  const s = strings(lang);
  const c = s.diocese.chrome;
  const head = "text-xs font-semibold uppercase tracking-[0.18em] text-gold";
  const link = "inline-block min-h-6 text-dim hover:text-cream";
  return (
    <footer className="border-t border-navy-line bg-navy">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="display text-2xl leading-none text-cream">{dioceseName(d, lang)}</p>
          <address className="mt-4 text-sm not-italic leading-relaxed text-dim">
            {site.center.name}
            <br />
            {site.center.street}
            <br />
            {site.center.city}
            <br />
            <a href={site.center.phoneHref} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              {site.center.phone}
            </a>
          </address>
          <p className="mt-4 text-sm">
            <Link href="/making-a-report" className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              To report abuse or misconduct
            </Link>
          </p>
        </div>
        <nav aria-label="Sections">
          <p className={head}>The diocese</p>
          <ul className="mt-3 space-y-2 text-sm">
            {site.nav.map((n) => (
              <li key={n.label}>
                {n.href ? (
                  <Link href={n.href} className={link}>
                    {n.label}
                  </Link>
                ) : (
                  <span className="text-dim">{n.label}</span>
                )}
              </li>
            ))}
            <li>
              <Link href="/directory" className={link}>
                Staff directory
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Across the parishes">
          <p className={head}>Across the parishes</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/diocese/near" className={link}>
                {s.diocese.nav.near}
              </Link>
            </li>
            <li>
              <Link href="/diocese/events" className={link}>
                {s.diocese.nav.events}
              </Link>
            </li>
            <li>
              <Link href="/diocese/groups" className={link}>
                {s.diocese.nav.groups}
              </Link>
            </li>
            <li>
              <Link href="/diocese/voice" className={link}>
                {s.diocese.voice.title}
              </Link>
            </li>
            <li>
              <Link href="/diocese/insider" className={link}>
                {s.diocese.news.digestTitle}
              </Link>
            </li>
            <li>
              <Link href="/diocese" className={link}>
                {s.diocese.nav.parishes}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className={head}>The data</p>
          <ul className="mt-3 space-y-2 text-dim">
            <li>{c.checked(fmtDate(d.finder.readAt, true, lang))}</li>
            <li>
              <Link href="/diocese/report" className="inline-block min-h-6 font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                {c.report}
              </Link>
            </li>
            <li>
              <Link href="/diocese/events.ics" className={link}>
                /diocese/events.ics
              </Link>
              {" · "}
              <Link href="/diocese/mass-times.json" className={link}>
                /diocese/mass-times.json
              </Link>
            </li>
            <li>
              <Link href="/diocese/security" className={link}>
                What is stored, and where
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <GlazedPlate line={c.builtBy} />
    </footer>
  );
}
