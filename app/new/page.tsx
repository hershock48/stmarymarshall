import { pageMetadata } from "@/lib/meta";
import Image from "next/image";
import { NextUp } from "@/components/Schedule";
import { Band, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { CONFESSION, DAY_NAMES, fmtTime, massTimesSentence } from "@/lib/schedule";
import { SITE } from "@/lib/site";
import photo from "@/public/img/nave-easter.jpg";
import chapel from "@/public/img/chapel-renovation.jpg";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "New Here?",
  description: "Visiting St. Mary Catholic Church in Marshall for the first time? When Mass is, where the church is, what to expect, and how to register with the parish.",
  path: "/new",
});

/**
 * The page for a first visit. Every line is something the parish already
 * said somewhere on its old site or in its bulletin; nothing about parking
 * spots or which door is invented. The office can add to it.
 */
const QA = [
  {
    q: "When is Mass?",
    a: `${massTimesSentence()}. Confession is ${DAY_NAMES[CONFESSION[0].day]} from ${fmtTime(CONFESSION[0].start)} to ${fmtTime(CONFESSION[0].end!)}, with Adoration at the same time.`,
  },
  {
    q: "Where is the church?",
    a: `At the ${SITE.church.corner}, one block south of Michigan Avenue in downtown Marshall. Put ${SITE.church.street} in your map. The parish office is around the corner at ${SITE.office.street.replace(/\.$/, "")}.`,
  },
  {
    q: "Do I need to be Catholic, or registered, to come?",
    a: "No. Mass is open to everyone. Come, sit anywhere, and follow along; nobody will single you out. Catholics in good standing receive Communion; everyone else is welcome to come forward for a blessing or to stay in the pew.",
  },
  {
    q: "What about the kids?",
    a: "Children are welcome at every Mass. Religious Education runs September to April for age 4 through 8th grade, on Sunday mornings between the Masses for the younger ones and Tuesday afternoons for grades 6 to 8. A Children’s Choir sings at the 9:00 AM Mass.",
  },
  {
    q: "Is there anything after Mass?",
    a: "During the school year, coffee hour follows most Sunday 9:00 AM Masses in the Parish Hall: coffee, muffins and a chance to meet people. The bulletin says which Sundays.",
  },
  {
    q: "I’m not Catholic, or I was and drifted. Where do I start?",
    a: "OCIA, which used to be called RCIA, meets Thursday evenings from September. It is for adults exploring the faith, adults who want to become Catholic, and Catholics who want to go deeper. You can sit in without committing to anything.",
  },
  {
    q: "How do I become a parishioner?",
    a: "Register online or on paper. The office sends new members a welcome packet and follows up. Registration is what makes you a parishioner for things like baptisms, weddings and Religious Education.",
  },
];

export default function NewHere() {
  return (
    <>
      <PageHero title="New here? Welcome." lede="Whether you are visiting Marshall, moving to town, coming back after a while, or just curious, here is what to expect." photo={photo} priority />
      <Band tone="navy" className="-mt-px">
        <NextUp />
      </Band>
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <H2>The questions people ask</H2>
            <dl className="mt-8 space-y-8">
              {QA.map((item) => (
                <div key={item.q}>
                  <dt className="display text-2xl leading-tight text-ink">{item.q}</dt>
                  <dd className="mt-2 text-[17px] leading-relaxed text-ink">{item.a}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <GoldButton href="/register">Register with the parish</GoldButton>
              <LineButton href="/mass-times" onPaper>
                Mass times and directions
              </LineButton>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={chapel} alt="St. Mary Chapel: oak pews, stained glass windows and the crucifix above the small altar." fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="mt-8 rounded-sm border border-paper-dim bg-paper-dim/50 p-5 text-[15px] leading-relaxed text-ink">
              <p className="font-semibold">Still have a question?</p>
              <p className="mt-1">
                Call the office at{" "}
                <a href={SITE.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {SITE.phone}
                </a>{" "}
                or email{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-marian underline underline-offset-4">
                  {SITE.email}
                </a>
                . A person answers.
              </p>
            </div>
            <ul className="mt-6 space-y-2 text-[15px]">
              <li>
                <a href="/sacraments" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                  Baptisms, weddings, anointing
                </a>
              </li>
              <li>
                <a href="/faith-formation#ocia" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                  OCIA and adult faith formation
                </a>
              </li>
              <li>
                <a href="/ministries" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                  Ways to get involved
                </a>
              </li>
              <li>
                <a href="/prayer-request" className="inline-block min-h-6 font-semibold text-marian underline underline-offset-4">
                  Ask for prayers
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Band>
    </>
  );
}
