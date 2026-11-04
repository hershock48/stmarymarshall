import type { Metadata } from "next";
import RequestForm from "@/components/RequestForm";
import { Band, H2, PageHero } from "@/components/ui";
import { strings, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { REQUESTS } from "@/lib/requests";
import { addDays, datedMasses, fmtDate, fmtTime, localNow, type Weekday } from "@/lib/schedule";
import { noDot } from "@/lib/sentences";
import type { Parish } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.requests.massIntentions.title, description: s.meta.massIntentions(p.shortName, p.church.city), path: "/mass-intentions" });
}

/**
 * The "preferred Mass" field offers the parish's actual Masses for the
 * next six weeks, from the schedule, so nobody types a date the parish
 * does not have. Still a request the office confirms, never a booking:
 * the site does not know which Masses are taken and does not pretend to.
 */
function massSlots(p: Parish, lang: Lang): string[] {
  const now = localNow(p.timeZone);
  const s = strings(lang).days;
  const out: string[] = [];
  const dated = datedMasses(p);
  for (let i = 1; i <= 42; i++) {
    const iso = addDays(now.iso, i);
    const wd = ((now.weekday + i) % 7) as Weekday;
    for (const m of p.masses.filter((x) => x.day === wd)) out.push(`${s[wd]} ${fmtDate(iso, false, lang)}, ${fmtTime(m.start)}${m.label && m.label !== s[wd] ? ` (${m.label})` : ""}`);
    for (const d of dated.filter((x) => x.date === iso)) out.push(`${s[wd]} ${fmtDate(iso, false, lang)}, ${fmtTime(d.start)} (${d.label})`);
  }
  return out;
}

export default async function MassIntentions({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.requests.massIntentions;
  const fields = REQUESTS["mass-intention"].fields.map((f) => (f.name === "preferred" ? { ...f, type: "select" as const, options: ["", ...massSlots(p, p.lang)] } : f));
  return (
    <>
      <PageHero title={t.title} lede={t.lede} photo={p.photos.chapel ?? p.photos.hero} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <H2>{t.h2}</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">{t.body(p.office ? noDot(p.office.street) : undefined)}</p>
            <div className="mt-8">
              <RequestForm kind="mass-intention" fields={fields} error={error} lang={p.lang} />
            </div>
          </div>
          <aside className="space-y-6 text-[15px] leading-relaxed text-ink lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.whatTitle}</h2>
              <p className="mt-2">{t.what}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.orCall}</h2>
              <p className="mt-2">
                {t.orCallBody1}
                <a href={p.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {p.phone}
                </a>
                {t.orCallBody2}
              </p>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}
