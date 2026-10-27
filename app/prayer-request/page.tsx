import type { Metadata } from "next";
import RequestForm from "@/components/RequestForm";
import { Band, H2, PageHero } from "@/components/ui";
import { REQUESTS } from "@/lib/requests";
import { SITE } from "@/lib/site";
import photo from "@/public/img/monstrance.jpg";

export const metadata: Metadata = {
  title: "Prayer Request",
  description: "Ask the people of St. Mary Parish, Marshall, to pray for you or someone you love. Requests go to the parish office and, if you wish, into the bulletin.",
  alternates: { canonical: "/prayer-request" },
};

export default async function PrayerRequest({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <PageHero title="Prayer Request" lede="Tell us who needs prayers. The parish will pray for them." photo={photo} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <H2>Ask for prayers</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">
              Requests go to the parish office. With your permission the name is printed in the bulletin’s prayer list and remembered at Mass. You do not have to be a parishioner, or Catholic, to ask.
            </p>
            <div className="mt-8">
              <RequestForm kind="prayer-request" fields={REQUESTS["prayer-request"].fields} error={error} button="Send the request" />
            </div>
          </div>
          <aside className="space-y-6 text-[15px] leading-relaxed text-ink lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Someone in the hospital or homebound</h2>
              <p className="mt-2">
                For a visit, Communion, or Anointing of the Sick, call the office at{" "}
                <a href={SITE.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {SITE.phone}
                </a>
                . For an emergency, the rectory can be reached at any time through the same number.
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">A Mass for someone</h2>
              <p className="mt-2">
                To have a Mass offered for a person or an intention,{" "}
                <a href="/mass-intentions" className="font-semibold text-marian underline underline-offset-4">
                  request a Mass intention
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}
