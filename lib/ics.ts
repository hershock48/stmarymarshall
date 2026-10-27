import { occurrences, type Occurrence } from "@/lib/events";
import { addDays, localNow, type LocalNow } from "@/lib/schedule";
import { SITE } from "@/lib/site";

/**
 * The calendar as an iCalendar feed, hand-rolled (RFC 5545, about eighty
 * lines; glaze.md). The old eCatholic site offered "Sync to my Calendar" and
 * this puts it back at /calendar.ics.
 *
 * Occurrences are EXPANDED rather than exported as RRULEs: every calendar
 * app expands rules slightly differently and the exceptions in lib/events.ts
 * would have to be translated. Ninety days of plain VEVENTs is exact and
 * small. Subscribed clients refetch on their own schedule.
 *
 * Times are floating local times tagged with a VTIMEZONE for
 * America/Detroit, so a phone in another zone shows the parish's clock.
 */

const TZ = SITE.timeZone;

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZ}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 line folding at 75 octets. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  let first = true;
  while (i < bytes.length) {
    const take = first ? 75 : 74;
    let end = Math.min(i + take, bytes.length);
    // Do not split a multibyte character.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push((first ? "" : " ") + bytes.subarray(i, end).toString("utf8"));
    i = end;
    first = false;
  }
  return out.join("\r\n");
}

function stamp(iso: string, hhmm: string): string {
  return `${iso.replace(/-/g, "")}T${hhmm.replace(":", "")}00`;
}

function nextDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, "");
}

/** A stable id per occurrence so re-fetches update rather than duplicate. */
export function occurrenceId(o: Occurrence): string {
  const slug = o.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${o.date}-${o.start?.replace(":", "") ?? "allday"}-${slug}`;
}

function vevent(o: Occurrence, now: string): string[] {
  const lines = ["BEGIN:VEVENT", `UID:${occurrenceId(o)}@stmarymarshall.org`, `DTSTAMP:${now}`];
  if (o.start) {
    lines.push(`DTSTART;TZID=${TZ}:${stamp(o.date, o.start)}`);
    if (o.end) lines.push(`DTEND;TZID=${TZ}:${stamp(o.date, o.end)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${o.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${nextDay(o.date)}`);
  }
  lines.push(`SUMMARY:${esc(o.title)}`);
  if (o.note) lines.push(`DESCRIPTION:${esc(o.note)}`);
  lines.push(`LOCATION:${esc(o.where ? `${o.where}, ${SITE.name}, ${SITE.church.street}, Marshall, MI` : `${SITE.name}, ${SITE.church.street}, Marshall, MI`)}`);
  lines.push(`URL:${SITE.url}/events`, "END:VEVENT");
  return lines;
}

function wrap(events: Occurrence[], name: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//stmarymarshall.org//Parish calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
    `X-WR-TIMEZONE:${TZ}`,
    ...VTIMEZONE,
    ...events.flatMap((o) => vevent(o, now)),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/**
 * The subscribable feed: four weeks back and ninety days ahead. The past
 * weeks are included because a subscribed calendar mirrors the feed, and a
 * feed that starts today would delete last week's events from the
 * parishioner's phone on every refresh.
 */
export function calendarFeed(): string {
  const now = localNow();
  const from = { iso: addDays(now.iso, -28), weekday: ((now.weekday + 7 - (28 % 7)) % 7) as LocalNow["weekday"], minutes: 0 };
  return wrap(occurrences(from, 28 + 90), "St. Mary Marshall");
}

/**
 * One event by its occurrence id, or null. Expands from the start of
 * today, not from now, so an "add to my calendar" link still resolves after
 * the event has ended.
 */
export function singleEvent(id: string): string | null {
  const now = localNow();
  const o = occurrences({ ...now, minutes: 0 }, 366).find((x) => occurrenceId(x) === id);
  return o ? wrap([o], o.title) : null;
}
