/**
 * A diocese's own website, as data (dioceses/<slug>/site/). The pages, the
 * news and the staff are read from the diocese's current site by
 * tools/diocese-site-import.mjs, module by module; this file is the shape
 * of that read and the few questions the pages ask of it.
 *
 * The site is served on the diocese's site host (lib/paths.ts
 * dioceseSiteSlug) with the diocese layer built in: the finder, this week
 * across the diocese, the groups, the bishop's voice. It imports nothing
 * marked server-only, so the tests can load it.
 */
import type { Photo } from "@/lib/types";

export type SiteImage = { src: string; alt: string; w: number | null; h: number | null };
export type SiteLink = { label: string; href: string };
export type SitePerson = { name: string; role: string; phone: string; email: string | null; photo: string | null; slug: string | null };

export type SiteModule =
  | { kind: "text"; title: string; html: string }
  | { kind: "people"; title: string; people: SitePerson[] }
  | { kind: "documents" | "links"; title: string; items: SiteLink[] }
  | { kind: "button"; label: string; sub?: string; href: string }
  | { kind: "image" | "gallery"; title: string; images: SiteImage[]; href: string | null }
  | { kind: "video"; title: string; youtube: string }
  | { kind: "form"; title: string; source: string; what: "form" | "signup" }
  | { kind: "other"; cls: string; title: string; html: string; frames: string[]; links: SiteLink[] };

export type SitePage = { slug: string; title: string; tags: string[]; modules: SiteModule[] };
export type SiteNews = { slug: string; title: string; date: string | null; author: string; image: SiteImage | null; html: string };
export type SiteStaff = { slug: string; name: string; role: string; phone: string; email: string | null; photo: string | null; bio: string; tags: SiteLink[] };
export type NavNode = { label: string; href: string | null; children: NavNode[] };

export type DioceseSite = {
  /** The diocese's slug (dioceses/<slug>). */
  slug: string;
  /** When the diocese's site was read, and from where. */
  readAt: string;
  source: string;
  sourceHost: string;
  /** One sentence under the name on the home page, in the diocese's own words. */
  tagline: string;
  hero?: Photo;
  center: { name: string; street: string; city: string; phone: string; phoneHref: string };
  /** The few links across the top of every page. */
  header: SiteLink[];
  /** The top of the site: each a section with its own tree beneath it. */
  nav: NavNode[];
  /** What a visitor most often came to do, on the home page. */
  tasks: { label: string; href: string; note: string }[];
  pages: SitePage[];
  news: SiteNews[];
  people: SiteStaff[];
  /**
   * Pages that are never copied: a legal or safeguarding record that must
   * exist in exactly one place. The platform shows the title and sends the
   * reader to the diocese's own page.
   */
  pointers: Record<string, string>;
  social: SiteLink[];
};

/** A menu label the site never wrote: its editor shows the address when no name was typed. */
function looksLikeAddress(label: string): boolean {
  return !/\s/.test(label) && label === label.toLowerCase() && label.length > 3;
}

/**
 * The diocese's menu, tidied without inventing anything: a label that is
 * only an address takes the page's own title, a page that is gone or was
 * never more than a placeholder is dropped, and a group with nothing left
 * in it goes too.
 */
