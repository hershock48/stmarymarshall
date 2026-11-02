import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Band, Contact, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.give.title, description: s.meta.give(p.parishName, p.church.city), path: "/give" });
}

export default async function Give() {
  const p = await getParish();
  const g = p.give;
  if (!g.url && !g.extras?.length) notFound();
  const s = strings(p.lang);
  const t = s.give;
  return (
    <>
      <PageHero title={t.title} lede={t.lede} photo={p.photos.give ?? p.photos.hero} priority />
      <Band tone="paper">
        <div className={`grid gap-12 ${g.extras?.length ? "lg:grid-cols-3 lg:gap-16" : ""}`}>
          <div className={g.extras?.length ? "lg:col-span-2" : ""}>
            <H2>{t.online}</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">{g.intro}</p>
            {g.funds && (
              <ul className="mt-5 space-y-2 text-[17px] leading-relaxed text-ink">
                {g.funds.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
            {g.url && (
              <div className="mt-8">
                <GoldButton href={g.url} external>
                  {t.giveOnline}
                </GoldButton>
              </div>
            )}
            <p className="mt-4 text-sm text-ink-soft">
              {g.provider ? t.provider(g.provider) : ""}
              {t.also}
            </p>
          </div>
          {g.extras && g.extras.length > 0 && (
            <div className="space-y-10">
              {g.extras.map((x) => (
                <section key={x.title}>
                  <h2 className="display rule text-3xl text-ink">{x.title}</h2>
                  <p className="mt-5 text-[17px] leading-relaxed text-ink">{x.body}</p>
                  {x.contact && (
                    <div className="mt-3">
                      <Contact text={x.contact} />
                    </div>
                  )}
                  {x.url && (
                    <div className="mt-5">
                      <LineButton href={x.url} external onPaper>
                        {x.linkLabel ?? t.giveLabel}
                      </LineButton>
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </Band>
    </>
  );
}
