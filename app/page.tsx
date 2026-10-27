import Image from "next/image";
import Link from "next/link";
import { NextUp } from "@/components/Schedule";
import EventList from "@/components/EventList";
import { Band, GoldButton, H2, LineButton } from "@/components/ui";
import { WELCOME } from "@/lib/content";
import { occurrences } from "@/lib/events";
import { localNow } from "@/lib/schedule";
import { LINKS, SITE } from "@/lib/site";
import nave from "@/public/img/nave-easter.jpg";
import chapel from "@/public/img/chapel-altar.jpg";
import monstrance from "@/public/img/monstrance.jpg";

// The next-Mass tiles and the readings link depend on the parish clock, so
// this page renders per request (glaze.md: route caching and time do not mix).
export const dynamic = "force-dynamic";

export default function Home() {
  const now = localNow();
  const week = occurrences(now, 7).slice(0, 8);
  // USCCB's daily readings URL is MMDDYY.
  const [y, m, d] = now.iso.split("-");
  const readings = `${LINKS.usccbReadings}${m}${d}${y.slice(2)}.cfm`;
  const readingsEs = `${LINKS.usccbReadingsEs}${m}${d}${y.slice(2)}.cfm`;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy">
        <Image src={nave} alt="The nave of St. Mary Church during Mass, the congregation standing as the procession enters." fill priority sizes="100vw" className="object-cover object-[50%_35%] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Marshall, Michigan</p>
          <h1 className="display mt-3 max-w-3xl text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">St. Mary Catholic Church</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-dim sm:text-xl">
            A parish of the Diocese of Kalamazoo since 1852, at the corner of Eagle and Green Streets. All are welcome.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GoldButton href="/mass-times">Mass times and directions</GoldButton>
            <LineButton href="/new">New here?</LineButton>
          </div>
          <div className="mt-12">
            <NextUp />
          </div>
        </div>
      </section>

      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <H2>{WELCOME.heading}</H2>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink">
              {WELCOME.body.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LineButton href="/about" onPaper>
                About the parish
              </LineButton>
              <LineButton href="/sacraments" onPaper>
                Sacraments
              </LineButton>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={chapel} alt="The altar of St. Mary Chapel, with candles, lilies and the tabernacle." fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <p className="mt-3 text-sm text-ink-soft">St. Mary Chapel, renovated and rededicated in 2021.</p>
          </div>
        </div>
      </Band>

      <Band tone="navy">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <H2 className="text-cream">This week at St. Mary</H2>
            <div className="mt-6">
              <EventList items={week} onPaper={false} />
            </div>
            <div className="mt-8">
              <LineButton href="/events">Full calendar</LineButton>
            </div>
          </div>
          <div className="space-y-4">
            <Card title="This week’s bulletin" body="The parish bulletin, printed weekly, with the Mass intentions, the collection and the news." href="/bulletin" cta="Read the bulletin" />
            <Card title="Today’s readings" body="The daily Mass readings from the United States Conference of Catholic Bishops." href={readings} cta="Readings in English" external second={{ href: readingsEs, label: "Lecturas en español" }} />
            <Card title="Prayers and Mass intentions" body="Ask the parish to pray for someone, or have a Mass offered for a loved one, living or deceased." href="/prayer-request" cta="Prayer request" second={{ href: "/mass-intentions", label: "Mass intention" }} />
            <Card title="Give" body="Online giving, the We Care Fund and the parish endowment." href="/give" cta="Ways to give" />
          </div>
        </div>
      </Band>

      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
            <Image src={monstrance} alt="The monstrance on the altar of St. Mary Church during Eucharistic Adoration." fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <H2>Visit us</H2>
            <dl className="mt-6 grid gap-5 text-[17px] text-ink sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Church</dt>
                <dd className="mt-1 leading-relaxed">
                  {SITE.church.street}
                  <br />
                  {SITE.church.corner}
                  <br />
                  {SITE.church.city}, {SITE.church.state} {SITE.church.zip}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Office and mail</dt>
                <dd className="mt-1 leading-relaxed">
                  {SITE.office.street}
                  <br />
                  {SITE.office.city}, {SITE.office.state} {SITE.office.zip}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Phone</dt>
                <dd className="mt-1">
                  <a href={SITE.phoneHref} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                    {SITE.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${SITE.email}`} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                    {SITE.email}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href={SITE.mapUrl} external>
                Get directions
              </GoldButton>
              <LineButton href={SITE.facebook} external onPaper>
                Facebook
              </LineButton>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}

function Card({ title, body, href, cta, external, second }: { title: string; body: string; href: string; cta: string; external?: boolean; second?: { href: string; label: string } }) {
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <div className="rounded-sm border border-navy-line bg-navy-soft/60 p-5">
      <h3 className="display text-2xl text-cream">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-dim">{body}</p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
        {external ? (
          <a href={href} {...ext} className="inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light">
            {cta}
          </a>
        ) : (
          <Link href={href} className="inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light">
            {cta}
          </Link>
        )}
        {second && (
          <Link href={second.href} {...ext} className="inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light">
            {second.label}
          </Link>
        )}
      </p>
    </div>
  );
}
