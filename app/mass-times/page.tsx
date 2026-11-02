import type { Metadata } from "next";
import { FullSchedule, NextUp } from "@/components/Schedule";
import { Band, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { fmtDate, fmtTime, localNow, massTimesSentence, upcomingHolyDays } from "@/lib/schedule";
import { confessionSentence, noDot, whereSentence } from "@/lib/sentences";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: s.massTimes.title,
    description: s.meta.massTimes(p.name, p.church.city, massTimesSentence(p.masses, p.lang), confessionSentence(p, p.lang), whereSentence(p, p.lang)),
    path: "/mass-times",
  });
}

export default async function MassTimes() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.massTimes;
  const holyDays = upcomingHolyDays(p, localNow(p.timeZone));
  return (
    <>
      <PageHero title={t.title} lede={t.lede(p.shortName, p.confession.length > 0, p.adoration.length > 0)} photo={p.photos.about ?? p.photos.hero} priority />
      <Band tone="navy" className="-mt-px">
        <NextUp parish={p} />
        <div className="mt-10">
          <FullSchedule parish={p} />
        </div>
      </Band>
      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>{t.finding}</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">
              {t.isAt(p.name, noDot(p.church.street), p.church.corner, p.church.city)}
              {p.office ? t.officeAt(noDot(p.office.street)) : ""}
            </p>
            {p.officeHours && (
              <p className="mt-3 text-[17px] leading-relaxed text-ink">
                {t.officeHours}: {p.officeHours.join("; ")}.
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href={p.mapUrl} external>
                {t.directions}
              </GoldButton>
              <LineButton href={p.phoneHref} onPaper>
                {t.call(p.phone)}
              </LineButton>
            </div>
          </div>
          <div id="holy-days" className="scroll-mt-24">
            <H2>{t.holyDays}</H2>
            {holyDays.length > 0 ? (
              <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
                {holyDays.map((h) => (
                  <li key={h.date} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                    <p className="font-semibold tabular-nums text-ink">{fmtDate(h.date, true, p.lang)}</p>
                    <div>
                      <p className="font-semibold text-ink">{h.label}</p>
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {h.masses && h.masses.length ? h.masses.map((m) => `${m.label ? `${m.label} ` : ""}${fmtTime(m.start)}`).join(", ") : t.inBulletin}
                        {h.note ? ` ${h.note}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-[17px] leading-relaxed text-ink">{t.holyDaysInBulletin}</p>
            )}
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              {t.ascension} {t.changes(Boolean(p.facebook))}
            </p>
            {p.bulletins && (
              <div className="mt-6">
                <LineButton href="/bulletin" onPaper>
                  {t.thisWeeksBulletin}
                </LineButton>
              </div>
            )}
          </div>
        </div>
      </Band>
    </>
  );
}
