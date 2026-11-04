import type { Metadata } from "next";
import Image from "next/image";
import DioceseNav from "@/components/DioceseNav";
import { Band } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { getDiocese, getParish } from "@/lib/parish";
import { dioceseName } from "@/dioceses";
import { fmtDate } from "@/lib/schedule";
import { channelVideos, embedUrl, latestVoice, pairOf, thumb, voiceEntries, watchUrl } from "@/lib/voice";

/**
 * The bishop's voice: every message the diocese has listed, newest first,
 * the newest one playing in place, the rest as cards, then the newest
 * uploads on the diocese's channel. The feed link is the way to follow it
 * without a social network. One iframe on the page, for the featured
 * message, from youtube-nocookie.com; the cards are images and links.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const d = await getDiocese();
  const s = strings(p.lang).diocese;
  return { title: `${s.voice.title} | ${dioceseName(d, p.lang)}`, description: s.voice.lede, robots: { index: false }, alternates: {} };
}

export default async function VoicePage() {
  const p = await getParish();
  const d = await getDiocese();
  const lang = p.lang;
  const s = strings(lang).diocese;
  const t = s.voice;
  const featured = latestVoice(d, lang);
  const entries = voiceEntries(d, lang).filter((v) => v.id !== featured?.id);
  const channel = await channelVideos(d, 8);
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{dioceseName(d, p.lang)}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.lede}</p>
          <p className="mt-6 text-sm">
            <a href="/diocese/voice.xml" className="inline-block min-h-6 font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              {t.subscribe}
            </a>
          </p>
        </div>
      </section>
      <DioceseNav lang={lang} current="voice" />
      {featured?.youtube ? (
        <Band tone="navy" className="-mt-px">
          <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
            <div className="aspect-video overflow-hidden rounded-sm bg-black lg:col-span-3">
              <iframe src={embedUrl(featured.youtube)} title={featured.title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full" referrerPolicy="strict-origin-when-cross-origin" />
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{t.card}</p>
              <h2 className="display mt-2 text-3xl leading-tight text-cream">{featured.title}</h2>
              <p className="mt-3 text-dim">{featured.lede}</p>
              <p className="mt-2 text-sm text-dim">{t.published(fmtDate(featured.date, true, lang))}</p>
              {pairOf(d, featured)?.youtube ? (
                <p className="mt-3 text-sm">
                  <a href={watchUrl(pairOf(d, featured)!.youtube!)} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                    {pairOf(d, featured)!.lang === "es" ? t.inSpanish : t.inEnglish}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </Band>
      ) : null}
      <Band tone="paper">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((v) => (
            <li key={v.id} className="rounded-sm border border-paper-dim bg-paper">
              {v.youtube ? (
                <a href={watchUrl(v.youtube)} target="_blank" rel="noopener noreferrer" aria-hidden="true" tabIndex={-1} className="block overflow-hidden rounded-t-sm">
                  <Image src={thumb(v.youtube)} alt="" width={480} height={270} className="aspect-video w-full object-cover" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
                </a>
              ) : null}
              <div className="p-5">
                <p className="text-xs uppercase tracking-wider text-ink-soft">
                  {fmtDate(v.date, true, lang)}
                  {v.lang !== lang ? ` · ${v.lang === "es" ? t.inSpanish : t.inEnglish}` : ""}
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-snug text-ink">{v.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{v.lede}</p>
                <p className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold">
                  {v.youtube ? (
                    <a href={watchUrl(v.youtube)} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                      {v.kind === "audio" ? t.listen : t.watch}
                    </a>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {channel.length ? (
          <div className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.onChannel}</h2>
            <ul className="mt-3 divide-y divide-paper-dim border-y border-paper-dim">
              {channel.map((c) => (
                <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <a href={watchUrl(c.id)} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                    {c.title}
                  </a>
                  <span className="text-sm tabular-nums text-ink-soft">{fmtDate(c.published, true, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Band>
    </>
  );
}
