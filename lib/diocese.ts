import finder from "@/parishes/diocese/finder.json";
import { ALL } from "@/lib/paths";
import { miles, type Point } from "@/lib/geo";
import { occurrences, type Occurrence } from "@/lib/events";
import { addDays, datedMasses, localNow, nextService, type LocalNow, type NextService, type Weekday } from "@/lib/schedule";
import type { DatedMass, Parish, Section, Service } from "@/lib/types";
import type { Lang } from "@/lib/i18n";

/**
 * Every parish and mission in the diocese as one list, for the finder, the
 * events page, the groups page and the chancery view.
 *
 * Two sources, each row marked with its own:
 *   "platform": a parish on the platform, read from its data.ts, with its
 *               Confession, Adoration, calendar and ministries as well.
 *   "finder":   a parish still on eCatholic, read from the diocese's own
 *               Parish Finder by tools/finder-import.mjs (Mass times,
 *               address, phone, site). The day a parish moves to the
 *               platform its finderId in data.ts replaces this row.
 *
 * So the finder covers all sixty from the first day, and gets better one
 * parish at a time, which is what the diocese letter promises.
 */
export const TIME_ZONE = "America/Detroit";

export type Source = "platform" | "finder";

export type DioceseParish = {
  id: string;
  name: string;
  town: string;
  address: string;
  phone?: string;
  email?: string;
  site?: string;
  lang: Lang;
  geo?: Point;
  source: Source;
  parish?: Parish;
  masses: Service[];
  specials: DatedMass[];
  confession: Service[];
  adoration: Service[];
};

type FinderTime = { time: string; end?: string; lang?: string; note?: string };
type Panel = { cat: string; ulClass: string; dayClass: string; dayText: string; times: FinderTime[]; text?: string };
type FinderRow = { name: string; address: string; site: string | null; phone: string | null; email: string | null; finderId: string | null; geo?: { lat: number; lng: number; source: string }; panels: Panel[] };
const FINDER = finder.parishes as FinderRow[];

const DAY: Record<string, Weekday> = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SATURDAY_VIGIL: 6 };
const MULTI: Record<string, Weekday> = { su: 0, m: 1, tu: 2, w: 3, th: 4, f: 5, sa: 6 };
const NTH: Record<string, [number, Weekday]> = { FIRST_FRIDAY: [1, 5], FIRST_SATURDAY: [1, 6], FIRST_SUNDAY: [1, 0], FIRST_THURSDAY: [1, 4] };
const LANG: Record<string, string> = { ES: "Español", LA: "Latin", EN: "" };
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "4:00 PM" to "16:00". */
export function to24(t: string): string | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

function daysOf(p: Panel): Weekday[] {
  if (Object.hasOwn(DAY, p.dayClass)) return [DAY[p.dayClass]];
  if (p.dayClass.startsWith("MULTIDAY")) return p.dayClass.split(" ").filter((t) => t in MULTI).map((t) => MULTI[t]);
  return [];
}

/** The next `count` dates on which the nth weekday of a month falls, from today. */
function nthDates(nth: number, weekday: Weekday, now: LocalNow, count = 3): string[] {
  const out: string[] = [];
  let iso = now.iso;
  for (let i = 0; i < 120 && out.length < count; i++) {
    const [y, m, d] = iso.split("-").map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (wd === weekday && Math.floor((d - 1) / 7) + 1 === nth) out.push(iso);
    iso = addDays(iso, 1);
  }
  return out;
}

/**
 * "November 17" (or "Nov. 2") to the next such date from today, as long as
 * it falls within seventy days of the day the finder was read: a dated
 * Mass in a stale finder.json must not roll a year forward.
 */
function monthDay(text: string, now: LocalNow): string | null {
  const m = /^([A-Za-z]+)\.?\s+(\d{1,2})$/.exec(text.trim());
  if (!m) return null;
  const word = m[1].toLowerCase().slice(0, 3);
  const mi = MONTHS.findIndex((mo) => mo.startsWith(word));
  if (mi < 0) return null;
  const y = Number(now.iso.slice(0, 4));
  const mk = (yy: number) => `${yy}-${String(mi + 1).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}`;
  const date = mk(y) >= now.iso ? mk(y) : mk(y + 1);
  return date <= addDays(finder.readAt, 70) ? date : null;
}

