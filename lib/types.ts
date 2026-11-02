/**
 * One parish, as data. Every site on the platform is one of these, under
 * parishes/<slug>/data.ts, and nothing else about a parish lives anywhere.
 *
 * The shape grew out of the St. Mary Marshall build: the core pages every
 * parish has (home, Mass times, about, sacraments, give, register, the
 * calendar, the bulletin, prayers) are fixed and fed from the typed fields;
 * everything a parish adds beyond that is a `pages` entry, a section page
 * rendered by the same fold component as ministries. A 78-page parish and
 * a 6-page mission fit the same shape.
 *
 * Rules that make the data safe to hand to the office:
 * - A missing field renders nothing, never a placeholder sentence.
 * - A fact the parish has not supplied is left out, not guessed.
 * - Photos are the parish's own, listed with their dimensions so the
 *   page can reserve space without a blur import.
 */
import type { Lang } from "@/lib/i18n";
import type { Weekday } from "@/lib/schedule";

export type Photo = { src: string; width: number; height: number; alt: string };

export type Person = { role: string; name: string; phone?: string; ext?: string; email?: string; link?: { label: string; href: string } };

export type Section = { slug: string; title: string; body: string[]; links?: { label: string; href: string; external?: boolean }[]; contact?: string };

export type Service = { day: Weekday; start: string; end?: string; label?: string; lang?: string; where?: string };

export type DatedMass = { date: string; start: string; label: string; lang?: string };

export type HolyDay = { date: string; label: string; masses: { start: string; label?: string }[] | null; note?: string };

export type Rule =
  | { kind: "weekly"; day: Weekday; start: string; end?: string; from?: string; until?: string; exdates?: string[] }
  | { kind: "monthly"; day: Weekday; nth: number; start: string; end?: string; exdates?: string[] }
  | { kind: "once"; date: string; start?: string; end?: string };

export type EventKind = "worship" | "formation" | "music" | "meeting" | "family" | "service";

export type ParishEvent = { title: string; note?: string; where?: string; rule: Rule; kind: EventKind };

/**
 * The parish mark in the header, the footer and the icons. Either a letter
 * or two inside the platform's ring, or the parish's own logo image.
 */
export type Mark = { type: "ring"; letters: string } | { type: "image"; src: string; width: number; height: number };

export type Parish = {
  slug: string;
  /** Hosts this parish answers on. The first is canonical. */
  hosts: string[];
  /** The pitch host, if a letter exists at public/pitch/<slug>/index.html. */
  pitchHost?: string;
  /** Set once the parish's own domain points here; until then every host is noindex. */
  live: boolean;
  /** The page language. Every word the platform says comes out in it (lib/i18n.ts). */
  lang: Lang;

  name: string;
  shortName: string;
  parishName: string;
  tagline: string;
  founded?: number;
  diocese: { name: string; url: string };
  timeZone: string;
  mark: Mark;

  phone: string;
  phoneHref: string;
  email?: string;
  church: { street: string; corner?: string; city: string; state: string; zip: string };
  office?: { street: string; city: string; state: string; zip: string };
  officeHours?: string[];
  geo?: { lat: number; lng: number };
  mapUrl: string;
  facebook?: string;
  youtube?: string;
  bulletins?: string;
  livestream?: string;
  findAMass: string;

  photos: { hero: Photo; about?: Photo; chapel?: Photo; give?: Photo; extra?: Photo[] };

  masses: Service[];
  confession: Service[];
  adoration: Service[];
  confessionNote?: string;
  adorationNote?: string;
  specialMasses: DatedMass[];
  holyDays: HolyDay[];
  events: ParishEvent[];

  welcome: { heading: string; body: string[] };
  /** Questions a first visit asks, beyond the four the platform answers from the data. */
  newHere?: { q: string; a: string }[];
  staff: Person[];
  history?: { lede: string; paragraphs: string[]; links?: { label: string; href: string }[] };
  cemetery?: { name: string; address: string; mapUrl?: string; body: string[]; docs?: { label: string; href: string }[]; plots?: string };
  sacraments: Section[];
  formation: Section[];
  ministries: Section[];
  /** Extra section pages beyond the core, each at /<slug>. */
  pages: { slug: string; title: string; lede?: string; sections: Section[] }[];
  give: {
    intro: string;
    funds?: string[];
    url?: string;
    provider?: string;
    extras?: { title: string; body: string; contact?: string; url?: string; linkLabel?: string }[];
  };
  docs: { label: string; href: string }[];
  /** The printable registration form, if the parish has one. */
  registrationForm?: string;
  /** Nav items beyond the core, in order. */
  nav: { href: string; label: string }[];
  /** Where the three forms are delivered; falls back to MAIL_TO. */
  mailTo?: string;
  credit: string;
};