export function cleanNav(raw: NavNode[], pages: SitePage[], drop: Set<string> = new Set()): NavNode[] {
  const titles = new Map(pages.map((p) => [`/${p.slug}`, p.title]));
  const walk = (nodes: NavNode[]): NavNode[] =>
    nodes.flatMap((n) => {
      const children = walk(n.children);
      const href = n.href && n.href.startsWith("/") ? n.href.split("#")[0] : n.href;
      if (href && drop.has(href.replace(/^\//, ""))) return [];
      if (href && href.startsWith("/") && href !== "/" && !titles.has(href)) return children;
      const own = href ? titles.get(href) : undefined;
      const label = (own && (looksLikeAddress(n.label) || !n.label) ? own : n.label).trim();
      if (!label || (!href && children.length === 0)) return [];
      return [{ label, href, children }];
    });
  return walk(raw).filter((n) => n.href !== "/");
}

/** Leaves out of the menu any page that was empty when read and has nothing under it. A page that is a pointer stays. */
export function pruneNav(nav: NavNode[], pages: SitePage[], pointers: Record<string, string> = {}): NavNode[] {
  const full = new Set(pages.filter((p) => p.modules.length > 0 || pointers[p.slug]).map((p) => `/${p.slug}`));
  const walk = (nodes: NavNode[]): NavNode[] =>
    nodes.flatMap((n) => {
      const children = walk(n.children);
      const own = n.href && n.href.startsWith("/") ? full.has(n.href.split("#")[0]) : Boolean(n.href);
      if (!own && children.length === 0) return [];
      return [{ ...n, children }];
    });
  return walk(nav);
}

export function pageBySlug(site: DioceseSite, slug: string): SitePage | undefined {
  return site.pages.find((p) => p.slug === slug);
}

export function newsBySlug(site: DioceseSite, slug: string): SiteNews | undefined {
  return site.news.find((n) => n.slug === slug);
}

/** The path from the top of the menu down to a page: its section, any group, the page. */
export function trail(site: DioceseSite, slug: string): NavNode[] {
  const want = `/${slug}`;
  const find = (nodes: NavNode[], path: NavNode[]): NavNode[] | null => {
    for (const n of nodes) {
      const here = [...path, n];
      if (n.href === want) return here;
      const below = find(n.children, here);
      if (below) return below;
    }
    return null;
  };
  return find(site.nav, []) ?? [];
}

/** What sits beside or beneath a page in the menu: its own children if it has any, else its siblings. */
export function around(site: DioceseSite, slug: string): { heading: string; items: NavNode[] } | null {
  const path = trail(site, slug);
  if (path.length === 0) return null;
  const self = path[path.length - 1];
  if (self.children.length > 0) return { heading: self.label, items: self.children };
  const parent = path[path.length - 2];
  if (!parent) return null;
  return { heading: parent.label, items: parent.children };
}

/** The words of a rebuilt fragment, for a description or an excerpt. */
export function plain(html: string, max = 200): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40))}…`;
}

/** A page's first real sentence: the first paragraph with something to say once its links are set aside. */
export function pageSummary(p: SitePage): string {
  for (const m of p.modules) {
    if (m.kind !== "text") continue;
    for (const x of m.html.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
      if (plain(x[1].replace(/<a [^>]*>[\s\S]*?<\/a>/g, " ")).length >= 60) return plain(x[1], 170);
    }
  }
  return "";
}

const TAGS = new Set(["p", "h2", "h3", "h4", "strong", "em", "sup", "sub", "a", "ul", "ol", "li", "br", "hr", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "img"]);
const ATTRS: Record<string, Set<string>> = { a: new Set(["href"]), img: new Set(["src", "alt", "width", "height", "loading"]), p: new Set(["class"]) };

/**
 * Whether a stored fragment is only what the reader is allowed to write:
 * the short list of tags above, the few attributes each may carry, and
 * links that are a path, a web address, a mailbox or a phone number. The
 * tests run this over every fragment, so a change to the reader cannot
 * let anything else through unnoticed.
 */
export function safeFragment(html: string): string | null {
  for (const m of html.matchAll(/<\/?([a-zA-Z0-9-]+)((?:\s+[^<>]*?)?)\s*\/?>/g)) {
    const tag = m[1].toLowerCase();
    if (!TAGS.has(tag)) return `tag <${tag}>`;
    for (const a of m[2].matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)) {
      const name = a[1].toLowerCase();
      if (!ATTRS[tag]?.has(name)) return `attribute ${name} on <${tag}>`;
      if ((name === "href" || name === "src") && !/^(\/|#|https?:\/\/|mailto:|tel:)/i.test(a[2])) return `address ${a[2].slice(0, 40)}`;
      if (name === "class" && a[2] !== "video") return `class ${a[2]}`;
    }
    const bare = m[2].replace(/([a-zA-Z-]+)\s*=\s*"[^"]*"/g, "").trim();
    if (bare) return `stray attribute text on <${tag}>: ${bare.slice(0, 30)}`;
  }
  if (/<(?![a-zA-Z/])/.test(html.replace(/&lt;/g, ""))) return "a stray <";
  return null;
}
