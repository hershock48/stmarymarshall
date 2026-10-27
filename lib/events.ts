import { addDays, fmtTime, type LocalNow, type Weekday } from "@/lib/schedule";

/**
 * The parish calendar as data the site owns, not a feed it rents.
 *
 * Every rule below is transcribed from stmarymarshall.org/icalendar1.ics as
 * read on 2026-10-27, exceptions included. The eCatholic feed stops the day
 * the parish leaves eCatholic, so the calendar lives here instead. Editing
 * it is editing this file; the README says how.
 *
 * Shapes, in plain English:
 *   weekly   every <day> at a time, optionally until a date, minus exdates
 *   monthly  the Nth <day> of each month
 *   once     a single date
 *
 * The expander is a few dozen lines because that is all these rules need. It
 * is not an RRULE library and should not grow into one.
 */

export type Rule =
  | { kind: "weekly"; day: Weekday; start: string; end: string; from?: string; until?: string; exdates?: string[] }
  | { kind: "monthly"; day: Weekday; nth: number; start: string; end: string; exdates?: string[] }
  | { kind: "once"; date: string; start?: string; end?: string };

export type ParishEvent = {
  title: string;
  note?: string;
  /** Where in the campus; shown when known. */
  where?: string;
  rule: Rule;
  /** Groups the calendar page and the filter chips. */
  kind: "worship" | "formation" | "music" | "meeting" | "family";
};

export const EVENTS: readonly ParishEvent[] = [
  {
    title: "Confessions and Adoration",
    kind: "worship",
    rule: { kind: "weekly", day: 6, start: "15:30", end: "16:30", exdates: ["2027-03-27"] }, // Holy Saturday, skipped every year in the feed
  },
  {
    title: "Bible Study",
    note: "Reflect and pray on the upcoming weekend readings. Contact Karen Bess, karen.bess60@gmail.com.",
    where: "St. James Room, school building",
    kind: "formation",
    rule: { kind: "weekly", day: 2, start: "19:00", end: "20:00" },
  },
  {
    title: "Men’s Bible Study",
    note: "Prayer and the Gospel readings. Contact Ted Merkel, tedmerkel@gmail.com.",
    where: "St. James Room",
    kind: "formation",
    rule: { kind: "weekly", day: 6, start: "07:00", end: "08:00" },
  },
  {
    title: "Knights of Columbus Monthly Meeting",
    kind: "meeting",
    rule: { kind: "monthly", day: 1, nth: 2, start: "19:00", end: "20:00" },
  },
  {
    title: "Adult Choir Rehearsal",
    note: "Questions: the music director, 269-781-3949 ext. 104.",
    where: "St. Cecilia Music Room",
    kind: "music",
    rule: { kind: "weekly", day: 3, start: "18:45", end: "20:15", until: "2026-11-19", exdates: ["2026-11-04"] },
  },
  {
    title: "Adult Choir Rehearsal",
    note: "Moved to Tuesday this week. Questions: the music director, 269-781-3949 ext. 104.",
    where: "St. Cecilia Music Room",
    kind: "music",
    rule: { kind: "once", date: "2026-11-03", start: "18:45", end: "20:15" },
  },
  {
    title: "OCIA / Adult Faith Formation Class",
    note: "To register or with questions, email Carol DiBiaggio, trinitas@att.net.",
    where: "Parish Hall",
    kind: "formation",
    rule: { kind: "weekly", day: 4, start: "18:30", end: "20:00", until: "2026-11-20" },
  },
  {
    title: "Religious Education, Grades 6 to 8",
    note: "Class is cancelled whenever Marshall Public Schools closes for weather. An email goes out and the cancellation is posted on the parish Facebook page.",
    kind: "family",
    rule: {
      kind: "weekly",
      day: 2,
      start: "16:00",
      end: "17:00",
      until: "2027-04-28",
      exdates: ["2026-11-03", "2026-11-24", "2026-12-08", "2026-12-22", "2026-12-29", "2027-01-05", "2027-03-30"],
    },
  },
  {
    title: "Religious Education, Age 4 to Grade 5",
    kind: "family",
    rule: {
      kind: "weekly",
      day: 0,
      start: "10:00",
      end: "10:50",
      until: "2027-04-26",
      exdates: ["2026-11-01", "2026-11-29", "2026-12-20", "2026-12-27", "2027-01-03", "2027-02-07", "2027-02-14", "2027-03-28", "2027-04-04", "2027-04-25"],
    },
  },
  { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2026-11-01", start: "10:00", end: "10:50" } },
  { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2026-12-20", start: "10:00", end: "10:50" } },
  { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2027-02-07", start: "10:00", end: "10:50" } },
  { title: "Family Catechesis Event", kind: "family", rule: { kind: "once", date: "2027-04-25" } },
  {
    title: "Youth Choir Rehearsal, Grades 3 to 8",
    note: "Questions: the music director, 269-781-3949 ext. 104.",
    where: "St. Cecilia Music Room",
    kind: "music",
    rule: { kind: "weekly", day: 3, start: "16:30", end: "17:15", from: "2026-11-04", until: "2026-11-19" },
  },
  {
    title: "Youth Choir Rehearsal, Grades 3 to 8",
    note: "Questions: the music director, 269-781-3949 ext. 104.",
    where: "St. Cecilia Music Room",
    kind: "music",
    rule: { kind: "weekly", day: 3, start: "16:30", end: "17:15", from: "2026-12-02", until: "2026-12-24" },
  },
  {
    title: "Diocesan Huddle Meeting",
    note: "Led by Fr. Paul Redmond for deacons of the Diocese of Kalamazoo.",
    kind: "meeting",
    rule: { kind: "once", date: "2026-11-09", start: "18:30", end: "20:30" },
  },
  { title: "Parish Council Meeting", kind: "meeting", rule: { kind: "once", date: "2026-11-16", start: "18:30", end: "19:30" } },
  { title: "Finance Council Meeting", kind: "meeting", rule: { kind: "once", date: "2026-11-18", start: "17:45", end: "18:30" } },
  { title: "Elections", note: "The Parish Hall is a polling place.", kind: "meeting", rule: { kind: "once", date: "2026-11-03", start: "08:00", end: "20:00" } },
];

export const KIND_LABEL: Record<ParishEvent["kind"], string> = {
  worship: "Worship",
  formation: "Study and formation",
  music: "Music",
  meeting: "Councils and meetings",
  family: "Children and families",
};

export type Occurrence = {
  date: string;
  start?: string;
  end?: string;
  title: string;
  note?: string;
  where?: string;
  kind: ParishEvent["kind"];
};

function weekdayOf(iso: string): Weekday {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday;
}

function nthWeekdayOfMonth(iso: string): number {
  return Math.floor((Number(iso.slice(8, 10)) - 1) / 7) + 1;
}

/** Every occurrence from `from` through `from + days - 1`, soonest first. */
export function occurrences(now: LocalNow, days: number, events = EVENTS): Occurrence[] {
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
      // Today's events that have already ended drop off.
      if (i === 0 && end) {
        const [h, m] = end.split(":").map(Number);
        if (h * 60 + m < now.minutes) continue;
      }
      out.push({ date: iso, start, end, title: ev.title, note: ev.note, where: ev.where, kind: ev.kind });
    }
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? "").localeCompare(b.start ?? ""));
  return out;
}

export function fmtRange(o: Occurrence): string {
  if (!o.start) return "All day";
  return o.end ? `${fmtTime(o.start)} to ${fmtTime(o.end)}` : fmtTime(o.start);
}

/** "Tuesday, October 27" */
export function fmtLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
