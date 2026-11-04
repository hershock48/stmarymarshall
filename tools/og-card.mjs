/**
 * The link card for a letter: 1200x630, the letter's own headline over a
 * strip of parish photographs (or the letter's dark ground when there are
 * none), rendered in a real browser and written as JPEG.
 *
 *   node tools/og-card.mjs --out public/pitch/lansing/og.jpg --title "Seventy-three parishes.|One living platform." --sub "A letter to the Diocese of Lansing, from Glazed Web" [--photos a.jpg,b.jpg,c.jpg]
 *
 * "|" in --title breaks the line; the second line is set in the letter's
 * pink. Look at the result before shipping it (glaze: render before art).
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts, arg } = await import(pathToFileURL(helper).href);
const out = arg("out", "");
const title = arg("title", "");
const sub = arg("sub", "");
const photos = arg("photos", "").split(",").map((s) => s.trim()).filter(Boolean);
if (!out || !title) {
  console.error("usage: node tools/og-card.mjs --out <jpg> --title \"Line one.|Line two.\" --sub \"...\" [--photos a,b,c]");
  process.exit(1);
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const [l1, l2 = ""] = title.split("|");
// Photographs go in as data URIs: a headless page given setContent has no
// origin, so a file:// background never loads.
const uri = async (p) => {
  const buf = await sharp(path.resolve(ROOT, p)).resize({ width: 800 }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
};
const uris = await Promise.all(photos.map(uri));
const strip = photos.length ? `<div class="strip">${uris.map((u) => `<div style="background-image:url('${u}')"></div>`).join("")}</div><div class="shade"></div>` : `<div class="plain"></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.card{position:relative;width:1200px;height:630px;background:#201712}
.strip{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr 1fr}
.strip div{background-size:cover;background-position:center}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(32,23,18,.15) 0%,rgba(32,23,18,.55) 45%,rgba(32,23,18,.92) 100%)}
.plain{position:absolute;inset:0;background:radial-gradient(1200px 500px at 20% 0%,#3a2a20 0%,#201712 60%)}
.text{position:absolute;left:64px;right:64px;bottom:56px}
h1{margin:0;font-size:68px;line-height:1.08;font-weight:800;color:#FDF6EC;letter-spacing:-.01em}
h1 span{display:block;color:#E84D8A}
p{margin:18px 0 0;font-size:24px;letter-spacing:.14em;text-transform:uppercase;color:#E8DCC8;font-weight:600}
.brand{position:absolute;top:44px;left:64px;font-size:30px;font-weight:800;color:#FDF6EC;letter-spacing:-.02em}
.brand i{font-style:normal;color:#BFE07A}
</style></head><body><div class="card">${strip}<div class="brand">glazed<i>web</i></div><div class="text"><h1>${esc(l1)}${l2 ? `<span>${esc(l2)}</span>` : ""}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div></div></body></html>`;

const chromium = await loadChromium();
const browser = await chromium.launch({ ...launchOpts(), args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const png = await page.screenshot({ type: "png" });
await browser.close();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.resolve(ROOT, out));
console.log("wrote", out);
