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
  if (p.dayClass in DAY) return [DAY[p.dayClass]];
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

/** "November 17" to the next such date from today. */
function monthDay(text: string, now: LocalNow): string | null {
  const m = /^([A-Za-z]+)\s+(\d{1,2})$/.exec(text.trim());
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1].toLowerCase());
  if (mi < 0) return null;
  const y = Number(now.iso.slice(0, 4));
  const mk = (yy: number) => `${yy}-${String(mi + 1).padStart(2, "0")}-${String(Number(m[2])).padStart(2, "0")}`;
  return mk(y) >= now.iso ? mk(y) : mk(y + 1);
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
      if (p.dayClass in NTH) {
        const [nth, wd] = NTH[p.dayClass];
        for (const date of nthDates(nth, wd, now)) specials.push({ date, start, label: `${p.dayText}${t.note ? `, ${t.note}` : ""}`, lang: base.lang });
        continue;
      }
      for (const day of daysOf(p)) masses.push({ day, ...base });
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
