/**
 * Read a diocese's own website into platform data: every standing page,
 * every news post and every staff entry, as the modules the page was built
 * from (text, people, documents, links, buttons), so the diocese's site
 * can be served from the platform with the finder, the calendar and the
 * bishop's voice built in.
 *
 *   node tools/diocese-site-import.mjs kalamazoo https://diokzoo.org
 *
 * Writes dioceses/<slug>/site/{nav,pages,news,people,media,report}.json.
 *
 * The site is eCatholic's: its pages are a stack of modules inside #core,
 * each a .moduleInner with a class that names its kind, and the editor's
 * rich text sits in .moduleBody.fr-view. The read happens in a real
 * browser on the site's own origin (the host's bot check passes a browser
 * and refuses a plain fetch), with four requests in flight at most.
 *
 * What is kept is rebuilt from the page's DOM tag by tag against a short
 * list of allowed elements, never copied as markup, so no script, style,
 * class or inline handler survives. Links to pages that were read stay on
 * the platform; links to anything else point back at the diocese's site.
 *
 * A read that comes back short is a challenge page or a changed template:
 * the script refuses to overwrite a good read with a thin one. If the host
 * declines its sitemap to an automated browser, the script does not try
 * again another way: it reads the pages the site's own menu links to and
 * says so. The news archive and the staff pages need the sitemap, or the
 * diocese's own export.
 *
 * Pages named in dioceses/<slug>/site/pointers.json are read for their
 * title only: a record that must exist in exactly one place is never
 * copied (lib/dsite.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = fs.existsSync(helper)
  ? await import(pathToFileURL(helper).href)
  : { loadChromium: async () => (await import("playwright")).chromium, launchOpts: () => ({}) };

const [, , slug, origin] = process.argv;
if (!slug || !/^https:\/\//.test(origin ?? "")) {
  console.error("usage: node tools/diocese-site-import.mjs <diocese slug> <https://site>");
  process.exit(1);
}
const outDir = path.join(ROOT, "dioceses", slug, "site");
fs.mkdirSync(outDir, { recursive: true });
const previous = fs.existsSync(path.join(outDir, "pages.json")) ? JSON.parse(fs.readFileSync(path.join(outDir, "pages.json"), "utf8")).pages?.length ?? 0 : 0;

const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36", viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on("console", (m) => m.text().startsWith("[import]") && console.log(m.text()));
await page.goto(origin + "/", { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForSelector("#core", { timeout: 60_000 });

const sitemap = await page.evaluate(async () => {
  try {
    const xml = await (await fetch("/sitemap.xml")).text();
    return (xml.match(/<loc>[^<]+<\/loc>/g) || []).map((x) => x.replace(/<\/?loc>/g, "").trim());
  } catch {
    return [];
  }
});
if (sitemap.length === 0) console.log("the host did not give its sitemap to this browser; reading only the pages its menu links to (no news archive, no staff pages)");

const data = await page.evaluate(async ({ origin, sitemap }) => {
  const host = new URL(origin).host;
  const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const media = new Map();
  const dropped = {};

  // ---- links and images, made absolute; internal links kept as paths for the second pass ----
  const abs = (href, base) => {
    try {
      return new URL(href, base).href;
    } catch {
      return null;
    }
  };
  const mail = (a) => {
    const l = a.querySelector(".localMail");
    const d = a.querySelector(".domainMail");
    return l && d ? `${txt(l)}@${txt(d)}` : null;
  };
  const link = (a, base) => {
    const m = mail(a);
    if (m) return `mailto:${m}`;
    const raw = a.getAttribute("href") || "";
    if (!raw || raw === "#" || /^javascript:/i.test(raw)) return null;
    if (/^(mailto:|tel:)/i.test(raw)) return raw.replace(/\s+/g, "");
    const u = abs(raw, base);
    return u && /^https?:\/\//i.test(u) ? u : null;
  };
  const img = (el, base) => {
    const src = abs(el.getAttribute("src") || el.getAttribute("data-src") || "", base);
    if (!src || /^data:/.test(src)) return null;
    const w = Number(el.getAttribute("width")) || null;
    const h = Number(el.getAttribute("height")) || null;
    if (w !== null && w <= 2) return null;
    media.set(src, (media.get(src) || 0) + 1);
    return { src, alt: (el.getAttribute("alt") || "").trim(), w, h };
  };

  // ---- the rich text, rebuilt against a list of allowed tags ----
  const INLINE = { STRONG: "strong", B: "strong", EM: "em", I: "em", SUP: "sup", SUB: "sub" };
  const BLOCK = { P: "p", H1: "h2", H2: "h2", H3: "h3", H4: "h4", H5: "h4", H6: "h4", BLOCKQUOTE: "blockquote", LI: "li", TD: "td", TH: "th" };
  const WRAP = { UL: "ul", OL: "ol", TABLE: "table", THEAD: "thead", TBODY: "tbody", TR: "tr" };
  const embed = (src) => {
    const yt = /(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{6,})/.exec(src);
    if (yt) return `<p class="video"><a href="https://www.youtube.com/watch?v=${yt[1]}"><img src="https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg" alt="Play the video on YouTube" width="480" height="360" loading="lazy"></a></p>`;
    let label = "Open this";
    try {
      const h = new URL(src).host.replace(/^www\./, "");
      label = /vimeo/.test(h) ? "Watch the video on Vimeo" : /jotform|formstack|google\.com\/forms|forms\.|flocknote|constantcontact|osvhub|eventbrite/.test(src) ? `Open the form on ${h}` : `Open on ${h}`;
    } catch {}
    return `<p><a href="${esc(src)}">${label} ↗</a></p>`;
  };
  const walk = (node, base) => {
    let out = "";
    for (const c of node.childNodes) {
      if (c.nodeType === 3) {
        out += esc(c.nodeValue.replace(/ /g, " "));
        continue;
      }
      if (c.nodeType !== 1) continue;
      const t = c.tagName;
      if (/^(SCRIPT|STYLE|NOSCRIPT|FORM|INPUT|BUTTON|SELECT|TEXTAREA|SVG|OBJECT|EMBED|ADD-TO-CALENDAR-BUTTON)$/.test(t)) continue;
      if (t === "BR") out += "<br>";
      else if (t === "HR") out += "<hr>";
      else if (t === "IMG") {
        const i = img(c, base);
        if (i) out += `<img src="${esc(i.src)}" alt="${esc(i.alt)}"${i.w ? ` width="${i.w}"` : ""}${i.h ? ` height="${i.h}"` : ""} loading="lazy">`;
      } else if (t === "IFRAME") {
        const src = abs(c.getAttribute("src") || "", base);
        if (src) out += embed(src);
      } else if (t === "A") {
        const href = link(c, base);
        const inner = mail(c) ? esc(mail(c)) : walk(c, base);
        out += href && inner.trim() ? `<a href="${esc(href)}">${inner}</a>` : inner;
      } else if (INLINE[t]) {
        const inner = walk(c, base);
        out += inner.trim() ? `<${INLINE[t]}>${inner}</${INLINE[t]}>` : inner;
      } else if (BLOCK[t]) out += `<${BLOCK[t]}>${walk(c, base)}</${BLOCK[t]}>`;
      else if (WRAP[t]) out += `<${WRAP[t]}>${walk(c, base)}</${WRAP[t]}>`;
      else if (t === "DIV" || t === "SECTION" || t === "ARTICLE" || t === "FIGURE" || t === "CENTER") out += `<p>${walk(c, base)}</p>`;
      else out += walk(c, base);
    }
    return out;
  };
  const rich = (el, base) => {
    if (!el) return "";
    // Parse the rebuilt string once more so stray text, nested paragraphs and empties are tidied by the parser itself.
    const d = new DOMParser().parseFromString(`<body>${walk(el, base)}</body>`, "text/html");
    for (const n of [...d.body.childNodes]) {
      if ((n.nodeType === 3 && n.nodeValue.trim()) || (n.nodeType === 1 && /^(A|STRONG|EM|SUP|SUB|IMG)$/.test(n.tagName))) {
        const p = d.createElement("p");
        n.replaceWith(p);
        p.append(n);
      } else if (n.nodeType === 3) n.remove();
    }
    for (let pass = 0; pass < 3; pass++) {
      for (const e of [...d.body.querySelectorAll("p,h2,h3,h4,li,blockquote,strong,em,ul,ol,td,th")]) {
        if (e.tagName === "TD" || e.tagName === "TH") continue;
        if (!e.textContent.trim() && !e.querySelector("img,hr")) e.remove();
      }
    }
    return d.body.innerHTML.replace(/(<br>\s*){3,}/g, "<br><br>").replace(/<p>(\s|<br>)+/g, "<p>").replace(/(\s|<br>)+<\/p>/g, "</p>").trim();
  };

  // ---- one page's modules ----
  const title = (m) => (m.classList.contains("moduleTitleHidden") ? "" : txt(m.querySelector(":scope > header .moduleTitle")));
  const person = (li, base) => {
    const a = li.querySelector("a.mail");
    const pic = li.querySelector("img");
    const more = li.querySelector('a[href^="/people/"]');
    return { name: txt(li.querySelector(".name")), role: txt(li.querySelector(".role")), phone: txt(li.querySelector(".phone")), email: a ? mail(a) : null, photo: pic ? img(pic, base)?.src ?? null : null, slug: more ? more.getAttribute("href").split("/").pop() : null };
  };
  const modules = (doc, base) => {
    const out = [];
    const all = [...doc.querySelectorAll("#core .moduleInner")].filter((m) => !m.parentElement.closest(".moduleInner"));
    for (const m of all) {
      const cls = [...m.classList].filter((c) => !/^(moduleInner|moduleTitleHidden|moduleSubtitleHidden)$/.test(c));
      const body = m.querySelector(":scope > .moduleBody, :scope > ul.moduleBody, :scope > div.moduleBody");
      const t = title(m);
      if (cls.includes("customModule")) {
        const html = rich(body, base);
        if (html) out.push({ kind: "text", title: t, html });
      } else if (cls.includes("peopleModule")) {
        const people = [...m.querySelectorAll("li.person")].map((li) => person(li, base)).filter((p) => p.name);
        if (people.length) out.push({ kind: "people", title: t, people });
      } else if (cls.includes("documentsModule") || cls.includes("linksModule")) {
        const items = [...m.querySelectorAll("li a.name, li a")].map((a) => ({ label: txt(a), href: link(a, base) })).filter((x) => x.label && x.href);
        const seen = new Set();
        const uniq = items.filter((x) => (seen.has(x.label + x.href) ? false : seen.add(x.label + x.href)));
        if (uniq.length) out.push({ kind: cls.includes("documentsModule") ? "documents" : "links", title: t, items: uniq });
      } else if (cls.includes("buttonModule")) {
        const a = m.querySelector("a.buttonModuleButton");
        const href = a ? link(a, base) : null;
        const label = txt(m.querySelector(".buttonLabel")) || a?.getAttribute("buttonname") || "";
        const sub = txt(m.querySelector(".buttonSubtext"));
        if (href && label) out.push({ kind: "button", label, sub, href });
      } else if (cls.includes("imageModule") || cls.includes("galleryModule") || cls.includes("slideshowModule")) {
        const images = [...m.querySelectorAll("img")].map((el) => img(el, base)).filter(Boolean);
        const a = m.querySelector("a[href]");
        if (images.length) out.push({ kind: cls.includes("imageModule") ? "image" : "gallery", title: t, images: cls.includes("imageModule") ? images.slice(0, 1) : images, href: cls.includes("imageModule") && a ? link(a, base) : null });
      } else if (cls.includes("ctaButtonsModule")) {
        for (const a of m.querySelectorAll("a[href]")) {
          const href = link(a, base);
          const label = txt(a);
          if (href && label && !/^add button text$/i.test(label)) out.push({ kind: "button", label, sub: "", href });
        }
      } else if (cls.includes("rssModule")) {
        const items = [...m.querySelectorAll("li a[href]")].map((a) => ({ label: txt(a), href: link(a, base) })).filter((x) => x.label && x.href).slice(0, 12);
        if (items.length) out.push({ kind: "links", title: t, items });
      } else if (cls.includes("onlineFormModule") || cls.includes("flocknoteSignupsModule")) {
        out.push({ kind: "form", title: t, source: base, what: cls.includes("onlineFormModule") ? "form" : "signup" });
      } else if (/(^|\.)(youtubeModule|embedModule|eCatholicLiveModule)/.test(cls.join("."))) {
        const frames = [...m.querySelectorAll("iframe")].map((f) => abs(f.getAttribute("src") || "", base)).filter(Boolean);
        for (const src of frames) {
          const yt = /(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{6,})/.exec(src);
          if (yt) out.push({ kind: "video", title: t, youtube: yt[1] });
          else if (/^https?:/.test(src)) out.push({ kind: "links", title: t, items: [{ label: "Open on " + new URL(src).host.replace(/^www\./, ""), href: src }] });
        }
      } else if (/(newsVAModule|newsNCRegisterModule|churchPopModule|usccbReadingsModule|romeReportsModule|vaticanYouTubeModule|eucharisticRevival|facebookModule|newsModule|calendarModule|photoAlbumsModule)/.test(cls.join("."))) {
        // Feeds from other publishers and the site's own running lists: the platform has its own news, calendar and voice.
        dropped[cls[0]] = (dropped[cls[0]] || 0) + 1;
      } else {
        const frames = [...m.querySelectorAll("iframe")].map((f) => abs(f.getAttribute("src") || "", base)).filter(Boolean);
        const links = [...m.querySelectorAll("a[href]")].map((a) => ({ label: txt(a), href: link(a, base) })).filter((x) => x.label && x.href).slice(0, 40);
        const html = rich(body ?? m, base);
        out.push({ kind: "other", cls: cls.join("."), title: t, html: html.length < 20000 ? html : "", frames, links });
      }
    }
    return out;
  };
  const dateOf = (el) => {
    if (!el) return null;
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const m = months.findIndex((x) => el.querySelector(`.${x}`));
    const d = Number(txt(el.querySelector(".day")));
    const y = Number(txt(el.querySelector(".year")));
    return m >= 0 && d && y ? `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : null;
  };

  // ---- fetch with a small pool ----
  const get = async (p) => {
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch(p, { credentials: "omit" });
        if (r.status === 404) return null;
        if (r.ok) return new DOMParser().parseFromString(await r.text(), "text/html");
      } catch {}
      await new Promise((ok) => setTimeout(ok, 1500 * (i + 1)));
    }
    return undefined;
  };
  const pool = async (items, n, fn) => {
    const out = new Array(items.length);
    let next = 0;
    await Promise.all(
      Array.from({ length: n }, async () => {
        while (next < items.length) {
          const i = next++;
          out[i] = await fn(items[i], i);
          if (i % 50 === 0) console.log(`[import] ${i}/${items.length}`);
          await new Promise((ok) => setTimeout(ok, 120));
        }
      }),
    );
    return out;
  };

  // ---- the menu, as the site has it ----
  const navWalk = (ul) =>
    [...ul.children]
      .filter((li) => li.tagName === "LI")
      .map((li) => {
        const a = li.querySelector(":scope > a, :scope > div > a, :scope > span > a");
        const sub = li.querySelector(":scope > ul, :scope > div > ul");
        const href = a ? a.getAttribute("href") : null;
        return { label: txt(a) || txt(li.querySelector(":scope > .navName > span")) || "", href: href ? abs(href, origin + "/") : null, children: sub ? navWalk(sub) : [] };
      });
  const navRoot = document.querySelector("#mobileNav ul");
  const nav = navRoot ? navWalk(navRoot) : [];

  // ---- what to read ----
  const locs = sitemap.map((u) => new URL(u).pathname);
  const flat = (nodes) => nodes.flatMap((n) => [n, ...flat(n.children)]);
  const navPaths = flat(nav).map((n) => {
    try {
      const u = new URL(n.href);
      return u.host === host ? u.pathname : null;
    } catch {
      return null;
    }
  }).filter(Boolean);
  const pagePaths = [...new Set([...locs.filter((p) => !/^\/(news|blog|events|people|photoalbums)\//.test(p)), ...navPaths])].filter((p) => p.split("/").filter(Boolean).length <= 1);
  const newsPaths = [...new Set(locs.filter((p) => /^\/news\/[^/]+$/.test(p)))];
  const peoplePaths = [...new Set(locs.filter((p) => /^\/people\/[^/]+$/.test(p)))];
  console.log(`[import] pages ${pagePaths.length}, news ${newsPaths.length}, people ${peoplePaths.length}`);

  const errors = [];
  const pages = (
    await pool(pagePaths, 4, async (p) => {
      const doc = await get(p);
      if (!doc) return errors.push({ path: p, why: doc === null ? "404" : "no answer" }), null;
      const base = origin + p;
      return { slug: p.replace(/^\//, ""), title: txt(doc.querySelector("#pageTitle")) || txt(doc.querySelector("title")).split("|")[0].trim(), tags: [...doc.querySelectorAll(".pageTags a")].map((a) => new URL(a.getAttribute("href"), base).pathname.replace(/^\//, "")), modules: modules(doc, base) };
    })
  ).filter(Boolean);
  const news = (
    await pool(newsPaths, 4, async (p) => {
      const doc = await get(p);
      if (!doc) return errors.push({ path: p, why: doc === null ? "404" : "no answer" }), null;
      const base = origin + p;
      const c = doc.querySelector("#core .moduleInner.content");
      const pic = c?.querySelector("img.pagePicture");
      return { slug: p.split("/").pop(), title: txt(doc.querySelector("#pageTitle")), date: dateOf(c?.querySelector(".date")), author: txt(c?.querySelector(".author")).replace(/^by\s+/i, ""), image: pic ? img(pic, base) : null, html: rich(c?.querySelector(".newsDetails"), base) };
    })
  ).filter(Boolean);
  const people = (
    await pool(peoplePaths, 4, async (p) => {
      const doc = await get(p);
      if (!doc) return errors.push({ path: p, why: doc === null ? "404" : "no answer" }), null;
      const base = origin + p;
      const c = doc.querySelector("#core .moduleInner.content");
      const a = c?.querySelector("a.mail");
      const pic = c?.querySelector("img");
      return { slug: p.split("/").pop(), name: txt(doc.querySelector("#pageTitle")), role: txt(c?.querySelector(".role")), phone: txt(c?.querySelector(".phone")), email: a ? mail(a) : null, photo: pic ? img(pic, base)?.src ?? null : null, bio: rich(c?.querySelector(".bio"), base), tags: [...doc.querySelectorAll(".pageTags a")].map((x) => ({ label: txt(x), slug: new URL(x.getAttribute("href"), base).pathname.replace(/^\//, "") })) };
    })
  ).filter(Boolean);

  return { nav, pages, news, people, errors, dropped, media: [...media.entries()].map(([src, n]) => ({ src, n })) };
}, { origin, sitemap });
await browser.close();

if (data.pages.length < Math.max(40, Math.floor(previous * 0.9))) {
  console.error(`read only ${data.pages.length} pages (had ${previous}); refusing to overwrite`);
  process.exit(1);
}

// ---- second pass: links to pages that were read stay on the platform ----
const host = new URL(origin).host;
const have = new Set(data.pages.map((p) => p.slug));
const haveNews = new Set(data.news.map((n) => n.slug));
const havePeople = new Set(data.people.map((p) => p.slug));
const local = (href) => {
  if (!href) return href;
  let u;
  try {
    u = new URL(href);
  } catch {
    return href;
  }
  if (u.host.replace(/^www\./, "") !== host.replace(/^www\./, "")) return href;
  const seg = u.pathname.split("/").filter(Boolean);
  if (seg.length === 0) return "/";
  if (seg.length === 1 && have.has(seg[0])) return `/${seg[0]}${u.hash}`;
  if (seg.length === 2 && seg[0] === "news" && haveNews.has(seg[1])) return `/news/${seg[1]}`;
  if (seg.length === 2 && seg[0] === "blog" && haveNews.has(seg[1])) return `/news/${seg[1]}`;
  if (seg.length === 2 && seg[0] === "people" && havePeople.has(seg[1])) return `/directory#${seg[1]}`;
  return href;
};
const relink = (html) => (html ? html.replace(/<a href="([^"]+)"/g, (_, h) => `<a href="${local(h.replace(/&amp;/g, "&")).replace(/&/g, "&amp;")}"`) : html);
for (const p of data.pages)
  for (const m of p.modules) {
    if (m.html) m.html = relink(m.html);
    if (m.items) for (const i of m.items) i.href = local(i.href);
    if (m.links) for (const i of m.links) i.href = local(i.href);
    if (m.href) m.href = local(m.href);
  }
for (const n of data.news) n.html = relink(n.html);
for (const p of data.people) p.bio = relink(p.bio);
const navLocal = (nodes) => nodes.map((n) => ({ label: n.label, href: local(n.href), children: navLocal(n.children) }));

const pointersFile = path.join(outDir, "pointers.json");
const pointers = fs.existsSync(pointersFile) ? JSON.parse(fs.readFileSync(pointersFile, "utf8")) : {};
for (const p of data.pages) if (pointers[p.slug]) p.modules = [];

const readAt = new Date().toISOString();
const write = (name, value) => fs.writeFileSync(path.join(outDir, name), JSON.stringify(value, null, 1) + "\n");
write("nav.json", { readAt, source: origin, nav: navLocal(data.nav) });
write("pages.json", { readAt, source: origin, pages: data.pages.sort((a, b) => a.slug.localeCompare(b.slug)) });
write("news.json", { readAt, source: origin, news: data.news.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug)) });
write("people.json", { readAt, source: origin, people: data.people.sort((a, b) => a.name.localeCompare(b.name)) });
write("media.json", { readAt, media: data.media.sort((a, b) => b.n - a.n) });
// The addresses the site answers, on their own, for the request edge (lib/paths.ts knowsSitePath).
fs.writeFileSync(path.join(outDir, "slugs.json"), JSON.stringify(data.pages.map((p) => p.slug).filter(Boolean).sort()) + "\n");

const kinds = {};
const other = {};
for (const p of data.pages)
  for (const m of p.modules) {
    kinds[m.kind] = (kinds[m.kind] || 0) + 1;
    if (m.kind === "other") other[m.cls] = (other[m.cls] || 0) + 1;
  }
write("report.json", { readAt, pages: data.pages.length, news: data.news.length, people: data.people.length, media: data.media.length, kinds, other, dropped: data.dropped, empty: data.pages.filter((p) => p.modules.length === 0).map((p) => p.slug), errors: data.errors });
console.log(`pages ${data.pages.length}, news ${data.news.length}, people ${data.people.length}, images ${data.media.length}, errors ${data.errors.length}`);
console.log("modules:", JSON.stringify(kinds));
console.log("other kinds:", JSON.stringify(other));
