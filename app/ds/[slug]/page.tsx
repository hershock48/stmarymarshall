import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DsModules, { SmartLink } from "@/components/DsModules";
import { around, pageBySlug, pageSummary, trail, type NavNode } from "@/lib/dsite";
import { getDiocese } from "@/lib/parish";
import { siteBySlug } from "@/dioceses/sites";

/**
 * One of the diocese's own pages (served at /<slug> on the diocese's site
 * host; proxy.ts), with its place in the menu above it and what sits
 * beside or beneath it alongside. The words and the order are the
 * diocese's. A page named in the site's pointers is never copied: it
 * shows its title and sends the reader to the diocese's own page.
 */
export const dynamic = "force-dynamic";

async function find(slug: string) {
  const d = await getDiocese();
  const site = siteBySlug(d.slug);
  return { d, site, page: site ? pageBySlug(site, slug) : undefined };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { d, page } = await find(slug);
  if (!page) notFound();
  return { title: `${page.title} | ${d.name}`, description: pageSummary(page) || `${page.title}, from the ${d.name}.`, robots: { index: false }, alternates: {} };
}

function Tree({ nodes, current, depth = 0 }: { nodes: NavNode[]; current: string; depth?: number }) {
  return (
    <ul className={depth === 0 ? "space-y-1.5" : "mt-1.5 space-y-1.5 border-l border-paper-dim pl-4"}>
      {nodes.map((n) => (
        <li key={n.label + n.href} className="text-[15px] leading-snug">
          {n.href ? (
            <SmartLink
              href={n.href}
              className={n.href === current ? "font-semibold text-ink" : "font-semibold text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian"}
            >
              {n.label}
            </SmartLink>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{n.label}</span>
          )}
          {n.children.length > 0 && depth < 2 ? <Tree nodes={n.children} current={current} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

export default async function DiocesePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { d, site, page } = await find(slug);
  if (!site || !page) notFound();
  const path = trail(site, slug);
  const beside = around(site, slug);
  const pointer = site.pointers[slug];
  const source = `${site.source}/${slug}`;
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <nav aria-label="Where this page sits" className="text-sm text-dim">
            <ol className="flex flex-wrap gap-x-2">
              <li>
                <SmartLink href="/" className="hover:text-cream">
                  {d.shortName}
                </SmartLink>
              </li>
              {path.slice(0, -1).map((n) => (
                <li key={n.label} className="flex gap-x-2">
                  <span aria-hidden="true">/</span>
                  {n.href ? (
                    <SmartLink href={n.href} className="hover:text-cream">
                      {n.label}
                    </SmartLink>
                  ) : (
                    <span>{n.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="display mt-3 max-w-4xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{page.title}</h1>
        </div>
      </section>
      <section className="paper">
        <div className={`mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 ${beside ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : ""}`}>
          <div className="min-w-0 max-w-3xl">
            {pointer ? (
              <div className="ds-prose">
                <p>
                  This page is kept in one place only, on the diocese’s own site, and is not copied here.{" "}
                  <a href={pointer} target="_blank" rel="noopener noreferrer">
                    Open it at {site.sourceHost}
                  </a>
                  .
                </p>
              </div>
            ) : page.modules.length > 0 ? (
              <DsModules modules={page.modules} source={source} />
            ) : (
              <div className="ds-prose">
                <p>
                  The diocese’s page at this address had nothing on it when it was read.{" "}
                  <a href={source} target="_blank" rel="noopener noreferrer">
                    Open it at {site.sourceHost}
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
          {beside ? (
            <nav aria-label={`In ${beside.heading}`} className="lg:border-l lg:border-paper-dim lg:pl-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{beside.heading}</h2>
              <div className="mt-3">
                <Tree nodes={beside.items} current={`/${slug}`} />
              </div>
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}
