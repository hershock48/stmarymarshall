import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OpenOnHash from "@/components/OpenOnHash";
import SectionList from "@/components/SectionList";
import { Band, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: s.ministries.title,
    description: s.meta.ministries(
      p.ministries
        .slice(0, 6)
        .map((x) => x.title)
        .join(", "),
      p.parishName,
      p.church.city,
    ),
    path: "/ministries",
  });
}

export default async function Ministries() {
  const p = await getParish();
  if (!p.ministries.length) notFound();
  const s = strings(p.lang);
  return (
    <>
      <PageHero title={s.ministries.title} lede={s.ministries.lede} photo={p.photos.extra?.[0] ?? p.photos.hero} priority />
      <Band tone="paper">
        <OpenOnHash />
        <SectionList sections={p.ministries} label={s.ministries.label} contactWord={s.sections.contact} />
      </Band>
    </>
  );
}
