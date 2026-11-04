import { occurrences, type Occurrence } from "@/lib/events";
import type { Lang } from "@/lib/i18n";
import { addDays, fmtTime, upcomingHolyDays, upcomingSpecials, type LocalNow } from "@/lib/schedule";
import { liveNotices } from "@/lib/notices";
import type { Announcement, Notice, Parish } from "@/lib/types";
import { latestVoice } from "@/lib/voice";
import { dioceseOfParish } from "@/dioceses";

/**
 * The week's news for a parish, compiled rather than typed: what the
 * office wrote (announcements with a run window), what the schedule says
 * differs (dated Masses, holy days), what the calendar holds, what the
 * chancery posted, and the bishop's newest message. One function feeds the
 * home page, /news, /news.xml, the printable bulletin insert and the
 * diocese's digest, so nothing is keyed twice. This is the "write once"
 * engine in docs/narthex-plan.md, on files until the inbox has a database.
 */
export type NewsItem = {
  id: string;
  kind: "announcement" | "mass" | "holyDay" | "event" | "diocese" | "bishop";
  /** The date it is about, for sorting and the insert; announcements use their `from`. */
  date: string;
  title: string;
  body?: string;
  href?: string;
  label?: string;
  when?: string;
};

export type Week = { announcements: NewsItem[]; masses: NewsItem[]; events: Occurrence[]; diocese: NewsItem[]; bishop: NewsItem | null };

function inLang<T extends { es?: { title: string; body: string; label?: string } }>(a: T & { title: string; body: string; label?: string }, lang: Lang) {
  return lang === "es" && a.es ? { title: a.es.title, body: a.es.body, label: a.es.label ?? a.label } : { title: a.title, body: a.body, label: a.label };
}

/** The announcements live today, in the parish's language. */
export function liveAnnouncements(list: readonly Announcement[] | undefined, iso: string, lang: Lang): NewsItem[] {
  return (list ?? [])
    .filter((a) => a.from <= iso && iso <= a.until)
    .sort((a, b) => a.from.localeCompare(b.from))
    .map((a) => ({ id: a.id, kind: "announcement" as const, date: a.from, href: a.href, ...inLang(a, lang) }));
}

function noticeItem(n: Notice, lang: Lang): NewsItem {
  const t = lang === "es" && n.es ? n.es : n;
  return { id: `notice-${n.id}`, kind: "diocese", date: n.from, title: t.title, body: t.body, href: n.href, label: t.label ?? n.label };
}

/** Everything the week holds for one parish, from today for `days` days. */
export function parishWeek(p: Parish, now: LocalNow, days = 7, lang: Lang = p.lang): Week {
  const last = addDays(now.iso, days);
  const masses: NewsItem[] = [
    ...upcomingSpecials(p, now)
      .filter((s) => s.date <= last)
      .map((s) => ({ id: `mass-${s.date}-${s.start}`, kind: "mass" as const, date: s.date, title: s.label, when: fmtTime(s.start) })),
    ...upcomingHolyDays(p, now)
      .filter((h) => h.date <= last)
      .map((h) => ({ id: `holy-${h.date}`, kind: "holyDay" as const, date: h.date, title: h.label, when: h.masses && h.masses.length ? h.masses.map((m) => (m.label ? `${m.label} ${fmtTime(m.start)}` : fmtTime(m.start))).join(", ") : undefined, body: h.note })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const d = dioceseOfParish(p);
  const bishop = p.bishopsVoice === false ? null : latestVoice(d, lang);
  return {
    announcements: liveAnnouncements(p.announcements, now.iso, lang),
    masses,
    events: occurrences(p.events, now, days),
    diocese: p.diocesanNotices === false ? [] : liveNotices(d.notices, now.iso).map((n) => noticeItem(n, lang)),
    bishop: bishop ? { id: `bishop-${bishop.id}`, kind: "bishop", date: bishop.date, title: bishop.title, body: bishop.lede, href: bishop.youtube ? `https://www.youtube.com/watch?v=${bishop.youtube}` : "/diocese/voice" } : null,
  };
}

/** The week's items as one flat list for a feed, newest-dated first. */
export function weekFeed(w: Week): NewsItem[] {
  const events: NewsItem[] = w.events.map((o) => ({ id: `event-${o.date}-${o.start ?? "day"}-${o.title}`, kind: "event", date: o.date, title: o.title, body: o.note, when: o.start ? fmtTime(o.start) : undefined, label: o.where }));
  return [...w.announcements, ...w.masses, ...events, ...w.diocese, ...(w.bishop ? [w.bishop] : [])].sort((a, b) => b.date.localeCompare(a.date));
}
