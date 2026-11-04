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

/**
 * A section of a parish page. `prep` is the sacramental checklist: the
 * steps the parish itself publishes, in order, and what to bring, so a
 * family sees the whole path before the first phone call. Only what the
 * parish has said; nothing is added to it.
 */
export type Section = { slug: string; title: string; body: string[]; links?: { label: string; href: string; external?: boolean }[]; contact?: string; prep?: { steps: string[]; bring?: string[] } };

export type Service = { day: Weekday; start: string; end?: string; label?: string; lang?: string; where?: string };

export type DatedMass = { date: string; start: string; label: string; lang?: string };

export type HolyDay = { date: string; label: string; masses: { start: string; label?: string }[] | null; note?: string };

export type Rule =
  | { kind: "weekly"; day: Weekday; start: string; end?: string; from?: string; until?: string; exdates?: string[] }
  | { kind: "monthly"; day: Weekday; nth: number; start: string; end?: string; exdates?: string[] }
  | { kind: "once"; date: string; start?: string; end?: string };

export type EventKind = "worship" | "formation" | "music" | "meeting" | "family" | "service";

/**
 * Something the office wants said this week: typed once, with a run
 * window, and shown on the home page, the news page, the feed, the
 * printable bulletin insert and, if `diocesan`, the diocese's weekly
 * digest. The dated things (Masses, holy days, events) are never typed
 * here; the news page reads them from the schedule and the calendar.
 */
export type Announcement = {
  id: string;
  from: string;
  until: string;
  title: string;
  body: string;
  href?: string;
  label?: string;
  /** Offer it to the diocese's weekly digest as well. */
  diocesan?: boolean;
  es?: { title: string; body: string; label?: string };
};

export type ParishEvent = { title: string; note?: string; where?: string; rule: Rule; kind: EventKind };

/**
 * The parish mark in the header, the footer and the icons. Either a letter
 * or two inside the platform's ring, or the parish's own logo image.
 */
export type Mark = { type: "ring"; letters: string } | { type: "image"; src: string; width: number; height: number };

/**
 * A parish's palette: the same roles every site has, in that parish's
 * colors. Every value is a hex color. Leave it out to take St. Mary's
 * navy and gold (app/globals.css). Check a new one with
 * `node tools/palette-check.mjs`; the roles and the ratios they must
 * clear are listed there.
 */
export type Theme = {
  /** The dark ground: header, hero, Mass card, footer. */
  navy: string;
  navySoft: string;
  navyLine: string;
  /** Links and buttons on paper. */
  marian: string;
  /** The light accent on the dark ground; a rule on paper. */
  gold: string;
  goldLight: string;
  goldDeep: string;
  /** Text on the dark ground. */
  cream: string;
  dim: string;
  /** The reading ground and its text. */
  paper: string;
  paperDim: string;
  ink: string;
  inkSoft: string;
};

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
  /** The diocese the parish belongs to (dioceses/<slug>/config.ts). */
  diocese: { slug: string; name: string; url: string };
  timeZone: string;
  mark: Mark;
  theme?: Theme;

  phone: string;
  phoneHref: string;
  email?: string;
  church: { street: string; corner?: string; city: string; state: string; zip: string };
  office?: { street: string; city: string; state: string; zip: string };
  officeHours?: string[];
  geo?: { lat: number; lng: number };
  /** The parish's row in the diocesan Parish Finder (dioceses/kalamazoo/finder.json), which this data replaces on the diocese pages. */
  finderId?: string;
  /** Show the diocese's notices (dioceses/kalamazoo/notices.ts) on the home page. On unless the parish says otherwise. */
  diocesanNotices?: boolean;
  /** Carry the bishop's newest message (dioceses/kalamazoo/voice.ts) on the home page. On unless the parish says otherwise. */
  bishopsVoice?: boolean;
  /** The parish's YouTube channel id (UC…), for the live embed on /watch; `youtube` above is the channel's page. */
  youtubeChannelId?: string;
  /** Hosted video (docs/narthex-plan.md, Watch): a Cloudflare Stream live input, played on /watch when STREAM_CUSTOMER_CODE is set. */
  stream?: { provider: "cloudflare"; liveInputId: string };
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
  /** What the office wants said this week (lib/news.ts). */
  announcements?: Announcement[];

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

/**
 * A diocese, as data (dioceses/<slug>/config.ts). Everything the diocese
 * layer needs that is not a parish: the name in both languages, the site,
 * the clock, the hosts, the bishop, the finder read from the diocese's own
 * page, the chancery's dates and notices, the bishop's recordings and the
 * deanery roster. A second diocese is a second folder, never a fork.
 */
export type FinderTime = { time: string; end?: string; lang?: string; note?: string };
export type FinderPanel = { sacrament?: "mass" | "confession" | "adoration"; cat: string; ulClass: string; dayClass: string; dayText: string; times: FinderTime[]; text?: string };
export type FinderRow = { name: string; address: string; site: string | null; phone: string | null; email: string | null; finderId: string | null; geo?: { lat: number; lng: number; source: string }; panels: FinderPanel[] };
export type Finder = { readAt: string; source: string; parishes: FinderRow[] };

/** Something the chancery wants on every parish home page between two dates. */
export type Notice = { id: string; from: string; until: string; title: string; body: string; href?: string; label?: string; es?: { title: string; body: string; label?: string } };

/** A recording the diocese has published: the bishop's voice. */
export type VoiceEntry = { id: string; date: string; title: string; lede: string; lang: "en" | "es"; kind: "video" | "audio"; youtube?: string; audio?: { url: string; type: string; bytes?: number }; pair?: string };

/** A date on the diocese calendar that belongs to no platform parish. */
export type DioceseEvent = { id: string; date: string; through?: string; start?: string; end?: string; title: string; host: string; where?: string; town: string; kind: EventKind; note?: string; href?: string; source: string };

export type Deanery = { name: string; collaboratives: string[][] };

export type Diocese = {
  slug: string;
  name: string;
  nameEs: string;
  shortName: string;
  site: string;
  siteHost: string;
  timeZone: string;
  /** The letter host; the letter is public/pitch/<slug>/index.html. */
  pitchHost?: string;
  /** The diocese layer's own host: the finder at /, the diocese pages under /diocese. */
  host?: string;
  bishop: string;
  youtubeChannelId?: string;
  finder: Finder;
  events: DioceseEvent[];
  notices: Notice[];
  voice: VoiceEntry[];
  deaneries: Deanery[];
};