const ORDINAL: Record<string, number> = { "1st": 1, first: 1, "2nd": 2, second: 2, "3rd": 3, third: 3, "4th": 4, fourth: 4 };

/** "2nd & 4th Fridays", "First Thursday", "1st Friday Mass + Adoration": the ordinals in a note, or none. */
function ordinals(note: string): number[] {
  const out: number[] = [];
  for (const m of note.toLowerCase().matchAll(/\b(1st|2nd|3rd|4th|first|second|third|fourth)\b/g)) out.push(ORDINAL[m[1]]);
  return [...new Set(out)];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** The first Monday of September, the last Monday of May: the summer schedules' ends. */
function firstMonday(y: number, month: number): string {
  const first = new Date(Date.UTC(y, month - 1, 1)).getUTCDay();
  return `${y}-${pad(month)}-${pad(1 + ((1 - first + 7) % 7))}`;
}
function lastMonday(y: number, month: number): string {
  const last = new Date(Date.UTC(y, month, 0)).getUTCDate();
  const wd = new Date(Date.UTC(y, month - 1, last)).getUTCDay();
  return `${y}-${pad(month)}-${pad(last - ((wd - 1 + 7) % 7))}`;
}

/**
 * Whether a note's season ("May-October", "Sept thru May", "Memorial Day
 * thru Labor Day") includes today. No season word means yes. A season
 * the parser cannot read, or a "no Mass during" note, means no, so an
 * unreadable rule never sends anyone to a locked church.
 */
function inSeason(note: string, now: LocalNow): boolean {
  const t = note.toLowerCase();
  if (/\bno mass\b/.test(t)) return false;
  const y = Number(now.iso.slice(0, 4));
  if (/memorial day/.test(t) && /labor day/.test(t)) return now.iso >= lastMonday(y, 5) && now.iso <= firstMonday(y, 9);
  const months = [...t.matchAll(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*/g)].map((m) => MONTHS.findIndex((mo) => mo.startsWith(m[1])) + 1);
  if (months.length >= 2) {
    const [a, b] = months;
    const m = Number(now.iso.slice(5, 7));
    return a <= b ? m >= a && m <= b : m >= a || m <= b;
  }
  if (/\b(thru|through|during|semester|summer|winter)s?\b/.test(t)) return false;
  return true;
}

function fromFinder(r: FinderRow, now: LocalNow): DioceseParish {
  const masses: Service[] = [];
  const specials: DatedMass[] = [];
  for (const p of r.panels) {
    for (const t of p.times) {
      const start = to24(t.time);
      if (!start) continue;
      const lang = t.lang && LANG[t.lang] !== undefined ? LANG[t.lang] : t.lang;
      const base = { start, lang: lang || undefined, where: t.note || undefined };
      if (p.dayClass === "HOLY_DAY") {
        const date = monthDay(p.dayText, now);
        if (date) specials.push({ date, start, label: p.cat === "Upcoming Special Masses" ? `Special Mass${t.note ? `, ${t.note}` : ""}` : p.dayText, lang: base.lang });
        continue;
      }
      if (Object.hasOwn(NTH, p.dayClass)) {
        const [nth, wd] = NTH[p.dayClass];
        for (const date of nthDates(nth, wd, now)) specials.push({ date, start, label: `${p.dayText}${t.note ? `, ${t.note}` : ""}`, lang: base.lang });
        continue;
      }
      const note = t.note ?? "";
      // A Communion service is not a Mass; it is left off rather than shown as one.
      if (/communion service/i.test(note)) continue;
      const days = daysOf(p);
      // "2nd & 4th Fridays", "First Thursday": dated, from the ordinals in the note.
      const nths = ordinals(note);
      if (nths.length && days.length === 1) {
        for (const nth of nths) for (const date of nthDates(nth, days[0], now, 2)) specials.push({ date, start, label: note, lang: base.lang });
        continue;
      }
      // "Nov. 2": a one-off written into a weekly row.
      const dated = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b/i.exec(note);
      if (dated) {
        const date = monthDay(dated[0], now);
        if (date) specials.push({ date, start, label: note, lang: base.lang });
        continue;
      }
      // "May-October", "Sept thru May", "Memorial Day thru Labor Day": weekly, in season only.
      if (!inSeason(note, now)) continue;
      for (const day of days) masses.push({ day, ...base });
    }
  }
  const town = (r.address.split(",").slice(-3, -2)[0] ?? "").trim().replace(/^Fenville$/, "Fennville");
  const es = masses.length > 0 && masses.every((m) => m.lang === "Español");
  return {
    id: r.finderId ?? r.name,
    name: r.name.replace(/\s+/g, " ").replace(/ Parish$/, "").replace(/ Mission$/, " (mission)"),
    town,
    address: r.address.replace(/\s*,\s*/g, ", ").replace(/, ,/g, ","),
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    site: r.site ?? undefined,
    lang: es ? "es" : "en",
    geo: r.geo ? { lat: r.geo.lat, lng: r.geo.lng } : undefined,
    source: "finder",
    masses,
    specials,
    confession: [],
    adoration: [],
  };
}

function fromPlatform(p: Parish): DioceseParish {
  return {
    id: p.slug,
    name: p.name.replace(/ Catholic Church$/, "").replace(/^Parroquia /, ""),
    town: p.church.city,
    address: `${p.church.street}, ${p.church.city}, ${p.church.state}, ${p.church.zip}`,
    phone: p.phone,
    email: p.email,
    site: p.pitchHost ? `https://${p.pitchHost}/demo` : `https://${p.hosts[0]}`,
    lang: p.lang,
    geo: p.geo,
    source: "platform",
    parish: p,
    masses: p.masses,
    specials: datedMasses(p),
    confession: p.confession,
    adoration: p.adoration,
  };
}

let cache: { iso: string; list: DioceseParish[] } | null = null;

/** Every parish, platform rows first, the finder's rows for the rest. Dated entries are computed from today, so the list is cached per day. */
export function dioceseParishes(now: LocalNow = localNow(TIME_ZONE)): DioceseParish[] {
  if (cache && cache.iso === now.iso) return cache.list;
  const replaced = new Set(ALL.map((p) => p.finderId).filter(Boolean));
  const list = [...ALL.map(fromPlatform), ...FINDER.filter((r) => !replaced.has(r.finderId ?? "")).map((r) => fromFinder(r, now))];
  cache = { iso: now.iso, list };
  return list;
}

export type Near = DioceseParish & { miles: number; next: { mass: NextService | null; confession: NextService | null; adoration: NextService | null } };

/** Parishes within `radius` miles of a point, nearest first, each with its next Mass, Confession and Adoration from the clock. */
export function nearby(point: Point, radius: number, lang: Lang = "en", now: LocalNow = localNow(TIME_ZONE)): Near[] {
  return dioceseParishes(now)
    .filter((p) => p.geo)
    .map((p) => ({ ...p, miles: miles(point, p.geo as Point) }))
    .filter((p) => p.miles <= radius)
    .sort((a, b) => a.miles - b.miles)
    .map((p) => ({
      ...p,
      next: {
        mass: nextService(p.masses, now, p.specials, lang),
        confession: p.confession.length ? nextService(p.confession, now, [], lang) : null,
        adoration: p.adoration.length ? nextService(p.adoration, now, [], lang) : null,
      },
    }));
}

export type DioceseOccurrence = Occurrence & { parish: Parish; town: string };

/** Every event on every platform parish's calendar for the next `days`, soonest first. */
export function dioceseEvents(days: number, now: LocalNow = localNow(TIME_ZONE)): DioceseOccurrence[] {
  const out: DioceseOccurrence[] = [];
  for (const p of ALL) for (const o of occurrences(p.events, now, days)) out.push({ ...o, parish: p, town: p.church.city });
  out.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? "").localeCompare(b.start ?? ""));
  return out;
}

export type DioceseGroup = Section & { parish: Parish; town: string; kind: "ministries" | "formation" };

/** Every ministry and formation group on every platform parish, by parish. */
export function dioceseGroups(): DioceseGroup[] {
  const out: DioceseGroup[] = [];
  for (const p of ALL) {
    for (const s of p.ministries) out.push({ ...s, parish: p, town: p.church.city, kind: "ministries" });
    for (const s of p.formation) out.push({ ...s, parish: p, town: p.church.city, kind: "formation" });
  }
  return out;
}

/** The towns the diocese's parishes sit in, for a filter. */
export function dioceseTowns(): string[] {
  return [...new Set(dioceseParishes().map((p) => p.town))].sort();
}
