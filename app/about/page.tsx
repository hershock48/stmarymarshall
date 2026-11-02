import type { Metadata } from "next";
import Image from "next/image";
import { A, Band, Contact, GoldButton, H2, LineButton, PageHero, Prose } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: s.about.title(p.shortName),
    description: s.meta.about(p.parishName, p.church.city, Boolean(p.history), p.cemetery?.name),
    path: "/about",
  });
}

export default async function About() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.about;
  const cemeteryPhoto = p.photos.extra?.[1];
  return (
    <>
      <PageHero title={t.title(p.shortName)} lede={t.lede} photo={p.photos.hero} priority />

      <Band tone="paper" id="contact">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>{t.contact}</H2>
            <dl className="mt-6 space-y-5 text-[17px] text-ink">
              {p.office && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.officeMailing}</dt>
                  <dd className="mt-1 leading-relaxed">
                    {p.name}
                    <br />
                    {p.office.street}
                    <br />
                    {p.office.city}, {p.office.state} {p.office.zip}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.church}</dt>
                <dd className="mt-1 leading-relaxed">
                  {p.church.street}
                  {p.church.corner ? `, ${p.church.corner}` : ""}
                  <br />
                  {p.church.city}, {p.church.state} {p.church.zip}
                </dd>
              </div>
              {p.officeHours && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.officeHours}</dt>
                  <dd className="mt-1 leading-relaxed">
                    {p.officeHours.map((h) => (
                      <span key={h} className="block">
                        {h}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{p.email ? t.phoneEmail : t.phone}</dt>
                <dd className="mt-1">
                  <Contact text={[p.phone, p.email].filter(Boolean).join(" · ")} />
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href={p.mapUrl} external>
                {t.directions}
              </GoldButton>
              <LineButton href="/register" onPaper>
                {t.register}
              </LineButton>
            </div>
            {p.docs.length > 0 && (
              <ul className="mt-8 space-y-1.5 text-sm">
                {p.docs.map((d) => (
                  <li key={d.href}>
                    <A href={d.href} external={/^https?:/.test(d.href)}>
                      {d.label}
                      {d.href.endsWith(".pdf") ? t.pdf : ""}
                    </A>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div id="staff" className="scroll-mt-24">
            <H2>{t.staff}</H2>
            <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
              {p.staff.map((st) => (
                <li key={st.name + st.role} className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-marian">{st.role}</p>
                  <p className="display mt-1 text-2xl leading-tight text-ink">{st.name}</p>
                  {(st.phone || st.email) && <Contact text={[st.phone ? `${st.phone}${st.ext ? ` ext. ${st.ext}` : ""}` : null, st.email].filter(Boolean).join(" · ")} />}
                  {st.link && (
                    <p className="mt-1 text-sm">
                      <A href={st.link.href} external>
                        {st.link.label}
                      </A>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      {p.history && (
        <Band tone="navy" id="history" className="scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
            <div>
              <H2 className="text-cream">{t.history}</H2>
              <p className="mt-6 text-lg leading-relaxed text-dim">{p.history.lede}</p>
              {p.history.links && (
                <ul className="mt-6 space-y-2 text-sm">
                  {p.history.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-4 text-[17px] leading-relaxed text-cream lg:col-span-2">
              {p.history.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </Band>
      )}

      {p.cemetery && (
        <Band tone="paper" id="cemetery" className="scroll-mt-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <H2>{p.cemetery.name}</H2>
              <p className="mt-6 text-[17px] font-semibold text-ink">{p.cemetery.address}</p>
              <div className="mt-4">
                <Prose paragraphs={p.cemetery.body} />
              </div>
              {p.cemetery.docs && (
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {p.cemetery.docs.map((d) => (
                    <li key={d.href}>
                      <A href={d.href}>
                        {d.label}
                        {t.pdf}
                      </A>
                    </li>
                  ))}
                </ul>
              )}
              {p.cemetery.plots && <p className="mt-6 text-[17px] leading-relaxed text-ink">{p.cemetery.plots}</p>}
              {p.cemetery.mapUrl && (
                <div className="mt-6">
                  <LineButton href={p.cemetery.mapUrl} external onPaper>
                    {t.cemeteryDirections}
                  </LineButton>
                </div>
              )}
            </div>
            {cemeteryPhoto && (
              <div>
                <div className="relative aspect-square overflow-hidden rounded-sm">
                  <Image src={cemeteryPhoto.src} alt={cemeteryPhoto.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </div>
              </div>
            )}
          </div>
        </Band>
      )}
    </>
  );
}
