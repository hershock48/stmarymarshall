/**
 * Bring a diocese site's pictures home: every image the read pages show
 * is fetched once from the diocese's own file host, resized to what a page
 * can use, saved under public/dioceses/<slug>/media/, and the stored pages
 * are pointed at the local copy with its real width and height.
 *
 *   node tools/diocese-site-media.mjs kalamazoo
 *
 * Run after tools/diocese-site-import.mjs. Only the diocese's own hosts
 * are fetched (the site itself and its file host); a picture hot-linked
 * from someone else's site, or one the host will not give, is left out
 * of the page and listed in the report: the platform shows only pictures
 * it holds.
 * Documents (PDFs) are not copied here; their links go to the diocese's
 * file host until the site is live.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const [, , slug] = process.argv;
if (!slug) {
  console.error("usage: node tools/diocese-site-media.mjs <diocese slug>");
  process.exit(1);
}
const dir = path.join(ROOT, "dioceses", slug, "site");
const out = path.join(ROOT, "public", "dioceses", slug, "media");
fs.mkdirSync(out, { recursive: true });
const pagesFile = JSON.parse(fs.readFileSync(path.join(dir, "pages.json"), "utf8"));
const OWN = new Set([new URL(pagesFile.source).host, "files.ecatholic.com"]);
const MAX = 1400;

const unesc = (s) => s.replace(/&amp;/g, "&");
const esc = (s) => s.replace(/&/g, "&amp;");
const wanted = new Set();
const note = (src) => {
  try {
    if (src && OWN.has(new URL(src).host)) wanted.add(src);
  } catch {}
};
for (const p of pagesFile.pages)
  for (const m of p.modules) {
    if (m.html) for (const x of m.html.matchAll(/<img src="([^"]+)"/g)) note(unesc(x[1]));
    if (m.images) for (const i of m.images) note(i.src);
    if (m.people) for (const x of m.people) note(x.photo);
  }

// What an earlier run already brought home stays on the record.
const mediaFile = path.join(dir, "media.json");
const map = fs.existsSync(mediaFile) ? JSON.parse(fs.readFileSync(mediaFile, "utf8")).map ?? {} : {};
const failed = [];
for (const src of wanted) {
  const name = crypto.createHash("sha1").update(src.split("?")[0]).digest("hex").slice(0, 16) + ".webp";
  const file = path.join(out, name);
  try {
    let meta;
    if (fs.existsSync(file)) meta = await sharp(file).metadata();
    else {
      const res = await fetch(src, { headers: { "user-agent": "glazedweb site read (kevin@glazedweb.com)" } });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      const info = await sharp(buf, { animated: false }).rotate().resize({ width: MAX, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file);
      meta = info;
      await new Promise((ok) => setTimeout(ok, 150));
    }
    map[src] = { src: `/dioceses/${slug}/media/${name}`, w: meta.width, h: meta.height };
  } catch (e) {
    failed.push({ src, why: String(e.message || e).slice(0, 80) });
  }
}

const leftOut = [];
const kept = (src) => src.startsWith("/dioceses/") || /^https:\/\/i\.ytimg\.com\//.test(src);
const swapHtml = (html) =>
  html
    .replace(/<img src="([^"]+)" alt="([^"]*)"(?: width="\d+")?(?: height="\d+")?/g, (all, s, alt) => {
      const hit = map[unesc(s)];
      return hit ? `<img src="${esc(hit.src)}" alt="${alt}" width="${hit.w}" height="${hit.h}"` : all;
    })
    .replace(/<img src="([^"]+)"[^>]*>/g, (all, s) => (kept(unesc(s)) ? all : (leftOut.push(unesc(s)), "")))
    .replace(/<a href="[^"]*">\s*<\/a>/g, "")
    .replace(/<p>\s*<\/p>/g, "");
for (const p of pagesFile.pages)
  for (const m of p.modules) {
    if (m.html) m.html = swapHtml(m.html);
    if (m.images) m.images = m.images.map((i) => (map[i.src] ? { ...i, ...map[i.src] } : i)).filter((i) => kept(i.src) || (leftOut.push(i.src), false));
    if (m.people) for (const x of m.people) if (x.photo) x.photo = map[x.photo]?.src ?? (kept(x.photo) ? x.photo : (leftOut.push(x.photo), null));
  }
for (const p of pagesFile.pages) p.modules = p.modules.filter((m) => !((m.kind === "image" || m.kind === "gallery") && m.images.length === 0) && !(m.kind === "text" && !m.html.trim()));
fs.writeFileSync(path.join(dir, "pages.json"), JSON.stringify(pagesFile, null, 1) + "\n");
fs.writeFileSync(path.join(dir, "media.json"), JSON.stringify({ readAt: new Date().toISOString(), brought: fs.readdirSync(out).length, failed, leftOut: [...new Set(leftOut)], map }, null, 1) + "\n");
const bytes = fs.readdirSync(out).reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0);
console.log(`pictures brought home: ${Object.keys(map).length} of ${wanted.size} (${(bytes / 1e6).toFixed(1)} MB); not given: ${failed.length}`);
for (const f of failed.slice(0, 10)) console.log("  ", f.why, f.src.slice(0, 110));
