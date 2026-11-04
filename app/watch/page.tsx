import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Band, GoldButton, LineButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { hasWatch } from "@/lib/paths";
import { datedMasses, fmtTime, localNow, massOnNow, nextService, whenWord } from "@/lib/schedule";
import { watchSource } from "@/lib/stream";

/**
 * Watch Mass online, schedule-aware: the player shows from a quarter hour
 * before a Mass to ninety minutes after; the rest of the week the page says
 * when the next Mass is and where the recordings are. A visitor never
 * meets an offline player. The source is whatever the parish has
 * (lib/stream.ts): its own hosted stream, its YouTube channel, or the
 * Facebook page it streams on.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.massTimes.watch, description: s.diocese.watch.lede(p.name), path: "/watch" });
}

export default async function WatchPage() {
  const p = await getParish();
  if (!hasWatch(p)) notFound();
  const s = strings(p.lang);
  const t = s.diocese.watch;
  const src = watchSource(p)!;
  const now = localNow(p.timeZone);
  const specials = datedMasses(p);
  const on = massOnNow(p.masses, now, specials);
  const next = nextService(p.masses, now, specials, p.lang);
  const embeds = src.kind === "hosted" || src.kind === "youtube";
  const status = on ? (now.minutes < Number(on.start.slice(0, 2)) * 60 + Number(on.start.slice(3)) ? t.soon(on.label, fmtTime(on.start)) : t.liveNow(on.label)) : t.notNow;
  return (
    <>
      <PageHero title={s.massTimes.watch} lede={t.lede(p.name)} photo={p.photos.about ?? p.photos.hero} priority />
      <Band tone="navy" className="-mt-px">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{status}</p>
        {next ? (
          <p className="mt-2 text-lg text-cream">
            {t.nextMass(whenWord(next, p.lang), next.time)} <span className="text-dim">{next.label !== next.dayName ? next.label : ""}</span>
          </p>
        ) : null}
        {on && embeds ? (
          <div className="mt-6 aspect-video overflow-hidden rounded-sm bg-black">
            <iframe src={src.iframe} title={`${p.name}: ${on.label}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="h-full w-full" referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {src.kind === "facebook" ? <GoldButton href={src.url} external>{t.onFacebook}</GoldButton> : null}
          {src.kind === "link" ? <GoldButton href={src.url} external>{s.massTimes.watch}</GoldButton> : null}
          {src.kind === "youtube" ? (
            <LineButton href={`${src.channel.replace(/\/$/, "")}/videos`} external>
              {t.recordings}
            </LineButton>
          ) : null}
          {src.kind !== "youtube" && p.youtube ? (
            <LineButton href={p.youtube} external>
              {t.recordings}
            </LineButton>
          ) : null}
          <LineButton href="/mass-times">{s.nav.massTimes}</LineButton>
        </div>
        <p className="mt-5 text-sm text-dim">{src.kind === "hosted" ? t.hosted : src.kind === "youtube" ? t.viaYouTube : src.kind === "facebook" ? t.viaFacebook : ""}</p>
      </Band>
    </>
  );
}
