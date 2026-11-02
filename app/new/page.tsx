import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NextUp } from "@/components/Schedule";
import { Band, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { noDot, whenIsMass } from "@/lib/sentences";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.nav.newHere, description: s.meta.newHere(p.name, p.church.city), path: "/new" });
}

/**
 * The page for a first visit. The first questions are answered from the
 * data (when Mass is, where the church is, who may come, how to register);
 * a parish adds its own in `newHere`. Nothing about parking spots or which
 * door is invented.
 */
export default async function NewHere() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.newHere;
  const qa = [
    { q: t.qa.whenMass, a: whenIsMass(p, p.lang) },
    { q: t.qa.where, a: t.qa.whereAnswer(p.church.street, p.church.corner, p.office ? noDot(p.office.street) : undefined) },
    { q: t.qa.catholic, a: t.qa.catholicAnswer },
    ...(p.newHere ?? []),
    { q: t.qa.parishioner, a: t.qa.parishionerAnswer },
  ];
  const photo = p.photos.about ?? p.photos.chapel;
  return (
    <>
      <PageHero title={t.title} lede={t.lede(p.church.city)} photo={p.photos.hero} priority />
      <Band tone="navy" className="-mt-px">
        <NextUp parish={p} />
      </Band>
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <H2>{t.questions}</H2>
            <dl className="mt-8 space-y-8">
              {qa.map((item) => (
                <div key={item.q}>
                  <dt className="display text-2xl leading-tight text-ink">{item.q}</dt>
                  <dd className="mt-2 text-[17px] leading-relaxed text-ink">{item.a}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <GoldButton href="/register">{t.register}</GoldButton>
              <LineButton href="/mass-times" onPaper>
                {t.massTimes}
              </LineButton>
            </div>
          </div>
          <div className="lg:col-span-2">
            {photo && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="mt-8 rounded-sm border border-paper-dim bg-paper-dim/50 p-5 text-[15px] leading-relaxed text-ink">
              <p className="font-semibold">{t.still}</p>
              <p className="mt-1">
                {t.call1}
                <a href={p.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {p.phone}
                </a>
                {p.email && (
                  <>
                    {t.call2}
                    <a href={`mailto:${p.email}`} className="font-semibold text-marian underline underline-offset-4">
                      {p.email}
                    </a>
                  </>
                )}
                {t.call3}
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-[15px]">
              <li>
                <Link href="/sacraments" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                  {t.links.sacraments}
                </Link>
              </li>
              {p.formation.some((f) => f.slug === "ocia") && (
                <li>
                  <Link href="/faith-formation#ocia" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                    {t.links.ocia}
                  </Link>
                </li>
              )}
              {p.ministries.length > 0 && (
                <li>
                  <Link href="/ministries" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                    {t.links.ministries}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/prayer-request" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                  {t.links.prayers}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Band>
    </>
  );
}
