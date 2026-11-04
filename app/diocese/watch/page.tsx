import type { Metadata } from "next";
import Link from "next/link";
import DioceseNav from "@/components/DioceseNav";
import { Band } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { platformParishes } from "@/lib/diocese";
import { getDiocese, getParish } from "@/lib/parish";
import { dioceseName } from "@/dioceses";
import { hasWatch } from "@/lib/paths";
import { datedMasses, localNow, massOnNow, nextService, whenWord } from "@/lib/schedule";
import { watchSource } from "@/lib/stream";
import { latestVoice, watchUrl } from "@/lib/voice";

/**
 * Watch across the diocese: every platform parish that streams, with what is
 * on now and its next Mass, and the bishop's newest message. The diocese's
 * own "one stream, every site" page; with hosted video the bishop's Mass
 * from the cathedral is the first row.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const d = await getDiocese();
  const s = strings(p.lang).diocese;
  return { title: `${s.watch.dioceseTitle} | ${dioceseName(d, p.lang)}`, description: s.watch.dioceseLede, robots: { index: false }, alternates: {} };
}

export default async function DioceseWatch() {
  const p = await getParish();
  const d = await getDiocese();
  const lang = p.lang;
  const s = strings(lang).diocese;
  const t = s.watch;
  const rows = platformParishes(d)
    .filter(hasWatch)
    .map((q) => {
      const now = localNow(q.timeZone);
      const specials = datedMasses(q);
      return { q, src: watchSource(q)!, on: massOnNow(q.masses, now, specials), next: nextService(q.masses, now, specials, lang) };
    });
  const bishop = latestVoice(d, lang);
  const site = (q: (typeof rows)[number]["q"]) => (q.pitchHost ? `https://${q.pitchHost}/demo` : `https://${q.hosts[0]}`);
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{dioceseName(d, p.lang)}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.dioceseTitle}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.dioceseLede}</p>
        </div>
      </section>
      <DioceseNav lang={lang} current="watch" />
      <Band tone="paper">
        {rows.length === 0 ? <p className="text-lg text-ink">{t.none}</p> : null}
        <ul className="grid gap-5 lg:grid-cols-2">
          {rows.map(({ q, src, on, next }) => (
            <li key={q.slug} className="rounded-sm border border-paper-dim bg-paper p-5">
              <h2 className="display text-2xl text-ink">
                {q.name} <span className="text-base font-normal text-ink-soft">· {q.church.city}</span>
              </h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-marian">{on ? t.liveNow(on.label) : t.notNow}</p>
              {next ? <p className="mt-1 text-ink">{t.nextMass(whenWord(next, lang), next.time)}</p> : null}
              <p className="mt-1 text-sm text-ink-soft">{src.kind === "hosted" ? t.hosted : src.kind === "youtube" ? t.viaYouTube : src.kind === "facebook" ? t.viaFacebook : ""}</p>
              <p className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold">
                <a href={`${site(q)}/watch`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                  {t.parishPage}
                </a>
                {on && (src.kind === "facebook" || src.kind === "link") ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                    {src.kind === "facebook" ? t.onFacebook : s.watch.onYouTube}
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
        {bishop ? (
          <div className="mt-12 rounded-sm border border-paper-dim bg-paper p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.bishop}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{bishop.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{bishop.lede}</p>
            <p className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold">
              {bishop.youtube ? (
                <a href={watchUrl(bishop.youtube)} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                  {s.voice.watch}
                </a>
              ) : null}
              <Link href="/diocese/voice" className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                {s.voice.all}
              </Link>
            </p>
          </div>
        ) : null}
      </Band>
    </>
  );
}
