import { occurrences, type Occurrence } from "@/lib/events";
import { addDays, localNow, type LocalNow } from "@/lib/schedule";
import type { Parish } from "@/lib/types";

/**
 * A parish calendar as an iCalendar feed, hand-rolled (RFC 5545, about
 * eighty lines; glaze.md). Occurrences are EXPANDED rather than exported as
 * RRULEs: every calendar app expands rules slightly differently and the
 * exceptions would have to be translated. Four weeks back and ninety days
 * ahead of plain VEVENTs is exact and small, and the past weeks are there
 * because a subscribed calendar mirrors the feed; a feed that started
 * today would delete last week's events from the parishioner's phone.
 *
 * Times are floating local times tagged with a VTIMEZONE for the parish's
 * zone, so a phone elsewhere shows the parish's clock.
 */

function vtimezone(tz: string): string[] {
  // The US rules since 2007. Every Michigan parish is on them; a parish
  // elsewhere would need its own block.
  return [
    "BEGIN:VTIMEZONE",
    `TZID:${tz}`,
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
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 line folding at 75 octets, never splitting a multibyte character. */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  let first = true;
  while (i < bytes.length) {
    const take = first ? 75 : 74;
    let end = Math.min(i + take, bytes.length);
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
  return addDays(iso, 1).replace(/-/g, "");
}

/** A stable id per occurrence so re-fetches update rather than duplicate. */
export function occurrenceId(o: Occurrence): string {
  const slug = o.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${o.date}-${o.start?.replace(":", "") ?? "allday"}-${slug}`;
}

function vevent(p: Parish, o: Occurrence, now: string): string[] {
  const host = p.hosts[0];
  const lines = ["BEGIN:VEVENT", `UID:${occurrenceId(o)}@${host}`, `DTSTAMP:${now}`];
  if (o.start) {
    lines.push(`DTSTART;TZID=${p.timeZone}:${stamp(o.date, o.start)}`);
    if (o.end) lines.push(`DTEND;TZID=${p.timeZone}:${stamp(o.date, o.end)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${o.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${nextDay(o.date)}`);
  }
  lines.push(`SUMMARY:${esc(o.title)}`);
  if (o.note) lines.push(`DESCRIPTION:${esc(o.note)}`);
  const place = `${p.name}, ${p.church.street}, ${p.church.city}, ${p.church.state}`;
  lines.push(`LOCATION:${esc(o.where ? `${o.where}, ${place}` : place)}`);
  lines.push(`URL:https://${host}/events`, "END:VEVENT");
  return lines;
}

function wrap(p: Parish, events: Occurrence[], name: string): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${p.hosts[0]}//Parish calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
    `X-WR-TIMEZONE:${p.timeZone}`,
    ...vtimezone(p.timeZone),
    ...events.flatMap((o) => vevent(p, o, now)),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** The subscribable feed: four weeks back and ninety days ahead. */
export function calendarFeed(p: Parish): string {
  const now = localNow(p.timeZone);
  const from: LocalNow = { iso: addDays(now.iso, -28), weekday: now.weekday, minutes: 0 };
  return wrap(p, occurrences(p.events, from, 28 + 90), `${p.shortName} ${p.church.city}`);
}

/** One event by its occurrence id, or null. Expands from the start of today so a link still resolves after the event ends. */
export function singleEvent(p: Parish, id: string): string | null {
  const now = localNow(p.timeZone);
  const o = occurrences(p.events, { ...now, minutes: 0 }, 366).find((x) => occurrenceId(x) === id);
  return o ? wrap(p, [o], o.title) : null;
}
