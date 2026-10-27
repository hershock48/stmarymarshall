import type { Metadata } from "next";
import { Band, GoldButton, LineButton, PageHero } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your registration was sent to the St. Mary Parish office.",
  robots: { index: false },
};

export default async function Thanks({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const sent = state === "sent";
  return (
    <>
      <PageHero title={sent ? "Thank you" : "Received"} lede={sent ? "Your registration is on its way to the parish office." : "Your registration was received, and here is where it stands."} />
      <Band tone="paper">
        <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed text-ink">
          {sent ? (
            <p>The office will be in touch and send a welcome packet. Welcome to St. Mary.</p>
          ) : (
            <>
              <p>The website has your answers, but email delivery to the office is not switched on yet, so a person has not seen them. Rather than let that sit, please call the office so they can take your registration over the phone, or mail the printed form.</p>
              <p>Sorry for the extra step.</p>
            </>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <GoldButton href={SITE.phoneHref}>Call {SITE.phone}</GoldButton>
            <LineButton href="/mass-times" onPaper>
              Mass times
            </LineButton>
          </div>
        </div>
      </Band>
    </>
  );
}
