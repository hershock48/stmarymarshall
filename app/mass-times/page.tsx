import { pageMetadata } from "@/lib/meta";
import { FullSchedule, NextUp } from "@/components/Schedule";
import { Band, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { CONFESSION, DAY_NAMES, fmtDate, fmtTime, localNow, massTimesSentence, upcomingHolyDays } from "@/lib/schedule";
import { SITE } from "@/lib/site";
import photo from "@/public/img/chapel-renovation.jpg";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Mass Times and Directions",
  description: `Mass at St. Mary Catholic Church, Marshall MI: ${massTimesSentence()}. Confession and Adoration ${DAY_NAMES[CONFESSION[0].day]} ${fmtTime(CONFESSION[0].start)} to ${fmtTime(CONFESSION[0].end!)}. At the ${SITE.church.corner}.`,
  path: "/mass-times",
});

export default function MassTimes() {
  const holyDays = upcomingHolyDays(localNow());
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
              St. Mary Church stands at the {SITE.church.corner} in Marshall, one block south of Michigan Avenue. The address for a map is {SITE.church.street.replace(/\.$/, "")}. The parish office is around the corner at {SITE.office.street}, and that is the mailing address for everything.
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
          <div id="holy-days" className="scroll-mt-24">
            <H2>Holy Days of Obligation</H2>
            <ul className="mt-6 divide-y divide-paper-dim border-y border-paper-dim">
              {holyDays.map((h) => (
                <li key={h.date} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <p className="font-semibold tabular-nums text-ink">{fmtDate(h.date, true)}</p>
                  <div>
                    <p className="font-semibold text-ink">{h.label}</p>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {h.masses ? h.masses.map((m) => `${m.label ? `${m.label} ` : ""}${fmtTime(m.start)}`).join(", ") : "Mass times are announced in the bulletin."}
                      {h.note ? ` ${h.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">
              The Ascension is kept on the following Sunday in Michigan. Seasonal changes are announced in the bulletin and on the parish Facebook page, and when the weather closes Marshall Public Schools the office will say whether anything is cancelled.
            </p>
            <div className="mt-6">
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
