import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { A, Band, GoldButton, H2, PageHero } from "@/components/ui";
import { bulletins } from "@/lib/bulletins";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.bulletin.title, description: s.meta.bulletin(p.parishName), path: "/bulletin" });
}

export default async function Bulletin() {
  const p = await getParish();
  if (!p.bulletins) notFound();
  const s = strings(p.lang);
  const t = s.bulletin;
  const list = await bulletins(p.bulletins);
  const [latest, ...older] = list;
  return (
    <>
      <PageHero title={t.title} lede={t.lede} photo={p.photos.chapel ?? p.photos.hero} priority />
      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>{t.thisWeek}</H2>
            {latest ? (
              <>
                <p className="display mt-6 text-4xl text-ink">{latest.label}</p>
                <div className="mt-6">
                  <GoldButton href={latest.href} external>
                    {t.open}
                  </GoldButton>
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-[17px] leading-relaxed text-ink">{t.everyIssue}</p>
                <div className="mt-6">
                  <GoldButton href={p.bulletins} external>
                    {t.openAll}
                  </GoldButton>
                </div>
              </>
            )}
            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              {t.note1}
              <A href={p.bulletins} external>
                {t.theirPage}
              </A>
              .
            </p>
          </div>
          {older.length > 0 && (
            <div>
              <H2>{t.recent}</H2>
              <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
                {older.map((b) => (
                  <li key={b.href} className="py-3">
                    <A href={b.href} external>
                      {b.label}
                    </A>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Band>
    </>
  );
}
