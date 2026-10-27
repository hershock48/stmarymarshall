import { SITE } from "@/lib/site";

/**
 * The Mass, Confession and Adoration schedule, and the "next one" logic.
 *
 * Source: the Mass Times panel on stmarymarshall.org, read 2026-10-27, and
 * the parish's own iCalendar feed (Confessions & Adoration, weekly Saturday
 * 3:30 to 4:30 PM, with Holy Saturday skipped every year back to 2016).
 *
 * The clock is the parish's, America/Detroit, whatever server renders the
 * page. Pages that use `nextMass` must render per request (glaze.md: route
 * caching and time do not mix), so they export `dynamic = "force-dynamic"`.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, as Date.getDay()

export type Service = {
  day: Weekday;
  /** 24h "HH:MM" */
  start: string;
  end?: string;
  label?: string;
};

export const MASSES: readonly Service[] = [
  { day: 6, start: "17:00", label: "Saturday Vigil" },
  { day: 0, start: "09:00", label: "Sunday" },
  { day: 0, start: "11:00", label: "Sunday" },
  { day: 2, start: "16:00", label: "Tuesday" },
  { day: 3, start: "12:00", label: "Wednesday" },
  { day: 5, start: "07:30", label: "Friday" },
];

export const CONFESSION: readonly Service[] = [{ day: 6, start: "15:30", end: "16:30", label: "Saturday" }];

/** Adoration runs during the Saturday confession hour. */
export const ADORATION: readonly Service[] = [{ day: 6, start: "15:30", end: "16:30", label: "Saturday" }];

export const CONFESSION_NOTE = "Also by appointment. No confessions on Holy Saturday.";

/**
 * One-off Masses. Dates are the parish's local calendar date. Past entries
 * drop off the page by themselves; delete them when convenient.
 */
export const SPECIAL_MASSES: readonly { date: string; start: string; label: string }[] = [
  { date: "2026-11-02", start: "19:00", label: "All Souls’ Day Mass" },
  { date: "2026-11-26", start: "09:00", label: "Thanksgiving Mass" },
];

/**
 * Holy Days of Obligation for the current liturgical year, as the dioceses
 * of Michigan keep them: the Ascension is transferred to the following
 * Sunday, so it is not listed. When a holy day falls on a Saturday or a
 * Monday the obligation is lifted in the United States (except Christmas
 * and the Immaculate Conception), which the note says.
 *
 * Mass times are null until the office gives them; the page then prints
 * the date and says the time comes in the bulletin. Fill `masses` with
 * "HH:MM" strings as they are announced. Vigil Masses go in with a label.
 */
