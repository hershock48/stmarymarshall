import type { Metadata } from "next";
import RequestForm from "@/components/RequestForm";
import { Band, H2, PageHero } from "@/components/ui";
import { REQUESTS } from "@/lib/requests";
import { SITE } from "@/lib/site";
import photo from "@/public/img/chapel-altar.jpg";

export const metadata: Metadata = {
  title: "Request a Mass Intention",
  description: "Have a Mass offered at St. Mary, Marshall, for a loved one living or deceased, or for a special intention. Request online; the office confirms the date.",
  alternates: { canonical: "/mass-intentions" },
};

export default async function MassIntentions({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      <PageHero title="Mass Intentions" lede="Have a Mass offered for someone who has died, for someone living, or for a special intention." photo={photo} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <H2>Request a Mass</H2>
            <p className="mt-6 text-[17px] leading-relaxed text-ink">
              Tell the office who the Mass is for and, if you have one, a date that matters, such as an anniversary. The office will confirm the Mass by phone or email once it is on the calendar; dates are not promised until then. The customary stipend can be paid at the office or mailed to {SITE.office.street.replace(/\.$/, "")}.
            </p>
            <div className="mt-8">
              <RequestForm kind="mass-intention" fields={REQUESTS["mass-intention"].fields} error={error} button="Send the request" />
            </div>
          </div>
          <aside className="space-y-6 text-[15px] leading-relaxed text-ink lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">What a Mass intention is</h2>
              <p className="mt-2">A Mass is offered for a particular person or need, and that intention is named at the Mass and printed in the bulletin. It is one of the oldest ways Catholics pray for the dead and for one another.</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Or call</h2>
              <p className="mt-2">
                The office at{" "}
                <a href={SITE.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {SITE.phone}
                </a>{" "}
                takes intentions by phone and in person.
              </p>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}
