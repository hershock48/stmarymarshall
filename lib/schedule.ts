import { strings, type Lang } from "@/lib/i18n";
import type { DatedMass, HolyDay, Parish, Service } from "@/lib/types";

/**
 * Mass, Confession and Adoration logic for any parish, and the "next one"
 * computation. The data lives on the parish; nothing here is St. Mary's.
 *
 * The clock is the parish's time zone, whatever server renders the page.
 * Pages that use `nextService` render per request (glaze.md: route caching
 * and time do not mix).
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, as Date.getDay()

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export function dayName(day: Weekday, lang: Lang = "en"): string {
  return strings(lang).days[day];
}

/** "17:00" -> "5:00 PM". The 12-hour clock is what US parishes print, in either language. */
export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "2026-11-02" -> "November 2" or "2 de noviembre" */
export function fmtDate(iso: string, withYear = false, lang: Lang = "en"): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
}

export type LocalNow = { iso: string; weekday: Weekday; minutes: number };

/** The parish's wall clock, from any server. */
export function localNow(timeZone: string, now = new Date()): LocalNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
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
  return { iso: `${get("year")}-${get("month")}-${get("day")}`, weekday, minutes: hour * 60 + Number(get("minute")) };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** ISO date plus n days, done in UTC so DST cannot skip a day. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export type NextService = {
  /** What to call it: the service's label, or the day name. */
  label: string;
  /** "5:00 PM", or "until 4:30 PM" while it is in progress. */
  time: string;
  daysAhead: number;
  dayName: string;
  minutesAway: number;
  now?: boolean;
};

/** Special Masses and holy days with known times, as one dated list. */
export function datedMasses(parish: Pick<Parish, "specialMasses" | "holyDays">): DatedMass[] {
  const fromHolyDays = parish.holyDays.flatMap((h) => (h.masses ?? []).map((m) => ({ date: h.date, start: m.start, label: m.label ? `${h.label}, ${m.label}` : h.label })));
  return [...parish.specialMasses, ...fromHolyDays];
}

/**
 * The next service, counting from the parish's clock: the soonest start
 * within a week, with dated Masses considered alongside the weekly ones.
 * A service with an end time that is in progress right now wins outright,
 * so the Confession tile during the hour says "Now" instead of pointing a
 * week ahead.
 */
export function nextService(services: readonly Service[], now: LocalNow, specials: readonly DatedMass[] = [], lang: Lang = "en"): NextService | null {
  const s = strings(lang);
  let best: NextService | null = null;
  const consider = (c: NextService) => {
    if (!best || c.minutesAway < best.minutesAway) best = c;
  };
  for (const sv of services) {
    if (sv.day !== now.weekday || !sv.end) continue;
    if (toMinutes(sv.start) <= now.minutes && now.minutes < toMinutes(sv.end)) {
      return { label: sv.label ?? s.days[sv.day], time: s.schedule.until(fmtTime(sv.end)), daysAhead: 0, dayName: s.days[sv.day], minutesAway: 0, now: true };
    }
  }
  for (let ahead = 0; ahead <= 7; ahead++) {
    const weekday = ((now.weekday + ahead) % 7) as Weekday;
    const iso = addDays(now.iso, ahead);
    for (const sv of services) {
      if (sv.day !== weekday) continue;
      const away = ahead * 1440 + toMinutes(sv.start) - now.minutes;
      if (away < 0) continue;
      consider({ label: sv.label ?? s.days[weekday], time: fmtTime(sv.start), daysAhead: ahead, dayName: s.days[weekday], minutesAway: away });
    }
    for (const sp of specials) {
      if (sp.date !== iso) continue;
      const away = ahead * 1440 + toMinutes(sp.start) - now.minutes;
      if (away < 0) continue;
      consider({ label: sp.label, time: fmtTime(sp.start), daysAhead: ahead, dayName: s.days[weekday], minutesAway: away });
    }
  }
  return best;
}

/** "Now,", "Today", "Tomorrow", the weekday, or "Next Saturday" a week out. */
export function whenWord(n: NextService, lang: Lang = "en"): string {
  const s = strings(lang).schedule;
  if (n.now) return s.now;
  if (n.daysAhead === 0) return s.today;
  if (n.daysAhead === 1) return s.tomorrow;
  if (n.daysAhead === 7) return s.next(n.dayName);
  return n.dayName;
}

/** Still-ahead filter: a dated entry drops once its time has passed today. */
function ahead(now: LocalNow, date: string, start: string | null) {
  if (date > now.iso) return true;
  if (date < now.iso) return false;
  return start === null || toMinutes(start) >= now.minutes;
}

/** Special Masses still ahead, soonest first. */
export function upcomingSpecials(parish: Pick<Parish, "specialMasses">, now: LocalNow): DatedMass[] {
  return parish.specialMasses.filter((s) => ahead(now, s.date, s.start)).sort((a, b) => a.date.localeCompare(b.date));
}

/** Holy days still ahead, soonest first. A day with no times known stays until midnight. */
export function upcomingHolyDays(parish: Pick<Parish, "holyDays">, now: LocalNow): HolyDay[] {
  return parish.holyDays.filter((h) => ahead(now, h.date, h.masses && h.masses.length ? h.masses[h.masses.length - 1].start : null)).sort((a, b) => a.date.localeCompare(b.date));
}

/** "Saturday 5:00 PM, Sunday 9:00 and 11:00 AM" for descriptions, from the data. */
export function massTimesSentence(masses: readonly Service[], lang: Lang = "en"): string {
  const s = strings(lang);
  const byDay = new Map<Weekday, string[]>();
  for (const m of masses) byDay.set(m.day, [...(byDay.get(m.day) ?? []), fmtTime(m.start)]);
  const order: Weekday[] = [6, 0, 1, 2, 3, 4, 5];
  return order
    .filter((d) => byDay.has(d))
    .map((d) => {
      const times = byDay.get(d)!;
      const suffix = times[times.length - 1].slice(-2);
      const same = times.every((t) => t.endsWith(suffix));
      const list = same && times.length > 1 ? times.map((t, i) => (i === times.length - 1 ? t : t.slice(0, -3))).join(` ${s.schedule.and} `) : times.join(` ${s.schedule.and} `);
      return `${s.days[d]} ${list}`;
    })
    .join(", ");
}

/** The weekend and weekday Masses, grouped for the schedule table. */
export function groupedMasses(masses: readonly Service[]) {
  const weekend = masses.filter((m) => m.day === 6 || m.day === 0);
  const weekday = masses.filter((m) => m.day !== 6 && m.day !== 0);
  return { weekend, weekday };
}
