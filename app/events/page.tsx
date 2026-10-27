import type { Metadata } from "next";
import Link from "next/link";
import EventList from "@/components/EventList";
import { Band, PageHero } from "@/components/ui";
import { KIND_LABEL, occurrences, type ParishEvent } from "@/lib/events";
import { localNow } from "@/lib/schedule";
import photo from "@/public/img/nave-easter.jpg";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendar",
  description: "The St. Mary Parish calendar for the next six weeks: Religious Education, OCIA, Bible studies, choir rehearsals, Knights of Columbus, council meetings, Confession and Adoration.",
  alternates: { canonical: "/events" },
};

const KINDS = Object.keys(KIND_LABEL) as ParishEvent["kind"][];

export default async function Events({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const now = localNow();
  const all = occurrences(now, 42);
  const picked = KINDS.includes(kind as ParishEvent["kind"]) ? (kind as ParishEvent["kind"]) : null;
  const items = picked ? all.filter((o) => o.kind === picked) : all;

  return (
    <>
      <PageHero title="Calendar" lede="The next six weeks at St. Mary. Mass and Confession times are on their own page." photo={photo} priority />
      <Band tone="paper">
        {/* The filter is plain links, so it works with scripts off and each
            view has a URL someone can send. */}
        <nav aria-label="Filter the calendar" className="flex flex-wrap gap-2">
          <Chip href="/events" active={!picked}>
            Everything
          </Chip>
          {KINDS.map((k) => (
            <Chip key={k} href={`/events?kind=${k}`} active={picked === k}>
              {KIND_LABEL[k]}
            </Chip>
          ))}
        </nav>
        <div className="mt-10">
          <EventList items={items} showKind={!picked} />
        </div>
        <p className="mt-10 text-sm leading-relaxed text-ink-soft">
          Weekly Mass, Confession and Adoration are on the <Link href="/mass-times" className="font-semibold text-marian underline underline-offset-4">Mass times page</Link>. Changes are announced in the bulletin and on the parish Facebook page.
        </p>
      </Band>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
        active ? "border-marian bg-marian text-paper" : "border-ink-soft/40 text-ink hover:border-marian hover:text-marian"
      }`}
    >
      {children}
    </Link>
  );
}
