import { strings, type Lang } from "@/lib/i18n";
import { addDays, fmtTime, type LocalNow, type Weekday } from "@/lib/schedule";
import type { EventKind, ParishEvent } from "@/lib/types";

/**
 * The calendar expander. Rules live on the parish (parishes/<slug>/data.ts),
 * transcribed from its old feed or its bulletin, so the site owns them.
 *
 * Shapes, in plain English:
 *   weekly   every <day> at a time, optionally from/until a date, minus exdates
 *   monthly  the Nth <day> of each month
 *   once     a single date
 *
 * A few dozen lines because that is all these rules need. Not an RRULE
 * library, and it should not grow into one.
 */

export const KINDS: EventKind[] = ["worship", "formation", "music", "meeting", "family", "service"];

export function kindLabel(kind: EventKind, lang: Lang = "en"): string {
  return strings(lang).kinds[kind];
}

export type Occurrence = {
  date: string;
  start?: string;
  end?: string;
  title: string;
  note?: string;
  where?: string;
  kind: EventKind;
};

function weekdayOf(iso: string): Weekday {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday;
}

function nthWeekdayOfMonth(iso: string): number {
  return Math.floor((Number(iso.slice(8, 10)) - 1) / 7) + 1;
}

/** Every occurrence from `now`'s date through `days - 1` days later, soonest first. */
export function occurrences(events: readonly ParishEvent[], now: LocalNow, days: number): Occurrence[] {
  const out: Occurrence[] = [];
  for (let i = 0; i < days; i++) {
    const iso = addDays(now.iso, i);
    const wd = weekdayOf(iso);
    for (const ev of events) {
      const r = ev.rule;
      let hit = false;
      let start: string | undefined;
      let end: string | undefined;
      if (r.kind === "once") {
        hit = r.date === iso;
        start = r.start;
        end = r.end;
      } else if (r.kind === "weekly") {
        hit = r.day === wd && (!r.from || iso >= r.from) && (!r.until || iso <= r.until) && !(r.exdates ?? []).includes(iso);
        start = r.start;
        end = r.end;
      } else {
        hit = r.day === wd && nthWeekdayOfMonth(iso) === r.nth && !(r.exdates ?? []).includes(iso);
        start = r.start;
        end = r.end;
      }
      if (!hit) continue;
      // Today's events that have already ended drop off. An event with a
      // start and no end is treated as an hour long for this purpose.
      if (i === 0 && start) {
        const [h, m] = (end ?? start).split(":").map(Number);
        if (h * 60 + m + (end ? 0 : 60) < now.minutes) continue;
      }
      out.push({ date: iso, start, end, title: ev.title, note: ev.note, where: ev.where, kind: ev.kind });
    }
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? "").localeCompare(b.start ?? ""));
  return out;
}

export function fmtRange(o: Occurrence, lang: Lang = "en"): string {
  const s = strings(lang).schedule;
  if (!o.start) return s.allDay;
  return o.end ? `${fmtTime(o.start)} ${s.to} ${fmtTime(o.end)}` : fmtTime(o.start);
}

/** "Tuesday, October 27" or "martes, 27 de octubre" */
export function fmtLongDate(iso: string, lang: Lang = "en"): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}
