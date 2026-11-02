import type { Metadata } from "next";
import Link from "next/link";
import RequestForm from "@/components/RequestForm";
import { Band, H2, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { REQUESTS } from "@/lib/requests";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.requests.prayer.title, description: s.meta.prayer(p.parishName, p.church.city), path: "/prayer-request" });
}

export default async function PrayerRequest({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.requests.prayer;
  return (
    <>
      <PageHero title={t.title} lede={t.lede} photo={p.photos.extra?.[0] ?? p.photos.give ?? p.photos.hero} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <H2>{t.h2}</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">{t.body}</p>
            <div className="mt-8">
              <RequestForm kind="prayer-request" fields={REQUESTS["prayer-request"].fields} error={error} lang={p.lang} />
            </div>
          </div>
          <aside className="space-y-6 text-[15px] leading-relaxed text-ink lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.sickTitle}</h2>
              <p className="mt-2">
                {t.sick1}
                <a href={p.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {p.phone}
                </a>
                {t.sick2}
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.massTitle}</h2>
              <p className="mt-2">
                {t.mass1}
                <Link href="/mass-intentions" className="font-semibold text-marian underline underline-offset-4">
                  {t.massLink}
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}
