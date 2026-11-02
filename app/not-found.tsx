import type { Metadata } from "next";
import Link from "next/link";
import HomeLink from "@/components/HomeLink";
import { Band, LineButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { navFor } from "@/lib/nav";
import { getParish } from "@/lib/parish";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return { title: s.notFound.title, description: s.notFound.description, robots: { index: false } };
}

export default async function NotFound() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.notFound;
  return (
    <>
      <PageHero title={t.title} lede={t.lede} />
      <Band tone="paper">
        <div className="flex flex-wrap gap-3">
          <HomeLink pitchHost={p.pitchHost} className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold px-6 font-semibold text-navy transition-colors hover:bg-gold-light">
            {t.home}
          </HomeLink>
          <LineButton href="/mass-times" onPaper>
            {t.massTimes}
          </LineButton>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          {navFor(p).map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="inline-block min-h-6 text-marian underline underline-offset-4">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
