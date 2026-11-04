import type { Metadata } from "next";
import { Band } from "@/components/ui";
import { dioceseEvents, dioceseParishes, platformParishes } from "@/lib/diocese";
import { parishWeek } from "@/lib/news";
import { liveNotices } from "@/lib/notices";
import { latestVoice } from "@/lib/voice";
import { occurrences } from "@/lib/events";
import { admitted, configured } from "@/lib/office";
import { getDiocese, getParish } from "@/lib/parish";
import { addDays, localNow } from "@/lib/schedule";
import { byDay, counting, totals } from "@/lib/tally";

/**
 * The chancery view: every site's health and pull on one page, behind a
 * passcode. Read-mostly. Everything on it is either computed from the
 * parish data (freshness, what is still unconfirmed, what the calendar has
 * next month) or a count with no visitor in it (lib/tally.ts).
 *
 * What it is not: a scoreboard of parishes. Counts are shown per parish
 * because the offices that use them need them that way; nothing about any
 * person is here, and the page says so at the top.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "The chancery view | pilot", robots: { index: false, follow: false }, alternates: {} };

const DAYS = 30;

function Section({ title, lede, children }: { title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="display text-3xl text-ink">{title}</h2>
      {lede ? <p className="mt-2 max-w-3xl text-ink-soft">{lede}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-paper-dim" tabIndex={0} role="region" aria-label={head.join(", ")}>
      <table className="w-full text-left text-sm">
        <thead className="bg-paper-dim/60 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-paper-dim">
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-2 ${typeof c === "number" ? "tabular-nums text-right" : ""}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function OfficePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const d = await getDiocese();
  await getParish();
  const sp = await searchParams;
  const ok = await admitted();
  if (!ok) {
    return (
      <Band tone="paper">
        <div className="mx-auto max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-marian">{d.name} · pilot</p>
          <h1 className="display mt-3 text-4xl text-ink">The chancery view</h1>
          {configured() ? (
            <form action="/diocese/office/enter" method="post" className="mt-6 flex flex-col gap-3">
              <label className="text-sm font-semibold text-ink">
                Passcode
                <input name="code" type="password" required autoComplete="current-password" className="mt-1 block min-h-11 w-full rounded-sm border border-paper-dim bg-white px-3 text-base text-ink" />
              </label>
              {sp.no ? <p className="text-sm text-marian">That is not it.</p> : null}
              <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-sm bg-navy px-5 text-sm font-semibold text-cream">
                Open
              </button>
            </form>
          ) : (
            <p className="mt-6 text-ink-soft">Closed. No passcode is set on this deployment.</p>
          )}
        </div>
      </Band>
    );
  }

  const now = localNow(d.timeZone);
  const all = dioceseParishes(d, now);
  const onPlatform = platformParishes(d);
  const nextMonthFrom = addDays(now.iso, 28);

  // By deanery: how much of each is on the platform, from the diocese's own roster.
  const deaneries = [...new Set(all.map((p) => p.deanery ?? "Not in the directory"))].sort();
  const byDeanery = deaneries.map((name) => {
    const rows = all.filter((p) => (p.deanery ?? "Not in the directory") === name);
    return [name, rows.length, rows.filter((p) => p.source === "platform").length, rows.filter((p) => p.site).length, rows.filter((p) => p.masses.length + p.specials.length > 0).length];
  });

  // The finder's read and the Monday refresh: how old the diocese's page is in our copy.
  const readDays = Math.round((Date.parse(`${now.iso}T00:00:00Z`) - Date.parse(`${d.finder.readAt}T00:00:00Z`)) / 86400000);
  const refresh = readDays <= 8 ? "the weekly refresh is current" : `the weekly refresh has not run for ${readDays} days; check the Actions tab`;

  // This week, per parish, from the same rows the news page and the insert use.
  const thisWeek = onPlatform.map((p) => {
    const w = parishWeek(p, localNow(p.timeZone), 7, p.lang);
    return [p.name, w.announcements.length, w.masses.length, w.events.length, w.diocese.length, w.bishop ? "yes" : "off"];
  });
  const notices = liveNotices(d.notices, now.iso);
  const bishop = latestVoice(d, "en");
  const dioceseDates = dioceseEvents(d, 14, now).filter((o) => !o.parish).length;

  // Freshness and what is still unconfirmed, from the data itself.
  const health = onPlatform.map((p) => {
    const next28 = occurrences(p.events, now, 28).length;
    const [yy, mm, dd] = nextMonthFrom.split("-").map(Number);
    const after = occurrences(p.events, { iso: nextMonthFrom, weekday: new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6, minutes: 0 }, 28).length;
    const tba = p.holyDays.filter((h) => h.masses === null && h.date >= now.iso).length;
    return [p.name, p.church.city, p.live ? "live on its domain" : "pitch host only", p.mailTo ? "set" : "not set", next28, after, tba, p.officeHours?.length ? "yes" : "no"];
  });

  const t = counting ? await totals(DAYS) : [];
  const views = t.filter((c) => c.kind === "view");
  const byHost = new Map<string, number>();
  for (const v of views) byHost.set(v.host, (byHost.get(v.host) ?? 0) + v.n);
  const topPages = views.slice(0, 15).map((v) => [v.host, v.key, v.n]);
  const searches = t.filter((c) => c.kind === "search");
  const empty = searches.filter((c) => c.key.endsWith(":0"));
  const forms = t.filter((c) => c.kind === "form").map((c) => [c.key.split(":")[1] ?? c.key, c.key.split(":")[0], c.n]);
  const gives = t.filter((c) => c.kind === "give").map((c) => [c.key, c.n]);
  const viewsByDay = counting ? await byDay("view", DAYS) : [];
  const maxDay = Math.max(1, ...viewsByDay.map((d) => d.n));

  const finderRows = all.filter((p) => p.source === "finder");
  const finderNoSite = finderRows.filter((p) => !p.site).length;
  const spanish = all.filter((p) => p.masses.some((m) => m.lang === "Español" || m.lang === "es" || /espa/i.test(m.lang ?? ""))).length;

  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{d.name} · pilot</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">The chancery view</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">Every site on the platform: what is current, what is still unconfirmed, and how much it is used. Counts only. No cookies, no visitor ids, no addresses, no contents of any form. Nothing here is about a person.</p>
        </div>
      </section>
      <Band tone="paper">
        <Section title="The sites" lede="What the data says about each parish on the platform today. A site stays current because the office answers; this is where an unanswered question shows.">
          <Table head={["Parish", "Town", "Where it answers", "Forms inbox", "Events next 4 weeks", "Events the 4 after", "Holy days without a time", "Office hours published"]} rows={health} />
        </Section>

        <Section title="This week" lede={`What each parish site is saying this week, from the rows its news page and bulletin insert are built from. Across the diocese: ${notices.length} chancery notice${notices.length === 1 ? "" : "s"} live, ${dioceseDates} diocesan date${dioceseDates === 1 ? "" : "s"} in the next two weeks, the bishop's newest message dated ${bishop?.date ?? "none"}.`}>
          <Table head={["Parish", "Announcements typed", "Masses that differ", "Events next 7 days", "Chancery notices shown", "Bishop's card"]} rows={thisWeek} />
        </Section>

        <Section title="By deanery" lede="Each deanery from the diocese's own directory: how many of its parishes are on the platform, how many have any website, and how many have a schedule the finder can read.">
          <Table head={["Deanery", "Parishes", "On the platform", "With a website", "With Mass times on the finder"]} rows={byDeanery} />
        </Section>

        <Section title="The finder" lede={`All ${all.length} parishes and missions are on the finder. ${onPlatform.length} answer from their own data; ${finderRows.length} are read from the diocese's own page as of ${d.finder.readAt} (${readDays} day${readDays === 1 ? "" : "s"} ago; ${refresh}). ${finderNoSite} have no website at all. ${spanish} list a Mass in Spanish.`}>
          <Table head={["Parish", "Town", "Deanery", "Source", "Website", "Masses listed"]} rows={all.map((p) => [p.name, p.town, p.deanery ?? "", p.source === "platform" ? "its own data" : "the diocese's page", p.site ? "yes" : "none", p.masses.length + p.specials.length])} />
        </Section>

        {counting ? (
          <>
            <Section title={`Pages served, last ${DAYS} days`} lede="Per day across every site, then the pages most opened. A parish's Mass times page not being opened is as useful to know as it being opened.">
              <div className="flex h-24 items-end gap-[2px]" role="img" aria-label={`Pages served per day for ${DAYS} days`}>
                {viewsByDay.map((d) => (
                  <div key={d.day} title={`${d.day}: ${d.n}`} className="flex-1 rounded-t-[3px] bg-marian" style={{ height: `${Math.max(2, (d.n / maxDay) * 100)}%` }} />
                ))}
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Table head={["Host", "Pages served"]} rows={[...byHost.entries()].sort((a, b) => b[1] - a[1])} />
                <Table head={["Host", "Page", "Served"]} rows={topPages} />
              </div>
            </Section>

            <Section title="Finder searches" lede={`Where people looked for Mass from, rounded to about seven miles, and how many parishes they found. ${empty.length ? `${empty.reduce((a, c) => a + c.n, 0)} searches found nothing within their radius; those points are the planning data.` : "No search has come up empty yet."}`}>
              <Table head={["Near (lat,lng)", "Parishes found", "Searches"]} rows={searches.map((c) => [c.key.split(":")[0], Number(c.key.split(":")[1]), c.n])} />
            </Section>

            <Section title="Forms and giving" lede="Forms sent per parish, as counts. Taps on each parish's Give button, which go straight to its own provider; no amount is ever seen here.">
              <div className="grid gap-6 lg:grid-cols-2">
                <Table head={["Parish", "Form", "Sent"]} rows={forms} />
                <Table head={["Parish", "Give taps"]} rows={gives} />
              </div>
            </Section>
          </>
        ) : (
          <Section title="Counting has not started" lede="Pages served, finder searches, forms sent and Give taps are counted once a database is connected (DATABASE_URL, with db/tally.sql applied). Until then this page shows what the data alone can say." />
        )}
      </Band>
    </>
  );
}
