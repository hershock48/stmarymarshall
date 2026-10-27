import { pageMetadata } from "@/lib/meta";
import { A, Band, GoldButton, H2, PageHero } from "@/components/ui";
import { bulletins } from "@/lib/bulletins";
import { LINKS } from "@/lib/site";
import photo from "@/public/img/chapel-altar.jpg";

export const metadata = pageMetadata({
  title: "Bulletin",
  description: "The weekly St. Mary Parish bulletin: Mass intentions, the collection, announcements and news. This week's and the last three months.",
  path: "/bulletin",
});

export default async function Bulletin() {
  const list = await bulletins();
  const [latest, ...older] = list;
  return (
    <>
      <PageHero title="The Bulletin" lede="Printed every week. Mass intentions, the collection, and what is coming up." photo={photo} priority />
      <Band tone="paper">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>This week</H2>
            {latest ? (
              <>
                <p className="display mt-6 text-4xl text-ink">{latest.label}</p>
                <div className="mt-6">
                  <GoldButton href={latest.href} external>
                    Open the bulletin (PDF)
                  </GoldButton>
                </div>
              </>
            ) : (
              <>
                <p className="mt-6 text-[17px] leading-relaxed text-ink">The bulletin list could not be loaded just now. Every issue is on the parish’s DiscoverMass page.</p>
                <div className="mt-6">
                  <GoldButton href={LINKS.bulletins} external>
                    Bulletins on DiscoverMass
                  </GoldButton>
                </div>
              </>
            )}
            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              The bulletin is printed and hosted by Diocesan Publications. To receive it by email each week, use the sign-up on{" "}
              <A href={LINKS.bulletins} external>
                DiscoverMass
              </A>
              .
            </p>
          </div>
          {older.length > 0 && (
            <div>
              <H2>Recent issues</H2>
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
