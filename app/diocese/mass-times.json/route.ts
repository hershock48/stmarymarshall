import { allParishes } from "@/lib/parish";
import { fmtTime, DAY_NAMES } from "@/lib/schedule";

export const dynamic = "force-dynamic";

/**
 * Every parish on the platform, as one feed: name, city, site, Mass,
 * Confession and Adoration times. The same data the pages render, with no
 * second copy to drift. This is what a diocesan Mass finder, a parish
 * locator or the chancery's own site would read, and what no parish
 * website in the diocese publishes today (every one is a page a person
 * has to open and read).
 *
 *   GET /diocese/mass-times.json
 */
export function GET() {
  const row = (s: { day: number; start: string; end?: string; label?: string; lang?: string; where?: string }) => ({
    day: DAY_NAMES[s.day],
    start: s.start,
    startLabel: fmtTime(s.start),
    ...(s.end ? { end: s.end, endLabel: fmtTime(s.end) } : {}),
    ...(s.label ? { label: s.label } : {}),
    ...(s.lang ? { language: s.lang } : {}),
    ...(s.where ? { note: s.where } : {}),
  });
  const body = {
    diocese: "Diocese of Kalamazoo",
    generated: new Date().toISOString(),
    timeZone: "America/Detroit",
    parishes: allParishes().map((p) => ({
      slug: p.slug,
      name: p.name,
      city: p.church.city,
      language: p.lang,
      site: `https://${p.hosts[0]}`,
      address: `${p.church.street}, ${p.church.city}, ${p.church.state} ${p.church.zip}`,
      phone: p.phone,
      ...(p.geo ? { geo: p.geo } : {}),
      masses: p.masses.map(row),
      confession: p.confession.map(row),
      adoration: p.adoration.map(row),
      calendar: `https://${p.hosts[0]}/calendar.ics`,
    })),
  };
  return Response.json(body, { headers: { "cache-control": "public, max-age=3600", "access-control-allow-origin": "*" } });
}
