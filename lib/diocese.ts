import { ALL } from "@/lib/paths";
import { deaneryOf } from "@/lib/deaneries";
import { miles, type Point } from "@/lib/geo";
import { occurrences, type Occurrence } from "@/lib/events";
import { occurrenceId } from "@/lib/ics";
import type { Diocese, FinderPanel, FinderRow } from "@/lib/types";
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
export type Source = "platform" | "finder";

export type DioceseParish = {
  id: string;
  name: string;
  town: string;
  address: string;
  /** "Includes St Ann Oratory, Bellevue": a second church the directory lists under this parish. */
  also?: string;
  /** From the diocese's directory (dioceses/<slug>/deaneries.ts). */
  deanery?: string;
  collaborative?: string[];
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
  confessionSpecials: DatedMass[];
  adoration: Service[];
  adorationSpecials: DatedMass[];
  /** Perpetual Adoration: a chapel open around the clock, so there is no "next". */
  adorationPerpetual?: string;
};

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

function daysOf(p: FinderPanel): Weekday[] {
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
function monthDay(text: string, now: LocalNow, readAt: string): string | null {
  const m = /^([A-Za-z]+)\.?\s+(\d{1,2})$/.exec(text.trim());
  if (!m) return null;
  const word = m[1].toLowerCase().slice(0, 3);
  const mi = MONTHS.findIndex((mo) => mo.startsWith(word));
  if (mi < 0) return null;
  const y = Number(now.iso.slice(0, 4));
  const mk = (yy: number) => `${yy}-${String(mi + 1).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}`;
  const date = mk(y) >= now.iso ? mk(y) : mk(y + 1);
  return date <= addDays(readAt, 70) ? date : null;
}

const ORDINAL: Record<string, number> = { "1st": 1, first: 1, "2nd": 2, second: 2, "3rd": 3, third: 3, "4th": 4, fourth: 4, "5th": 5, fifth: 5 };

/** "2nd & 4th Fridays", "First Thursday", "1st Friday Mass + Adoration": the ordinals in a note, or none. */
function ordinals(note: string): number[] {
  const out: number[] = [];
  for (const m of note.toLowerCase().matchAll(/\b(1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth)\b/g)) out.push(ORDINAL[m[1]]);
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
/**
 * A word is a month only if it is a prefix of a month's name ("sept",
 * "nov.", "march"), so "Margaret", "Mary" and "Marcellus" never read as
 * March: a Mass whose note names St. Margaret Mary is weekly, not seasonal.
 */
function monthIndex(word: string): number {
  const w = word.toLowerCase().replace(/\.$/, "");
  if (w.length < 3) return 0;
  return MONTHS.findIndex((mo) => mo.startsWith(w)) + 1;
}

function inSeason(note: string, now: LocalNow): boolean {
  const t = note.toLowerCase();
  if (/\bno mass\b/.test(t)) return false;
  const y = Number(now.iso.slice(0, 4));
  if (/memorial day/.test(t) && /labor day/.test(t)) return now.iso >= lastMonday(y, 5) && now.iso <= firstMonday(y, 9);
  const months = [...t.matchAll(/\b([a-z]+\.?)/g)].map((m) => monthIndex(m[1])).filter((n) => n > 0);
  if (months.length >= 2) {
    const [a, b] = months;
    const m = Number(now.iso.slice(5, 7));
    return a <= b ? m >= a && m <= b : m >= a || m <= b;
  }
  if (/\b(thru|through|during|semester|summer|winter)s?\b/.test(t)) return false;
  return true;
}

function fromFinder(d: Diocese, r: FinderRow, now: LocalNow): DioceseParish {
  const readAt = d.finder.readAt;
  const lists = {
    mass: { weekly: [] as Service[], dated: [] as DatedMass[] },
    confession: { weekly: [] as Service[], dated: [] as DatedMass[] },
    adoration: { weekly: [] as Service[], dated: [] as DatedMass[] },
  };
  let perpetual: string | undefined;
  for (const p of r.panels) {
    const which = lists[p.sacrament ?? "mass"];
    const masses = which.weekly;
    const specials = which.dated;
    if (p.dayClass === "PERPETUAL") {
      perpetual = p.times[0]?.note || "Perpetual Adoration";
      continue;
    }
    for (const t of p.times) {
      const start = to24(t.time);
      if (!start) continue;
      const end = t.end ? (to24(t.end) ?? undefined) : undefined;
      const lang = t.lang && LANG[t.lang] !== undefined ? LANG[t.lang] : t.lang;
      const base = { start, end, lang: lang || undefined, where: t.note || undefined };
      if (p.dayClass === "HOLY_DAY") {
        const date = monthDay(p.dayText, now, readAt);
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
      // "Nov. 2": a one-off written into a weekly row. "No Adoration April
      // 30" is an exception to the weekly row, not a dated extra, so it keeps
      // the weekly row (the exception itself is not modelled); and a date the
      // parser cannot place leaves the row weekly rather than dropping it.
      const dated = /\b([a-z]+\.?)\s+(\d{1,2})\b/i.exec(note);
      const datedMonth = Boolean(dated && monthIndex(dated[1]) > 0);
      if (datedMonth && /\bno\b/i.test(note)) {
        // An exception to a weekly row: the row stays weekly.
        for (const day of days) masses.push({ day, ...base });
        continue;
      }
      if (datedMonth && dated) {
        // A one-off: dated while it is still ahead, dropped once it has passed.
        const date = monthDay(`${dated[1]} ${dated[2]}`, now, readAt);
        if (date) specials.push({ date, start, label: note, lang: base.lang });
        continue;
      }
      // "May-October", "Sept thru May", "Memorial Day thru Labor Day": weekly, in season only.
      if (!inSeason(note, now)) continue;
      for (const day of days) masses.push({ day, ...base });
    }
  }
  const masses = lists.mass.weekly;
  const specials = lists.mass.dated;
  // The town: the reader's own field when it has one (Lansing), else the
  // segment before the state in "street, town, MI, zip" (Kalamazoo).
  const town = (r.town ?? r.address.split(",").slice(-3, -2)[0] ?? "").trim().replace(/^Fenville$/, "Fennville");
  const es = masses.length > 0 && masses.every((m) => m.lang === "Español");
  // Lansing's directory folds a parish's oratories into its name, "St Mary
  // (includes St Ann Oratory, Bellevue)": that part becomes the card's
  // second line rather than its title.
  const includes = /\s*\((includes[^)]*)\)/i.exec(r.name)?.[1];
  return {
    id: r.finderId ?? r.name,
    name: r.name.replace(/\s*\(includes[^)]*\)/i, "").replace(/\s+/g, " ").replace(/ Parish$/, "").replace(/ Mission$/, " (mission)"),
    also: includes ? includes.charAt(0).toUpperCase() + includes.slice(1) : undefined,
    town,
    address: r.address.replace(/\s*,\s*/g, ", ").replace(/, ,/g, ","),
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    site: r.site ?? undefined,
    lang: es ? "es" : "en",
    geo: r.geo ? { lat: r.geo.lat, lng: r.geo.lng } : undefined,
    source: "finder",
    ...deaneryOf(d.deaneries, r.name, town),
    masses,
    specials,
    confession: lists.confession.weekly,
    confessionSpecials: lists.confession.dated,
    adoration: lists.adoration.weekly,
    adorationSpecials: lists.adoration.dated,
    adorationPerpetual: perpetual,
  };
}

function fromPlatform(d: Diocese, p: Parish): DioceseParish {
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
    ...deaneryOf(d.deaneries, p.name, p.church.city),
    parish: p,
    masses: p.masses,
    specials: datedMasses(p),
    confession: p.confession,
    confessionSpecials: [],
    adoration: p.adoration,
    adorationSpecials: [],
  };
}

