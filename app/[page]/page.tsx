import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OpenOnHash from "@/components/OpenOnHash";
import SectionList from "@/components/SectionList";
import { Band, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

/**
 * A parish's own pages beyond the core: anything in `pages` on its data,
 * rendered as a section page with the same fold rows as ministries. This
 * is how a 78-page parish and a 6-page mission share one codebase.
 */
export const dynamic = "force-dynamic";

async function find(slug: string) {
  const p = await getParish();
  return { p, page: p.pages.find((pg) => pg.slug === slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page: slug } = await params;
  const { p, page } = await find(slug);
  if (!page) notFound();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: page.title,
    description: page.lede ?? s.meta.page(page.sections.map((x) => x.title).join(", "), p.parishName, p.church.city),
    path: `/${page.slug}`,
  });
}

export default async function ParishPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: slug } = await params;
  const { p, page } = await find(slug);
  if (!page) notFound();
  const s = strings(p.lang);
  return (
    <>
      <PageHero title={page.title} lede={page.lede} photo={p.photos.about ?? p.photos.hero} priority />
      <Band tone="paper">
        <OpenOnHash />
        <SectionList sections={page.sections} label={page.title} contactWord={s.sections.contact} />
      </Band>
    </>
  );
}
