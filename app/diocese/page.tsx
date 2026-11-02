import type { Metadata } from "next";
import { Band, H2 } from "@/components/ui";
import { fmtTime, DAY_NAMES } from "@/lib/schedule";
import { allParishes, getParish } from "@/lib/parish";
import type { Service } from "@/lib/types";

/**
 * Every parish on the platform on one page: where it is, when Mass is,
 * where its site lives. The readable twin of /diocese/mass-times.json,
 * which is the same data for a machine. A chancellor opens this; a Parish
 * Finder reads that.
 *
 * Served on every host (the layout dresses it in whichever parish the host
 * is), and linked from the diocese letter on kalamazoo.glazedweb.com.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Every parish, one page | Diocese of Kalamazoo pilot", description: "Mass, Confession and Adoration times for every parish on the platform, with its address and its site.", robots: { index: false } };
}

function rows(list: Service[]) {
  return list.map((s, i) => (
    <li key={i} className="flex items-baseline justify-between gap-4 border-b border-paper-dim py-1.5 text-[15px] last:border-0">
      <span className="text-ink">
        {s.label ?? DAY_NAMES[s.day]}
        {s.lang ? <span className="ml-2 text-xs uppercase tracking-wider text-ink-soft">{s.lang}</span> : null}
      </span>
      <span className="font-semibold tabular-nums text-ink">
        {fmtTime(s.start)}
        {s.end ? ` to ${fmtTime(s.end)}` : ""}
      </span>
    </li>
  ));
}

export default async function Diocese() {
  // Only so the page knows which host it is on; the content is every parish.
  await getParish();
  const parishes = allParishes();
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Diocese of Kalamazoo · pilot</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">Every parish, one page</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dim">
            The parishes on the platform today, with their schedules read from the same data their own sites use. Nothing here is typed twice. The same page exists{" "}
            <a href="/diocese/mass-times.json" className="text-gold underline underline-offset-4 hover:text-gold-light">
              as data for a machine
            </a>
            , which is what a Parish Finder or a Mass-finder app would read.
          </p>
        </div>
      </section>
      <Band tone="paper">
        <div className="grid gap-8 lg:grid-cols-3">
          {parishes.map((p) => {
            const site = p.pitchHost ? `https://${p.pitchHost}/demo` : `https://${p.hosts[0]}`;
            return (
              <article key={p.slug} className="rounded-sm border border-paper-dim bg-paper p-6">
                <H2 className="text-2xl sm:text-3xl">{p.name}</H2>
                <p className="mt-4 text-[15px] leading-relaxed text-ink">
                  {p.church.street}
                  <br />
                  {p.church.city}, {p.church.state} {p.church.zip}
                  <br />
                  <a href={p.phoneHref} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                    {p.phone}
                  </a>
                  {p.lang === "es" ? <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Spanish</span> : null}
                </p>
                <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-marian">Mass</h3>
                <ul className="mt-1">{rows(p.masses)}</ul>
                {p.confession.length > 0 && (
                  <>
                    <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-marian">Confession</h3>
                    <ul className="mt-1">{rows(p.confession)}</ul>
                  </>
                )}
                {p.adoration.length > 0 && (
                  <>
                    <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-marian">Adoration</h3>
                    <ul className="mt-1">{rows(p.adoration)}</ul>
                  </>
                )}
                <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                  <a href={site} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4" target="_blank" rel="noopener noreferrer">
                    Open the site
                  </a>
                  <a href={`${site.replace(/\/demo$/, "")}/calendar.ics`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                    Calendar feed
                  </a>
                </p>
              </article>
            );
          })}
        </div>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-soft">
          Three parishes today. Every parish that moves to the platform appears here, and in the data behind it, the day its site goes up. The diocese would hold the repository this page is built from.
        </p>
      </Band>
    </>
  );
}
