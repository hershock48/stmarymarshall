import type { Metadata } from "next";
import Link from "next/link";
import DioceseNav from "@/components/DioceseNav";
import { Band } from "@/components/ui";
import { dioceseParishes } from "@/lib/diocese";
import { strings } from "@/lib/i18n";
import { getDiocese, getParish } from "@/lib/parish";
import { dioceseName } from "@/dioceses";

/**
 * "Wrong time? Tell us." The one line that keeps the finder honest for the
 * parishes still read from the diocese's Parish Finder: a visitor or an
 * office says what is wrong, the message reaches the chancery's inbox (or
 * ours, or the log until mail is connected), and the data is corrected.
 * Nothing is edited from here; a person reads it and fixes the source.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const d = await getDiocese();
  const s = strings(p.lang).diocese;
  return { title: `${s.report.title} | ${dioceseName(d, p.lang)}`, description: s.report.lede, robots: { index: false }, alternates: {} };
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await getParish();
  const d = await getDiocese();
  const lang = p.lang;
  const s = strings(lang).diocese;
  const t = s.report;
  const sp = await searchParams;
  const state = typeof sp.state === "string" ? sp.state : null;
  const picked = typeof sp.p === "string" ? sp.p : "";
  const parishes = dioceseParishes(d).slice().sort((a, b) => a.town.localeCompare(b.town) || a.name.localeCompare(b.name));
  const field = "min-h-11 w-full rounded-sm border border-paper-dim bg-white px-3 text-base text-ink";
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{dioceseName(d, p.lang)}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.lede}</p>
        </div>
      </section>
      <DioceseNav lang={lang} current="near" />
      <Band tone="paper">
        <div className="max-w-2xl">
          {state === "sent" || state === "unconfigured" || state === "failed" ? (
            <p role="status" className="rounded-sm border border-paper-dim bg-white p-5 text-[17px] leading-relaxed text-ink">
              {state === "sent" ? t.sent : state === "unconfigured" ? t.unconfigured : t.failed}
            </p>
          ) : null}
          {state !== "sent" ? (
            <form action="/api/report" method="post" className="mt-6 grid gap-5">
              {state === "required" ? <p className="text-sm font-semibold text-marian">{t.required}</p> : null}
              <label className="grid gap-1 text-sm font-semibold text-ink">
                {t.parish}
                <select name="parish" defaultValue={picked} className={field}>
                  <option value="">—</option>
                  {parishes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}, {q.town}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink">
                {t.what}
                <textarea name="what" required rows={4} className={`${field} py-2`} />
                <span className="text-xs font-normal text-ink-soft">{t.whatHint}</span>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink">
                {t.email}
                <input name="email" type="email" autoComplete="email" className={field} />
              </label>
              <div className="hidden" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <div>
                <button type="submit" className="inline-flex min-h-11 items-center rounded-sm bg-marian px-6 text-sm font-semibold text-white hover:opacity-90">
                  {t.send}
                </button>
              </div>
            </form>
          ) : null}
          <p className="mt-8 text-sm">
            <Link href="/diocese/near" className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
              {t.back}
            </Link>
          </p>
        </div>
      </Band>
    </>
  );
}