export const HOLY_DAYS: readonly { date: string; label: string; masses: { start: string; label?: string }[] | null; note?: string }[] = [
  { date: "2026-12-08", label: "Immaculate Conception", masses: null },
  { date: "2026-12-25", label: "Christmas Day", masses: null, note: "Christmas Eve Masses are announced in the bulletin." },
  { date: "2027-01-01", label: "Mary, Mother of God", masses: null },
  { date: "2027-08-15", label: "Assumption of Mary", masses: null, note: "Falls on a Sunday in 2027." },
  { date: "2027-11-01", label: "All Saints", masses: null, note: "Falls on a Monday in 2027, so the obligation is lifted." },
];

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** "17:00" -> "5:00 PM" */
export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "2026-11-02" -> "November 2" */
export function fmtDate(iso: string, withYear = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export type LocalNow = { iso: string; weekday: Weekday; minutes: number };

/** The parish's wall clock, from any server. */
export function localNow(now = new Date()): LocalNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE.timeZone,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")) as Weekday;
  // Intl can print midnight as "24".
  const hour = Number(get("hour")) % 24;
  return {
    iso: `${get("year")}-${get("month")}-${get("day")}`,
    weekday,
    minutes: hour * 60 + Number(get("minute")),
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** ISO date plus n days, done in UTC so DST cannot skip a day. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export type NextService = {
  label: string;
  time: string;
  /** 0 = today, 1 = tomorrow, ... */
  daysAhead: number;
  dayName: string;
  minutesAway: number;
  /** True while a service with an end time is in progress; `time` is then "until 4:30 PM". */
  now?: boolean;
};

export type DatedMass = { date: string; start: string; label: string };

/**
 * One-off Masses the tiles and tables should know about: the special
 * Masses plus every holy day whose times the office has supplied. Built
 * here so the home tile and the Mass times table cannot disagree.
 */
export function datedMasses(): DatedMass[] {
  const holy = HOLY_DAYS.flatMap((h) => (h.masses ?? []).map((m) => ({ date: h.date, start: m.start, label: m.label ? `${h.label}, ${m.label}` : h.label })));
  return [...SPECIAL_MASSES, ...holy];
}

/**
 * The next scheduled service after `now`, looking a week ahead. Dated
 * Masses are folded in by date. A service with an end time that is
 * running right now wins outright, so the Confession tile during the
 * Saturday hour says "Now" instead of pointing a week ahead.
 */
export function nextService(services: readonly Service[], now: LocalNow, specials: readonly DatedMass[] = datedMasses()): NextService | null {
  let best: NextService | null = null;
  const consider = (c: NextService) => {
    if (!best || c.minutesAway < best.minutesAway) best = c;
  };
  for (const s of services) {
    if (s.day !== now.weekday || !s.end) continue;
    if (toMinutes(s.start) <= now.minutes && now.minutes < toMinutes(s.end)) {
      return { label: s.label ?? DAY_NAMES[s.day], time: `until ${fmtTime(s.end)}`, daysAhead: 0, dayName: DAY_NAMES[s.day], minutesAway: 0, now: true };
    }
  }
  for (let ahead = 0; ahead <= 7; ahead++) {
    const weekday = ((now.weekday + ahead) % 7) as Weekday;
    const iso = addDays(now.iso, ahead);
    for (const s of services) {
      if (s.day !== weekday) continue;
      const away = ahead * 1440 + toMinutes(s.start) - now.minutes;
      if (away < 0) continue;
      consider({ label: s.label ?? DAY_NAMES[weekday], time: fmtTime(s.start), daysAhead: ahead, dayName: DAY_NAMES[weekday], minutesAway: away });
    }
    for (const sp of specials) {
      if (sp.date !== iso) continue;
      const away = ahead * 1440 + toMinutes(sp.start) - now.minutes;
      if (away < 0) continue;
      consider({ label: sp.label, time: fmtTime(sp.start), daysAhead: ahead, dayName: DAY_NAMES[weekday], minutesAway: away });
    }
  }
  return best;
}

/** "Now", "Today", "Tomorrow", the weekday, or "Next Saturday" a week out. */
export function whenWord(n: NextService): string {
  if (n.now) return "Now,";
  if (n.daysAhead === 0) return "Today";
  if (n.daysAhead === 1) return "Tomorrow";
  if (n.daysAhead === 7) return `Next ${n.dayName}`;
  return n.dayName;
}

/** Still-ahead filter: a dated entry drops once its time has passed today. */
function ahead(now: LocalNow, date: string, start: string | null) {
  if (date > now.iso) return true;
  if (date < now.iso) return false;
  return start === null || toMinutes(start) >= now.minutes;
}

/** Special Masses still ahead, soonest first. */
export function upcomingSpecials(now: LocalNow) {
  return SPECIAL_MASSES.filter((s) => ahead(now, s.date, s.start)).sort((a, b) => a.date.localeCompare(b.date));
}

/** Holy days still ahead, soonest first. A day with no times known stays until midnight. */
export function upcomingHolyDays(now: LocalNow) {
  return HOLY_DAYS.filter((h) => ahead(now, h.date, h.masses ? h.masses[h.masses.length - 1].start : null)).sort((a, b) => a.date.localeCompare(b.date));
}

/** "Saturday 5:00 PM, Sunday 9:00 and 11:00 AM" for descriptions, from the data. */
export function massTimesSentence(): string {
  const byDay = new Map<Weekday, string[]>();
  for (const m of MASSES) byDay.set(m.day, [...(byDay.get(m.day) ?? []), fmtTime(m.start)]);
  const order: Weekday[] = [6, 0, 1, 2, 3, 4, 5];
  return order
    .filter((d) => byDay.has(d))
    .map((d) => {
      const times = byDay.get(d)!;
      // "9:00 and 11:00 AM" when the suffix is shared.
      const suffix = times[times.length - 1].slice(-2);
      const same = times.every((t) => t.endsWith(suffix));
      const list = same && times.length > 1 ? times.map((t, i) => (i === times.length - 1 ? t : t.slice(0, -3))).join(" and ") : times.join(" and ");
      return `${DAY_NAMES[d]} ${list}`;
    })
    .join(", ");
}

/** The weekend and weekday Masses, grouped for the schedule table. */
export function groupedMasses() {
  const weekend = MASSES.filter((m) => m.day === 6 || m.day === 0);
  const weekday = MASSES.filter((m) => m.day !== 6 && m.day !== 0);
  return { weekend, weekday };
}
