import type { Metadata } from "next";
import { Band, GoldButton, LineButton, PageHero } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your message was sent to the St. Mary Parish office.",
  robots: { index: false },
};

const WHAT: Record<string, { thing: string; sent: string }> = {
  register: { thing: "registration", sent: "The office will be in touch and send a welcome packet. Welcome to St. Mary." },
  "mass-intention": { thing: "Mass intention request", sent: "The office will confirm the date once the Mass is on the calendar." },
  "prayer-request": { thing: "prayer request", sent: "The parish will pray for them." },
};

/** Shared thanks page for the registration and request forms. */
export default async function Thanks({ searchParams }: { searchParams: Promise<{ state?: string; kind?: string }> }) {
  const { state, kind } = await searchParams;
  const sent = state === "sent";
  const what = WHAT[kind ?? "register"] ?? WHAT.register;
  return (
    <>
      <PageHero title={sent ? "Thank you" : "Received"} lede={sent ? `Your ${what.thing} is on its way to the parish office.` : `Your ${what.thing} was received, and here is where it stands.`} />
      <Band tone="paper">
        <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed text-ink">
          {sent ? (
            <p>{what.sent}</p>
          ) : (
            <>
              <p>The website has your answers, but email delivery to the office is not switched on yet, so a person has not seen them. Rather than let that sit, please call the office so they can take your {what.thing} over the phone.</p>
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
