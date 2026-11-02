import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EventList from "@/components/EventList";
import { Band, PageHero } from "@/components/ui";
import { KINDS, kindLabel, occurrences } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { localNow } from "@/lib/schedule";
import type { EventKind } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: s.events.title,
    description: s.meta.events(p.parishName, [...new Set(p.events.map((e) => e.title))].slice(0, 6).join(", ")),
    path: "/events",
  });
}

export default async function Events({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const p = await getParish();
  if (!p.events.length) notFound();
  const s = strings(p.lang);
  const t = s.events;
  const now = localNow(p.timeZone);
  const all = occurrences(p.events, now, 42);
  const present = KINDS.filter((k) => p.events.some((e) => e.kind === k));
  const picked = present.includes(kind as EventKind) ? (kind as EventKind) : null;
  const items = picked ? all.filter((o) => o.kind === picked) : all;
  const host = p.hosts[0];

  return (
    <>
      <PageHero title={t.title} lede={t.lede(p.shortName, p.confession.length > 0)} photo={p.photos.hero} priority />
      <Band tone="paper">
        {/* Plain links, so the filter works with scripts off and each view has a URL. */}
        <nav aria-label={t.filter} className="flex flex-wrap gap-2">
          <Chip href="/events" active={!picked}>
            {t.everything}
          </Chip>
          {present.map((k) => (
            <Chip key={k} href={`/events?kind=${k}`} active={picked === k}>
              {kindLabel(k, p.lang)}
            </Chip>
          ))}
        </nav>
        <h2 className="sr-only">{t.sixWeeks}</h2>
        <div className="mt-10">
          <EventList items={items} lang={p.lang} showKind={!picked} addLinks />
        </div>
        <div className="mt-12 rounded-sm border border-paper-dim bg-paper-dim/50 p-5 text-[15px] leading-relaxed text-ink">
          <p className="font-semibold">{t.keep}</p>
          <p className="mt-1">
            {t.subscribe1}
            <a href={`webcal://${host}/calendar.ics`} className="font-semibold text-marian underline underline-offset-4">
              {t.subscribeLink}
            </a>
            {t.subscribe2}
            <span className="font-semibold">{host}/calendar.ics</span>.
          </p>
        </div>
        <p className="mt-8 text-sm leading-relaxed text-ink-soft">
          {t.weekly(p.confession.length > 0, p.adoration.length > 0)}
          <Link href="/mass-times" className="font-semibold text-marian underline underline-offset-4">
            {t.massTimesPage}
          </Link>
          {t.changes(Boolean(p.facebook))}
        </p>
      </Band>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${active ? "border-marian bg-marian text-paper" : "border-ink-soft/40 text-ink hover:border-marian hover:text-marian"}`}>
      {children}
    </Link>
  );
}
