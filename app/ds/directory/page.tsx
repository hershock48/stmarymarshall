import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonCard, SmartLink } from "@/components/DsModules";
import type { SitePerson } from "@/lib/dsite";
import { getDiocese } from "@/lib/parish";
import { siteBySlug } from "@/dioceses/sites";

/**
 * The staff directory: every person the diocese names on one of its own
 * pages, under the office that page is for, each with a phone and an
 * email. Nothing is typed here; a person appears because an office page
 * lists them, and leaves when that page stops.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const d = await getDiocese();
  return { title: `Staff directory | ${d.name}`, description: `The offices of the ${d.name} and the people in them, each with a phone and an email.`, robots: { index: false }, alternates: {} };
}

export default async function Directory() {
  const d = await getDiocese();
  const site = siteBySlug(d.slug);
  if (!site) notFound();
  const offices = site.pages
    .map((p) => {
      const seen = new Set<string>();
      const people: SitePerson[] = [];
      for (const m of p.modules) if (m.kind === "people") for (const x of m.people) if (!seen.has(x.name)) people.push(x), seen.add(x.name);
      return { slug: p.slug, title: p.title, people };
    })
    .filter((o) => o.people.length > 0)
    .sort((a, b) => a.title.localeCompare(b.title));
  const count = new Set(offices.flatMap((o) => o.people.map((p) => p.name))).size;
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <h1 className="display max-w-4xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">Staff directory</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">
            {count} people in {offices.length} offices, as each office’s own page lists them. The Pastoral Center’s main number is{" "}
            <a href={site.center.phoneHref} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              {site.center.phone}
            </a>
            .
          </p>
        </div>
      </section>
      <section className="paper">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {offices.map((o) => (
              <section key={o.slug} aria-labelledby={`office-${o.slug}`}>
                <h2 id={`office-${o.slug}`} className="display text-2xl leading-tight text-ink">
                  <SmartLink href={`/${o.slug}`} className="underline decoration-marian/30 underline-offset-4 hover:decoration-marian">
                    {o.title}
                  </SmartLink>
                </h2>
                <ul className="mt-2">
                  {o.people.map((p) => (
                    <PersonCard key={p.name} p={p} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
