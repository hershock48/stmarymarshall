import fs from "node:fs";
import path from "node:path";
import { cleanNav, pruneNav, type DioceseSite, type NavNode, type SitePage } from "@/lib/dsite";

/**
 * The Diocese of Kalamazoo's own website, on the platform.
 *
 * The pages are the diocese's, read from diokzoo.org by
 * tools/diocese-site-import.mjs on the date in pages.json; nothing in them
 * was written here. What is written here is the little a site needs that a
 * read cannot give: which sections head the menu, what a visitor most
 * often came to do, and the two pages that are never copied.
 *
 * The files are read from disk when the server starts rather than
 * imported, so half a megabyte of page text is not type-checked as a
 * literal (next.config.ts sends the files along with every route).
 */
const pagesFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), "dioceses/kalamazoo/site/pages.json"), "utf8")) as { readAt: string; source: string; pages: SitePage[] };
const navFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), "dioceses/kalamazoo/site/nav.json"), "utf8")) as { nav: NavNode[] };
const pointers = JSON.parse(fs.readFileSync(path.join(process.cwd(), "dioceses/kalamazoo/site/pointers.json"), "utf8")) as Record<string, string>;

/** A placeholder the diocese's editor left in its menu. */
const DROP = new Set(["test"]);

/** What the diocese's menu calls each address, for the few pages that carry no title of their own. */
const menuNames = new Map<string, string>();
const collect = (nodes: NavNode[]) => nodes.forEach((n) => (n.href?.startsWith("/") && n.label && menuNames.set(n.href, n.label), collect(n.children)));
collect(navFile.nav);

/** The slideshow's blank frame, which the diocese's file host does not give out; it was never a picture. */
const pages = pagesFile.pages.map((p) => ({
  ...p,
  title: p.title.trim() || menuNames.get(`/${p.slug}`) || p.slug,
  modules: p.modules.map((m) => (m.kind === "gallery" || m.kind === "image" ? { ...m, images: m.images.filter((i) => !/\/resources\/base-images\//.test(i.src)) } : m)).filter((m) => !((m.kind === "gallery" || m.kind === "image") && m.images.length === 0)),
}));

const site: DioceseSite = {
  slug: "kalamazoo",
  readAt: pagesFile.readAt,
  source: pagesFile.source,
  sourceHost: new URL(pagesFile.source).host,
  // The diocese's own sentence, from its About page.
  tagline: "Nine counties in southwest Michigan: Allegan, Barry, Van Buren, Kalamazoo, Calhoun, Berrien, Cass, St. Joseph and Branch. 59 parishes and missions and 20 Catholic schools, led by Bishop Edward M. Lohse.",
  center: { name: "Diocesan Pastoral Center", street: "215 N. Westnedge Avenue", city: "Kalamazoo, MI 49007", phone: "269-349-8714", phoneHref: "tel:+12693498714" },
  header: [
    { label: "Mass near you", href: "/diocese/near" },
    { label: "About", href: "/about" },
    { label: "Offices and ministries", href: "/ministries" },
    { label: "Vocations", href: "/vocations" },
    { label: "Protecting children", href: "/protect" },
    { label: "News", href: "/news-1" },
    { label: "Español", href: "/espaol" },
  ],
  // The diocese's menu calls its offices "Ministries"; the header here says what the section holds.
  nav: pruneNav(cleanNav(navFile.nav, pages, DROP), pages, pointers).map((n) => (n.href === "/ministries" ? { ...n, label: "Offices and ministries" } : n)),
  tasks: [
    { label: "Find Mass near you", href: "/diocese/near", note: "Every parish and mission, nearest first, with its next Mass." },
    { label: "This week across the diocese", href: "/diocese/events", note: "What every parish has on, on one page." },
    { label: "Give to the Bishop’s Annual Appeal", href: "/bishops-annual-appeal", note: "What it funds, and how each parish is doing." },
    { label: "Make a report", href: "/making-a-report", note: "How to report abuse or misconduct, and who answers." },
    { label: "Vocations", href: "/vocations", note: "Priesthood, the diaconate and religious life." },
    { label: "Work for the diocese", href: "/employment", note: "Open positions at the Pastoral Center, parishes and schools." },
    { label: "Find a person", href: "/directory", note: "The Pastoral Center’s offices, with a phone and an email for each." },
    { label: "En español", href: "/espaol", note: "Ministerio Multicultural e Hispano." },
  ],
  pages,
  news: [],
  people: [],
  pointers,
  social: [],
};

export default site;