const cache = new Map<string, { iso: string; list: DioceseParish[] }>();

/** The platform parishes of one diocese. */
export function platformParishes(d: Diocese): Parish[] {
  return ALL.filter((p) => p.diocese.slug === d.slug);
}

/** Every parish of a diocese, platform rows first, the finder's rows for the rest. Dated entries are computed from today, so the list is cached per diocese per day. */
export function dioceseParishes(d: Diocese, now: LocalNow = localNow(d.timeZone)): DioceseParish[] {
  const hit = cache.get(d.slug);
  if (hit && hit.iso === now.iso) return hit.list;
  const mine = platformParishes(d);
  const replaced = new Set(mine.map((p) => p.finderId).filter(Boolean));
  const list = [...mine.map((p) => fromPlatform(d, p)), ...(d.finder.parishes as FinderRow[]).filter((r) => !replaced.has(r.finderId ?? "")).map((r) => fromFinder(d, r, now))];
  cache.set(d.slug, { iso: now.iso, list });
  return list;
}

export type Near = DioceseParish & { miles: number; next: { mass: NextService | null; confession: NextService | null; adoration: NextService | null } };

/** Parishes within `radius` miles of a point, nearest first, each with its next Mass, Confession and Adoration from the clock. */
export function nearby(d: Diocese, point: Point, radius: number, lang: Lang = "en", now: LocalNow = localNow(d.timeZone)): Near[] {
  return dioceseParishes(d, now)
    .filter((p) => p.geo)
    .map((p) => ({ ...p, miles: miles(point, p.geo as Point) }))
    .filter((p) => p.miles <= radius)
    .sort((a, b) => a.miles - b.miles)
    .map((p) => ({
      ...p,
      next: {
        mass: nextService(p.masses, now, p.specials, lang),
        confession: p.confession.length || p.confessionSpecials.length ? nextService(p.confession, now, p.confessionSpecials, lang) : null,
        adoration: p.adoration.length || p.adorationSpecials.length ? nextService(p.adoration, now, p.adorationSpecials, lang) : null,
      },
    }));
}

