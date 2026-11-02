import { strings, type Lang } from "@/lib/i18n";
import { fmtTime, massTimesSentence } from "@/lib/schedule";
import type { Parish } from "@/lib/types";

/** "Confession Saturday 3:30 PM to 4:30 PM. " from the data, or nothing. */
export function confessionSentence(p: Pick<Parish, "confession">, lang: Lang): string {
  if (!p.confession.length) return "";
  const c = p.confession[0];
  return strings(lang).meta.confession(strings(lang).days[c.day], fmtTime(c.start), c.end ? fmtTime(c.end) : undefined);
}

/** The "where" tail of a description: the corner, or the street. */
export function whereSentence(p: Pick<Parish, "church">, lang: Lang): string {
  return p.church.corner ? strings(lang).meta.corner(p.church.corner) : ` ${noDot(p.church.street)}.`;
}

/** The first-visit "when is Mass" answer, from the data. */
export function whenIsMass(p: Pick<Parish, "masses" | "confession" | "adoration">, lang: Lang): string {
  const s = strings(lang);
  const parts = [`${massTimesSentence(p.masses, lang)}.`];
  if (p.confession.length) {
    const c = p.confession[0];
    const sameHour = p.adoration.length > 0 && p.adoration[0].day === c.day && p.adoration[0].start === c.start;
    const when = c.end ? `${fmtTime(c.start)} ${s.schedule.to} ${fmtTime(c.end)}` : fmtTime(c.start);
    parts.push(lang === "es" ? `Las confesiones son el ${s.days[c.day].toLowerCase()} de ${when}${sameHour ? ", con adoración a la misma hora" : ""}.` : `Confession is ${s.days[c.day]} ${c.end ? "from" : "at"} ${when}${sameHour ? ", with Adoration at the same time" : ""}.`);
  }
  return parts.join(" ");
}

/** Trim a trailing period so "St." does not become "St.." in a sentence. */
export function noDot(s: string): string {
  return s.replace(/\.$/, "");
}
