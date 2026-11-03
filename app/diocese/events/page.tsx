import type { Metadata } from "next";
import DioceseNav from "@/components/DioceseNav";
import { Band } from "@/components/ui";
import { dioceseEvents, TIME_ZONE } from "@/lib/diocese";
import { fmtLongDate, fmtRange, KINDS, kindLabel } from "@/lib/events";
import type { EventKind } from "@/lib/types";
import { strings } from "@/lib/i18n";
import { occurrenceId } from "@/lib/ics";
import { getParish } from "@/lib/parish";
import { localNow } from "@/lib/schedule";

/**
 * This week across the diocese: every event on every platform parish's
 * calendar, soonest first, with a kind and a town filter. A fish fry in
 * the next town, a young adult night two towns over. Nobody posts
 * anything; the parish calendar is the post.
 */
export const dynamic = "force-dynamic";

const DAYS = 14;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang).diocese;
  return { title: `${s.events.title} | ${s.kicker}`, description: s.events.lede, robots: { index: false }, alternates: {} };
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await getParish();
  const lang = p.lang;
  const s = strings(lang).diocese;
  const t = s.events;
  const sp = await searchParams;
  const kind = KINDS.includes(sp.kind as EventKind) ? (sp.kind as EventKind) : null;
  const now = localNow(TIME_ZONE);
  const all = dioceseEvents(DAYS, now);
  const towns = [...new Set(all.map((o) => o.town))].sort();
  const town = typeof sp.town === "string" && towns.includes(sp.town) ? sp.town : null;
  const items = all.filter((o) => (!kind || o.kind === kind) && (!town || o.town === town));
  const days = new Map<string, typeof items>();
  for (const o of items) {
    if (!days.has(o.date)) days.set(o.date, []);
    days.get(o.date)!.push(o);
  }
  const site = (slug: string) => {
    const q = items.find((o) => o.parish.slug === slug)!.parish;
    return q.pitchHost ? `https://${q.pitchHost}/demo` : `https://${q.hosts[0]}`;
  };
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{s.kicker}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.lede}</p>
          <form action="/diocese/events" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-col gap-1 text-sm font-semibold text-cream">
              {t.kind}
              <select name="kind" defaultValue={kind ?? ""} className="min-h-11 rounded-sm border border-navy-line bg-navy-soft px-3 text-base text-cream">
                <option value="">{t.anyKind}</option>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {kindLabel(k, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-cream">
              {t.town}
              <select name="town" defaultValue={town ?? ""} className="min-h-11 rounded-sm border border-navy-line bg-navy-soft px-3 text-base text-cream">
                <option value="">{t.anyTown}</option>
                {towns.map((tw) => (
                  <option key={tw} value={tw}>
                    {tw}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center rounded-sm bg-gold px-5 text-sm font-semibold text-navy hover:bg-gold-light">
              {t.filter}
            </button>
          </form>
        </div>
      </section>
      <DioceseNav lang={lang} current="events" />
      <Band tone="paper">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marian">{t.days(DAYS)}</p>
        {days.size === 0 ? <p className="mt-4 text-lg text-ink">{t.none}</p> : null}
        <div className="mt-6 space-y-8">
          {[...days.entries()].map(([date, list]) => (
            <section key={date} aria-labelledby={`d-${date}`}>
              <h2 id={`d-${date}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">
                {fmtLongDate(date, lang)}
              </h2>
              <ul className="mt-2 divide-y divide-paper-dim border-y border-paper-dim">
                {list.map((o, i) => (
                  <li key={i} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <p className="font-semibold tabular-nums text-ink">{fmtRange(o, lang)}</p>
                    <div>
                      <p className="font-semibold text-ink">
                        {o.title} <span className="font-normal text-ink-soft">{t.at(`${o.parish.shortName}, ${o.town}`)}</span>
                      </p>
                      <p className="text-sm text-ink-soft">{[o.where, kindLabel(o.kind, lang)].filter(Boolean).join(" · ")}</p>
                      {o.note ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{o.note}</p> : null}
                      <p className="mt-1 flex flex-wrap gap-x-5 text-sm font-semibold">
                        <a href={`${site(o.parish.slug)}/calendar.ics?e=${occurrenceId(o)}`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                          {t.add}
                        </a>
                        <a href={`${site(o.parish.slug)}/events`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4" target="_blank" rel="noopener noreferrer">
                          {t.more}
                        </a>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Band>
    </>
  );
}
