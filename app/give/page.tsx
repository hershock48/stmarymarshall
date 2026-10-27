import { pageMetadata } from "@/lib/meta";
import { Band, Contact, GoldButton, H2, LineButton, PageHero } from "@/components/ui";
import { GIVE } from "@/lib/content";
import { LINKS } from "@/lib/site";
import photo from "@/public/img/adoration.jpg";

export const metadata = pageMetadata({
  title: "Give",
  description: "Give to St. Mary Parish, Marshall, Michigan: online giving one time or on a schedule, the We Care Fund for parish families in need, and the St. Mary Parish Endowment Fund.",
  path: "/give",
});

export default function Give() {
  return (
    <>
      <PageHero title="Give" lede="Thank you for supporting the parish." photo={photo} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <H2>Online giving</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">{GIVE.intro}</p>
            <ul className="mt-5 space-y-2 text-[17px] leading-relaxed text-ink">
              {GIVE.funds.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <GoldButton href={LINKS.giveOnline} external>
                Give online
              </GoldButton>
            </div>
            <p className="mt-4 text-sm text-ink-soft">Online giving runs through Vanco, the parish’s payment provider. Offerings are also welcome at Mass and at the office.</p>
          </div>
          <div className="space-y-10">
            <section>
              <h2 className="display rule text-3xl text-ink">{GIVE.weCare.title}</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-ink">{GIVE.weCare.body}</p>
              <div className="mt-3">
                <Contact text={GIVE.weCare.contact} />
              </div>
            </section>
            <section>
              <h2 className="display rule text-3xl text-ink">{GIVE.endowment.title}</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-ink">{GIVE.endowment.body}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <LineButton href={LINKS.endowment} external onPaper>
                  Give to the endowment
                </LineButton>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                Held by the{" "}
                <a href={LINKS.catholicFoundation} target="_blank" rel="noopener noreferrer" className="font-semibold text-marian underline underline-offset-4">
                  Catholic Foundation of Southwestern Michigan
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Band>
    </>
  );
}
