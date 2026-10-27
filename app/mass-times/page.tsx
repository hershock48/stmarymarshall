import type { Metadata } from "next";
import { FullSchedule, NextUp } from "@/components/Schedule";
import { Band, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { SITE } from "@/lib/site";
import photo from "@/public/img/chapel-renovation.jpg";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mass Times and Directions",
  description: `Mass at St. Mary Catholic Church, Marshall MI: Saturday 5:00 PM, Sunday 9:00 and 11:00 AM, Tuesday 4:00 PM, Wednesday noon, Friday 7:30 AM. Confession and Adoration Saturday 3:30 to 4:30 PM. ${SITE.church.corner}.`,
  alternates: { canonical: "/mass-times" },
};

export default function MassTimes() {
  return (
    <>
      <PageHero title="Mass Times and Directions" lede="Mass, Confession and Adoration at St. Mary, and how to find the door." photo={photo} priority />
      <Band tone="navy" className="-mt-px">
        <NextUp />
        <div className="mt-10">
          <FullSchedule />
        </div>
      </Band>
      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>Finding the church</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">
              St. Mary Church stands at the {SITE.church.corner} in Marshall, one block south of Michigan Avenue. The address for a map is {SITE.church.street}. The parish office is around the corner at {SITE.office.street}, and that is the mailing address for everything.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton href={SITE.mapUrl} external>
                Directions to the church
              </GoldButton>
              <LineButton href={SITE.phoneHref} onPaper>
                Call {SITE.phone}
              </LineButton>
            </div>
          </div>
          <div>
            <H2>Holy days and changes</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">
              Holy day and seasonal Mass times are announced in the bulletin and on the parish Facebook page, and special Masses appear on this page as they are scheduled. When the weather closes Marshall Public Schools, the office will say whether anything else is cancelled.
            </p>
            <div className="mt-8">
              <LineButton href="/bulletin" onPaper>
                This week’s bulletin
              </LineButton>
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}
