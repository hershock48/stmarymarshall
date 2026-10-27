import { pageMetadata } from "@/lib/meta";
import Image from "next/image";
import { A, Band, Contact, GoldButton, H2, LineButton, PageHero, Prose } from "@/components/ui";
import { CEMETERY, HISTORY, STAFF } from "@/lib/content";
import { DOCS, LINKS, SITE } from "@/lib/site";
import photo from "@/public/img/nave-easter.jpg";
import cemetery from "@/public/img/cemetery.jpg";

export const metadata = pageMetadata({
  title: "About the Parish",
  description: "St. Mary Parish, Marshall, Michigan: how to reach the office, the staff, a history that begins in 1837, and St. Mary Cemetery on Centennial Road.",
  path: "/about",
});

export default function About() {
  return (
    <>
      <PageHero title="About St. Mary" lede="Who to call, who we are, and where we came from." photo={photo} priority />

      <Band tone="paper" id="contact">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>Contact</H2>
            <dl className="mt-6 space-y-5 text-[17px] text-ink">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Office and mailing address</dt>
                <dd className="mt-1 leading-relaxed">
                  {SITE.name}
                  <br />
                  {SITE.office.street}
                  <br />
                  {SITE.office.city}, {SITE.office.state} {SITE.office.zip}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Church</dt>
                <dd className="mt-1 leading-relaxed">
                  {SITE.church.street}, {SITE.church.corner}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Phone and email</dt>
                <dd className="mt-1">
                  <Contact text={`${SITE.phone} or ${SITE.email}`} />
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href={SITE.mapUrl} external>
                Directions
              </GoldButton>
              <LineButton href="/register" onPaper>
                Register with the parish
              </LineButton>
            </div>
          </div>
          <div id="staff" className="scroll-mt-24">
            <H2>Staff</H2>
            <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
              {STAFF.map((p) => (
                <li key={p.name} className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-marian">{p.role}</p>
                  <p className="display mt-1 text-2xl leading-tight text-ink">{p.name}</p>
                  <Contact text={[p.phone ? `${p.phone}${p.ext ? ` ext. ${p.ext}` : ""}` : null, p.email].filter(Boolean).join(" or ")} />
                  {p.link && (
                    <p className="mt-1 text-sm">
                      <A href={p.link.href} external>
                        {p.link.label}
                      </A>
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink-soft">
              From the pastor:{" "}
              <A href={DOCS.frCraigChristmas2025}>Christmas letter, 2025</A> and <A href={DOCS.frCraigMidsummer2025}>mid-summer update, 2025</A>. Parish photo directory:{" "}
              <A href={DOCS.directoryPriceList}>price list (PDF)</A>.
            </p>
          </div>
        </div>
      </Band>

      <Band tone="navy" id="history" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <div>
            <H2 className="text-cream">History</H2>
            <p className="mt-6 text-lg leading-relaxed text-dim">
              Mission priests on horseback in 1837. A resident pastor in 1852. The present church, dedicated October 27, 1889, renovated most recently in 2021.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>
                <a href={LINKS.renovationVideo} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light">
                  Watch the 2021 renovation
                </a>
              </li>
              <li>
                <a href={LINKS.stainedGlassCensus} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light">
                  The Michigan Stained Glass Census, which recorded the windows in 1994
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 text-[17px] leading-relaxed text-cream lg:col-span-2">
            {HISTORY.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </Band>

      <Band tone="paper" id="cemetery" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>{CEMETERY.name}</H2>
            <p className="mt-6 text-[17px] font-semibold text-ink">{CEMETERY.address}</p>
            <div className="mt-4">
              <Prose paragraphs={CEMETERY.body} />
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {CEMETERY.docs.map((d) => (
                <li key={d.href}>
                  <A href={d.href}>{d.label} (PDF)</A>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">{CEMETERY.plots}</p>
            <div className="mt-6">
              <LineButton href={CEMETERY.mapUrl} external onPaper>
                Directions to the cemetery
              </LineButton>
            </div>
          </div>
          <div>
            <div className="relative aspect-square overflow-hidden rounded-sm">
              <Image src={cemetery} alt="St. Mary Cemetery: the grounds under tall trees, the brick cemetery chapel, and a statue of Christ with arms raised." fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}