/**
 * One row on the diocese calendar. From a platform parish it carries the
 * parish; from dioceses/kalamazoo/events.ts (the chancery's dates and the
 * parishes still on their old sites) it carries the host's name and no
 * parish, so the page links the diocese's own feed for it.
 */
export type DioceseOccurrence = Occurrence & { parish?: Parish; host: string; town: string; id: string; href?: string };

/** The diocese file's rows as occurrences, within the window and still ahead today. */
function dioceseFileEvents(d: Diocese, now: LocalNow, days: number): DioceseOccurrence[] {
  const last = addDays(now.iso, days - 1);
  const out: DioceseOccurrence[] = [];
  for (const e of d.events) {
    const until = e.through ?? e.date;
    if (until < now.iso || e.date > last) continue;
    for (let d = e.date; d <= until && d <= last; d = addDays(d, 1)) {
      if (d < now.iso) continue;
      if (d === now.iso && e.start) {
        const [h, m] = (e.end ?? e.start).split(":").map(Number);
        if (h * 60 + m + (e.end ? 0 : 60) < now.minutes) continue;
      }
      out.push({ id: d === e.date ? e.id : `${e.id}-${d}`, date: d, start: e.start, end: e.end, title: e.title, note: e.note, where: e.where, kind: e.kind, host: e.host, town: e.town, href: e.href });
    }
  }
  return out;
}

/** Every event across the diocese for the next `days`, soonest first: platform calendars plus the diocese file. */
export function dioceseEvents(d: Diocese, days: number, now: LocalNow = localNow(d.timeZone)): DioceseOccurrence[] {
  const out: DioceseOccurrence[] = [];
  for (const p of platformParishes(d)) for (const o of occurrences(p.events, now, days)) out.push({ ...o, id: occurrenceId(o), parish: p, host: p.shortName, town: p.church.city });
  out.push(...dioceseFileEvents(d, now, days));
  out.sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? "").localeCompare(b.start ?? ""));
  return out;
}

/** One diocese-file event by its occurrence id, from today's date forward, or null. */
export function dioceseFileEvent(d: Diocese, id: string, now: LocalNow = localNow(d.timeZone)): DioceseOccurrence | null {
  return dioceseFileEvents(d, { ...now, minutes: 0 }, 400).find((o) => o.id === id) ?? null;
}

export type DioceseGroup = Section & { parish: Parish; town: string; kind: "ministries" | "formation" };

/** Every ministry and formation group on every platform parish, by parish. */
export function dioceseGroups(d: Diocese): DioceseGroup[] {
  const out: DioceseGroup[] = [];
  for (const p of platformParishes(d)) {
    for (const s of p.ministries) out.push({ ...s, parish: p, town: p.church.city, kind: "ministries" });
    for (const s of p.formation) out.push({ ...s, parish: p, town: p.church.city, kind: "formation" });
  }
  return out;
}

/** The towns the diocese's parishes sit in, for a filter. */
export function dioceseTowns(d: Diocese): string[] {
  return [...new Set(dioceseParishes(d).map((p) => p.town))].sort();
}
