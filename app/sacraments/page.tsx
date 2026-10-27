import type { Metadata } from "next";
import { Band, Contact, H2, LineButton, PageHero, Prose } from "@/components/ui";
import { SACRAMENTS } from "@/lib/content";
import photo from "@/public/img/chapel-altar.jpg";

export const metadata: Metadata = {
  title: "Sacraments",
  description: "Baptism, First Communion and Confirmation, Matrimony, Anointing of the Sick and Penance at St. Mary Catholic Church, Marshall, Michigan. Who to call and how far ahead.",
  alternates: { canonical: "/sacraments" },
};

export default function Sacraments() {
  return (
    <>
      <PageHero title="Sacraments" lede="How to arrange a baptism, a wedding, an anointing, or confession at St. Mary." photo={photo} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav aria-label="Sacraments" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold lg:block lg:space-y-2">
              {SACRAMENTS.map((s) => (
                <li key={s.slug}>
                  <a href={`#${s.slug}`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-12">
            {SACRAMENTS.map((s) => (
              <section key={s.slug} id={s.slug} className="scroll-mt-24">
                <H2>{s.name}</H2>
                <div className="mt-6">
                  <Prose paragraphs={s.body} />
                </div>
                {s.contact && (
                  <div className="mt-3">
                    <Contact text={`Call ${s.contact}`} />
                  </div>
                )}
              </section>
            ))}
            <section className="border-t border-paper-dim pt-8">
              <p className="text-[17px] leading-relaxed text-ink">Confession is heard every Saturday afternoon. The full schedule, with Adoration, is on the Mass times page.</p>
              <div className="mt-5">
                <LineButton href="/mass-times#confession" onPaper>
                  Confession times
                </LineButton>
              </div>
            </section>
          </div>
        </div>
      </Band>
    </>
  );
}
