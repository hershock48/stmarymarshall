import Image from "next/image";
import Link from "next/link";
import DiocesanNotice from "@/components/DiocesanNotice";
import { NextUp } from "@/components/Schedule";
import EventList from "@/components/EventList";
import { Band, GoldButton, H2, LineButton } from "@/components/ui";
import { occurrences } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { getParish } from "@/lib/parish";
import { localNow } from "@/lib/schedule";

// The next-Mass tiles and the readings link depend on the parish clock.
export const dynamic = "force-dynamic";

export default async function Home() {
  const p = await getParish();
  const s = strings(p.lang);
  const h = s.home;
  const now = localNow(p.timeZone);
  const week = occurrences(p.events, now, 7).slice(0, 8);
  // USCCB's daily readings URL is MMDDYY.
  const [y, m, d] = now.iso.split("-");
  const readingsEn = `https://bible.usccb.org/bible/readings/${m}${d}${y.slice(2)}.cfm`;
  const readingsEs = `https://bible.usccb.org/es/bible/lecturas/${m}${d}${y.slice(2)}.cfm`;
  const es = p.lang === "es";
  const secondPhoto = p.photos.chapel ?? p.photos.about;
  const visitPhoto = p.photos.extra?.[0] ?? p.photos.give;
  const hasGive = Boolean(p.give.url || p.give.extras?.length);

  return (
    <>
      <DiocesanNotice parish={p} />
      <section className="relative isolate overflow-hidden bg-navy">
        <Image src={p.photos.hero.src} alt={p.photos.hero.alt} fill priority sizes="100vw" className="object-cover object-[50%_35%] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{p.church.city}, Michigan</p>
          {/* 4xl at phone width: at 48px the fallback face wraps the title to a
              different line count than the web font and the swap moves the
              tiles below (CLS 0.10 on a throttled phone). */}
          <h1 className="display mt-3 max-w-3xl text-4xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">{p.name}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-dim sm:text-xl">{p.tagline}.</p>
          {/* Stacked at phone width so the font swap cannot re-wrap the pair. */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <GoldButton href="/mass-times">{h.massTimes}</GoldButton>
            <LineButton href="/new">{h.newHere}</LineButton>
          </div>
          <div className="mt-12">
            <NextUp parish={p} />
          </div>
        </div>
      </section>

      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <H2>{p.welcome.heading}</H2>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-ink">
              {p.welcome.body.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LineButton href="/about" onPaper>
                {h.aboutParish}
              </LineButton>
              <LineButton href="/sacraments" onPaper>
                {h.sacraments}
              </LineButton>
            </div>
          </div>
          {secondPhoto && (
            <div className="lg:col-span-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image src={secondPhoto.src} alt={secondPhoto.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            </div>
          )}
        </div>
      </Band>

      <Band tone="navy">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <H2 className="text-cream">{h.thisWeek(p.shortName)}</H2>
            <div className="mt-6">
              <EventList items={week} lang={p.lang} onPaper={false} />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {p.events.length > 0 && <LineButton href="/events">{h.fullCalendar}</LineButton>}
              <LineButton href="/diocese/events">{s.diocese.nav.events}</LineButton>
            </div>
          </div>
          <div className="space-y-4">
            {p.bulletins && <Card title={h.bulletin.title} body={h.bulletin.body} href="/bulletin" cta={h.bulletin.cta} />}
            <Card title={h.readings.title} body={h.readings.body} href={es ? readingsEs : readingsEn} cta={es ? h.readings.es : h.readings.en} external second={{ href: es ? readingsEn : readingsEs, label: es ? h.readings.en : h.readings.es }} />
            <Card title={h.prayers.title} body={h.prayers.body} href="/prayer-request" cta={h.prayers.cta} second={{ href: "/mass-intentions", label: h.prayers.second }} />
            {hasGive && <Card title={h.give.title} body={h.give.body} href="/give" cta={h.give.cta} />}
          </div>
        </div>
      </Band>

      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {visitPhoto && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
              <Image src={visitPhoto.src} alt={visitPhoto.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
          <div>
            <H2>{h.visit}</H2>
            <dl className="mt-6 grid gap-5 text-[17px] text-ink sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{h.church}</dt>
                <dd className="mt-1 leading-relaxed">
                  {p.church.street}
                  {p.church.corner && (
                    <>
                      <br />
                      {p.church.corner}
                    </>
                  )}
                  <br />
                  {p.church.city}, {p.church.state} {p.church.zip}
                </dd>
              </div>
              {p.office && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{h.officeAndMail}</dt>
                  <dd className="mt-1 leading-relaxed">
                    {p.office.street}
                    <br />
                    {p.office.city}, {p.office.state} {p.office.zip}
                  </dd>
                </div>
              )}
              {p.officeHours && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{h.officeHours}</dt>
                  <dd className="mt-1 leading-relaxed">
                    {p.officeHours.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{h.phone}</dt>
                <dd className="mt-1">
                  <a href={p.phoneHref} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                    {p.phone}
                  </a>
                </dd>
              </div>
              {p.email && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${p.email}`} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                      {p.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href={p.mapUrl} external>
                {h.directions}
              </GoldButton>
              {p.facebook && (
                <LineButton href={p.facebook} external onPaper>
                  Facebook
                </LineButton>
              )}
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}

function Card({ title, body, href, cta, external, second }: { title: string; body: string; href: string; cta: string; external?: boolean; second?: { href: string; label: string } }) {
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const cls = "inline-block min-h-6 text-gold underline underline-offset-4 hover:text-gold-light";
  return (
    <div className="rounded-sm border border-navy-line bg-navy-soft/60 p-5">
      <h3 className="display text-2xl text-cream">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-dim">{body}</p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
        {external ? (
          <a href={href} {...ext} className={cls}>
            {cta}
          </a>
        ) : (
          <Link href={href} className={cls}>
            {cta}
          </Link>
        )}
        {second &&
          (external ? (
            <a href={second.href} {...ext} className={cls}>
              {second.label}
            </a>
          ) : (
            <Link href={second.href} className={cls}>
              {second.label}
            </Link>
          ))}
      </p>
    </div>
  );
}
