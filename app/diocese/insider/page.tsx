import type { Metadata } from "next";
import Link from "next/link";
import DioceseNav from "@/components/DioceseNav";
import { Band } from "@/components/ui";
import { dioceseEvents, TIME_ZONE } from "@/lib/diocese";
import { fmtLongDate, fmtRange } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { liveAnnouncements } from "@/lib/news";
import { getParish } from "@/lib/parish";
import { ALL } from "@/lib/paths";
import { fmtDate, localNow } from "@/lib/schedule";
import { latestVoice, watchUrl } from "@/lib/voice";
import { liveNotices } from "@/parishes/diocese/notices";

/**
 * This week in the diocese: the chancery's notices, the bishop's newest
 * message, what the parishes offered up, and the next two weeks across the
 * diocese, on one page that is also a feed (/diocese/insider.xml). The
 * diocese's weekly email, compiled instead of assembled from forwarded
 * mail; the communications office pastes the feed into its email tool.
 */
export const dynamic = "force-dynamic";

const DAYS = 14;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang).diocese;
  return { title: `${s.news.digestTitle} | ${s.kicker}`, description: s.news.digestLede, robots: { index: false }, alternates: {} };
}

export default async function InsiderPage() {
  const p = await getParish();
  const lang = p.lang;
  const s = strings(lang).diocese;
  const t = s.news;
  const now = localNow(TIME_ZONE);
  const notices = liveNotices(now.iso);
  const bishop = latestVoice(lang);
  const offered = ALL.flatMap((q) => liveAnnouncements(q.announcements?.filter((a) => a.diocesan), now.iso, lang).map((a) => ({ ...a, parish: q })));
  const events = dioceseEvents(DAYS, now);
  const days = new Map<string, typeof events>();
  for (const o of events) {
    if (!days.has(o.date)) days.set(o.date, []);
    days.get(o.date)!.push(o);
  }
  const link = "inline-block min-h-6 font-semibold text-marian underline decoration-marian/40 underline-offset-4";
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{s.kicker}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.digestTitle}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.digestLede}</p>
          <p className="mt-6 text-sm">
            <a href="/diocese/insider.xml" className="inline-block min-h-6 font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              {t.digestFeed}
            </a>
          </p>
        </div>
      </section>
      <DioceseNav lang={lang} current="events" />
      <Band tone="paper">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marian">{t.weekOf(fmtDate(now.iso, true, lang))}</p>
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-10">
            {notices.length ? (
              <section>
                <h2 className="display text-3xl text-ink">{t.diocese}</h2>
                <ul className="mt-4 space-y-5">
                  {notices.map((n) => {
                    const x = lang === "es" && n.es ? n.es : n;
                    return (
                      <li key={n.id}>
                        <p className="font-semibold text-ink">{x.title}</p>
                        <p className="text-[17px] leading-relaxed text-ink">{x.body}</p>
                        {n.href ? (
                          <Link href={n.href} className={link}>
                            {x.label ?? n.label ?? n.href}
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
            {bishop ? (
              <section>
                <h2 className="display text-3xl text-ink">{t.bishop}</h2>
                <p className="mt-4 font-semibold text-ink">{bishop.title}</p>
                <p className="text-[17px] leading-relaxed text-ink">
                  {bishop.lede} {fmtDate(bishop.date, true, lang)}.
                </p>
                <p className="mt-2 flex flex-wrap gap-x-5 text-sm">
                  {bishop.youtube ? (
                    <a href={watchUrl(bishop.youtube)} target="_blank" rel="noopener noreferrer" className={link}>
                      {s.voice.watch}
                    </a>
                  ) : null}
                  <Link href="/diocese/voice" className={link}>
                    {s.voice.all}
                  </Link>
                </p>
              </section>
            ) : null}
            {offered.length ? (
              <section>
                <h2 className="display text-3xl text-ink">{t.offered}</h2>
                <ul className="mt-4 space-y-5">
                  {offered.map((a) => (
                    <li key={`${a.parish.slug}-${a.id}`}>
                      <p className="font-semibold text-ink">
                        {a.title} <span className="font-normal text-ink-soft">· {a.parish.shortName}</span>
                      </p>
                      <p className="text-[17px] leading-relaxed text-ink">{a.body}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          <div>
            <h2 className="display text-3xl text-ink">{s.events.days(DAYS)}</h2>
            <div className="mt-4 space-y-6">
              {[...days.entries()].map(([date, list]) => (
                <section key={date}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{fmtLongDate(date, lang)}</h3>
                  <ul className="mt-2 divide-y divide-paper-dim border-y border-paper-dim">
                    {list.map((o) => (
                      <li key={o.id} className="py-2.5">
                        <p className="font-semibold text-ink">
                          {o.title} <span className="font-normal text-ink-soft">· {o.host}, {o.town}</span>
                        </p>
                        <p className="text-sm text-ink-soft">
                          {fmtRange(o, lang)}
                          {o.where ? ` · ${o.where}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="mt-6 text-sm">
              <Link href="/diocese/events" className={link}>
                {s.nav.events}
              </Link>
            </p>
          </div>
        </div>
      </Band>
    </>
  );
}
