import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OpenOnHash from "@/components/OpenOnHash";
import SectionList from "@/components/SectionList";
import { Band, GoldButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, {
    title: s.formation.title,
    description: s.meta.formation(p.formation.map((x) => x.title).join(", "), p.parishName, p.church.city),
    path: "/faith-formation",
  });
}

export default async function FaithFormation() {
  const p = await getParish();
  if (!p.formation.length) notFound();
  const s = strings(p.lang);
  return (
    <>
      <PageHero title={s.formation.title} lede={s.formation.lede} photo={p.photos.about ?? p.photos.hero} priority />
      <Band tone="paper">
        <OpenOnHash />
        <div className="mb-10 flex flex-wrap items-center gap-4 rounded-sm border border-paper-dim bg-paper p-5">
          <p className="text-[17px] leading-relaxed text-ink">{s.requests.enroll.lede}</p>
          <GoldButton href="/enroll">{s.requests.enroll.h2}</GoldButton>
        </div>
        <SectionList sections={p.formation} label={s.formation.label} contactWord={s.sections.contact} />
      </Band>
    </>
  );
}
