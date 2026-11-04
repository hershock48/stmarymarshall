import Link from "next/link";
import GlazedPlate from "@/components/GlazedPlate";
import { strings, type Lang } from "@/lib/i18n";
import { fmtDate } from "@/lib/schedule";
import finder from "@/parishes/diocese/finder.json";

/**
 * The header and footer the diocese layer wears on its own host
 * (lib/paths.ts isDioceseHost): the diocese's name, the four diocese pages,
 * no parish anywhere. A parish host dresses the same pages in the parish's
 * own header; this is what the diocese's Parish Finder page would point at.
 */
export function DioceseHeader({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const c = s.diocese.chrome;
  const n = s.diocese.nav;
  const items = [
    { href: "/", label: n.near },
    { href: "/diocese/events", label: n.events },
    { href: "/diocese/groups", label: n.groups },
    { href: "/diocese", label: n.parishes },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-navy-line bg-navy/95 backdrop-blur supports-[backdrop-filter]:bg-navy/85">
      <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-3 text-cream">
          <svg width="34" height="34" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="7" className="text-gold" aria-hidden="true">
            <circle cx="50" cy="50" r="45" />
            <path d="M50 22v56M32 42h36" strokeWidth="8" />
          </svg>
          <span className="display text-xl leading-none sm:text-2xl">
            {c.name} <span className="hidden text-dim sm:inline">· {c.sub}</span>
            <span className="sr-only">, {c.home}</span>
          </span>
        </Link>
        <nav aria-label={s.header.main} className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="inline-flex min-h-11 items-center whitespace-nowrap text-[14px] font-semibold tracking-wide text-dim hover:text-cream xl:text-[15px]">
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function DioceseFooter({ lang }: { lang: Lang }) {
  const s = strings(lang);
  const c = s.diocese.chrome;
  return (
    <footer className="border-t border-navy-line bg-navy">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <p className="display text-2xl leading-none text-cream">{c.name}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">{c.lede}</p>
          <p className="mt-3 text-sm text-dim">{c.checked(fmtDate(finder.readAt, true, lang))}</p>
        </div>
        <div className="text-sm">
          <ul className="space-y-2 text-dim">
            <li>
              <Link href="/diocese/report" className="inline-block min-h-6 font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                {c.report}
              </Link>
            </li>
            <li>
              <a href="https://www.diokzoo.org/" className="inline-block min-h-6 hover:text-cream" target="_blank" rel="noopener noreferrer">
                {c.site}: diokzoo.org
              </a>
            </li>
            <li>
              <Link href="/diocese/events.ics" className="inline-block min-h-6 hover:text-cream">
                /diocese/events.ics
              </Link>
              {" · "}
              <Link href="/diocese/mass-times.json" className="inline-block min-h-6 hover:text-cream">
                /diocese/mass-times.json
              </Link>
            </li>
            <li>
              <Link href="/diocese/security" className="inline-block min-h-6 hover:text-cream">
                /diocese/security
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <GlazedPlate line={c.builtBy} />
    </footer>
  );
}
