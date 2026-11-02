import type { Metadata } from "next";
import { Band, GoldButton, LineButton, PageHero } from "@/components/ui";
import { strings } from "@/lib/i18n";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return { title: s.thanks.title, description: s.thanks.description(p.parishName), robots: { index: false } };
}

/** Shared thanks page for the registration and request forms. */
export default async function Thanks({ searchParams }: { searchParams: Promise<{ state?: string; kind?: string }> }) {
  const { state, kind } = await searchParams;
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.thanks;
  const sent = state === "sent";
  const failed = state === "failed";
  const what = t.kinds[(kind ?? "register") as keyof typeof t.kinds] ?? t.kinds.register;
  return (
    <>
      <PageHero title={sent ? t.thankYou : t.received} lede={sent ? t.onItsWay(what.thing) : t.whereItStands(what.thing)} />
      <Band tone="paper">
        <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed text-ink">
          {sent ? (
            <p>{what.sent(p.shortName)}</p>
          ) : (
            <>
              <p>{failed ? t.failed(what.thing) : t.unconfigured(what.thing)}</p>
              <p>{t.sorry}</p>
            </>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <GoldButton href={p.phoneHref}>{t.call(p.phone)}</GoldButton>
            <LineButton href="/mass-times" onPaper>
              {t.massTimes}
            </LineButton>
          </div>
        </div>
      </Band>
    </>
  );
}
