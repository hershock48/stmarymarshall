import type { Metadata } from "next";
import Link from "next/link";
import { Band, H2, LineButton, PageHero } from "@/components/ui";
import { fmtLongDate, fmtRange, kindLabel } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { parishWeek } from "@/lib/news";
import { getParish } from "@/lib/parish";
import { fmtDate, localNow } from "@/lib/schedule";

/**
 * This week at the parish: compiled from what the office already keeps
 * (lib/news.ts). The same rows print as the bulletin insert and go out as
 * the feed, so the office types an announcement once, if at all.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang).diocese.news;
  return pageMetadata(p, { title: s.title, description: s.lede(p.shortName), path: "/news" });
}

export default async function NewsPage() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.diocese.news;
  const now = localNow(p.timeZone);
  const w = parishWeek(p, now, 7);
  const empty = !w.announcements.length && !w.masses.length && !w.events.length && !w.diocese.length;
  const link = "inline-block min-h-6 font-semibold text-marian underline decoration-marian/40 underline-offset-4";
  return (
    <>
      <PageHero title={t.title} lede={t.lede(p.shortName)} photo={p.photos.about ?? p.photos.hero} priority />
      <Band tone="paper">
        <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Link href="/bulletin-insert" className={link}>
            {t.insert}
          </Link>
          <a href="/news.xml" className={link}>
            {t.subscribe}
          </a>
        </p>
        {empty ? <p className="mt-8 text-[17px] text-ink">{t.none}</p> : null}
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-12">
            {w.announcements.length ? (
              <section>
                <H2>{t.announcements}</H2>
                <ul className="mt-6 space-y-6">
                  {w.announcements.map((a) => (
                    <li key={a.id}>
                      <p className="text-lg font-semibold text-ink">{a.title}</p>
                      <p className="mt-1 text-[17px] leading-relaxed text-ink">{a.body}</p>
                      {a.href ? (
                        <a href={a.href} className={`mt-1 ${link}`}>
                          {a.label ?? a.href}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {w.masses.length ? (
              <section>
                <H2>{t.masses}</H2>
                <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
                  {w.masses.map((m) => (
                    <li key={m.id} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                      <p className="font-semibold tabular-nums text-ink">{fmtDate(m.date, false, p.lang)}</p>
                      <div>
                        <p className="font-semibold text-ink">{m.title}</p>
                        <p className="text-sm text-ink-soft">
                          {m.when ?? s.massTimes.inBulletin}
                          {m.body ? ` ${m.body}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {w.diocese.length || w.bishop ? (
              <section>
                <H2>{t.diocese}</H2>
                <ul className="mt-6 space-y-5">
                  {w.diocese.map((d) => (
                    <li key={d.id}>
                      <p className="font-semibold text-ink">{d.title}</p>
                      <p className="text-[17px] leading-relaxed text-ink">{d.body}</p>
                      {d.href ? (
                        <Link href={d.href} className={link}>
                          {d.label ?? d.href}
                        </Link>
                      ) : null}
                    </li>
                  ))}
                  {w.bishop ? (
                    <li>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.bishop}</p>
                      <p className="mt-1 font-semibold text-ink">{w.bishop.title}</p>
                      <p className="text-[17px] leading-relaxed text-ink">{w.bishop.body}</p>
                      <Link href="/diocese/voice" className={link}>
                        {s.diocese.voice.all}
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </section>
            ) : null}
          </div>
          <div>
            {w.events.length ? (
              <section>
                <H2>{t.events}</H2>
                <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
                  {w.events.map((o, i) => (
                    <li key={i} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                      <p className="text-sm font-semibold tabular-nums text-ink">
                        {fmtLongDate(o.date, p.lang)}
                        <br />
                        <span className="font-normal text-ink-soft">{fmtRange(o, p.lang)}</span>
                      </p>
                      <div>
                        <p className="font-semibold text-ink">{o.title}</p>
                        <p className="text-sm text-ink-soft">{[o.where, kindLabel(o.kind, p.lang)].filter(Boolean).join(" · ")}</p>
                        {o.note ? <p className="mt-1 text-sm leading-relaxed text-ink-soft">{o.note}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
                {p.events.length ? (
                  <div className="mt-6">
                    <LineButton href="/events" onPaper>
                      {s.home.fullCalendar}
                    </LineButton>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </Band>
    </>
  );
}
