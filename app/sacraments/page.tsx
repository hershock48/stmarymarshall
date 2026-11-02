import type { Metadata } from "next";
import { A, Band, Contact, H2, LineButton, PageHero, Prose } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: s.sacraments.title,
    description: s.meta.sacraments(p.sacraments.map((x) => x.title).join(", "), p.name, p.church.city),
    path: "/sacraments",
  });
}

export default async function Sacraments() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.sacraments;
  return (
    <>
      <PageHero title={t.title} lede={t.lede(p.shortName)} photo={p.photos.chapel ?? p.photos.hero} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav aria-label={t.title} className="lg:sticky lg:top-24 lg:self-start">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold lg:block lg:space-y-2">
              {p.sacraments.map((x) => (
                <li key={x.slug}>
                  <a href={`#${x.slug}`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian">
                    {x.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-12">
            {p.sacraments.map((x) => (
              <section key={x.slug} id={x.slug} className="scroll-mt-24">
                <H2>{x.title}</H2>
                <div className="mt-6">
                  <Prose paragraphs={x.body} />
                </div>
                {x.links && (
                  <ul className="mt-4 space-y-1.5">
                    {x.links.map((l) => (
                      <li key={l.href}>
                        <A href={l.href} external={l.external}>
                          {l.label}
                          {l.href.endsWith(".pdf") ? " (PDF)" : ""}
                        </A>
                      </li>
                    ))}
                  </ul>
                )}
                {x.contact && (
                  <div className="mt-3">
                    <Contact text={x.contact} />
                  </div>
                )}
              </section>
            ))}
            <section className="border-t border-paper-dim pt-8">
              <p className="text-[17px] leading-relaxed text-ink">
                {p.confession.length ? t.confessionOnPage : ""}
                {t.massForSomeone}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {p.confession.length > 0 && (
                  <LineButton href="/mass-times#confession" onPaper>
                    {t.confessionTimes}
                  </LineButton>
                )}
                <LineButton href="/mass-intentions" onPaper>
                  {t.massIntentions}
                </LineButton>
              </div>
            </section>
          </div>
        </div>
      </Band>
    </>
  );
}
