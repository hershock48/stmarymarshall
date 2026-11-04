import type { Metadata } from "next";
import DioceseNav from "@/components/DioceseNav";
import { Band, Contact } from "@/components/ui";
import { dioceseGroups } from "@/lib/diocese";
import { strings } from "@/lib/i18n";
import { getDiocese, getParish } from "@/lib/parish";
import { dioceseName } from "@/dioceses";

/**
 * Groups across the diocese: every council, ministry and study group on
 * every platform parish, grouped by parish, each with its contact. The
 * person in one town finds the group in the next.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const d = await getDiocese();
  const s = strings(p.lang).diocese;
  return { title: `${s.groups.title} | ${dioceseName(d, p.lang)}`, description: s.groups.lede, robots: { index: false }, alternates: {} };
}

export default async function GroupsPage() {
  const p = await getParish();
  const d = await getDiocese();
  const s = strings(p.lang).diocese;
  const t = s.groups;
  const groups = dioceseGroups(d);
  const parishes = [...new Set(groups.map((g) => g.parish.slug))].map((slug) => groups.find((g) => g.parish.slug === slug)!.parish);
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{dioceseName(d, p.lang)}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.lede}</p>
        </div>
      </section>
      <DioceseNav lang={p.lang} current="groups" />
      <Band tone="paper">
        {groups.length === 0 ? <p className="text-lg text-ink">{t.none}</p> : null}
        <div className="space-y-12">
          {parishes.map((parish) => {
            const site = parish.pitchHost ? `https://${parish.pitchHost}/demo` : `https://${parish.hosts[0]}`;
            const mine = groups.filter((g) => g.parish.slug === parish.slug);
            return (
              <section key={parish.slug} aria-labelledby={`g-${parish.slug}`}>
                <h2 id={`g-${parish.slug}`} className="display text-3xl text-ink">
                  {parish.name} <span className="text-xl text-ink-soft">· {parish.church.city}</span>
                </h2>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {mine.map((g) => (
                    <li key={`${g.kind}-${g.slug}`} className="rounded-sm border border-paper-dim bg-paper p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-marian">{g.kind === "ministries" ? t.ministries : t.formation}</p>
                      <h3 className="mt-1 text-lg font-semibold text-ink">{g.title}</h3>
                      {g.body[0] ? <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{g.body[0]}</p> : null}
                      {g.contact ? (
                        <div className="mt-3 text-sm text-ink">
                          <span className="font-semibold">{t.contact}</span>
                          <Contact text={g.contact} />
                        </div>
                      ) : null}
                      <p className="mt-3 text-sm font-semibold">
                        <a href={`${site}/${g.kind === "ministries" ? "ministries" : "faith-formation"}#${g.slug}`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4" target="_blank" rel="noopener noreferrer">
                          {t.parishPage}
                        </a>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </Band>
    </>
  );
}
