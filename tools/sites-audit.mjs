/**
 * Measure every parish website in a diocese the way the Kalamazoo letter
 * did: open each site's home page in a real browser and read its markup
 * for the same gaps, one row per site, into a CSV the research note and
 * the letter's charts are built from.
 *
 *   node tools/sites-audit.mjs dioceses/lansing/finder.json ../glazedweb/glaze/research/lansing-audit-2026-11.csv
 *
 * Columns (as the Kalamazoo CSV): host, desc (meta description present),
 * og (og:image), ld (any JSON-LD), h1 (count), scripts, css, imgs, big
 * (images 1400px+ wide), tel (tappable phone links), mailto, massPanel
 * (eCatholic MassTime), massText (the word "Mass" with a time on the
 * page), hours (office hours on the page), bulletin (a bulletin link),
 * giving (provider or none), live (livestream or video link), spanish,
 * maxYear (newest year on the page), cust (eCatholic customer id), res
 * (requests), plus platform (what it is built on) and status.
 * A site that does not answer gets a row with status and nothing else.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);
const [, , finderFile, outFile] = process.argv;
if (!finderFile || !outFile) {
  console.error("usage: node tools/sites-audit.mjs <finder.json> <out.csv>");
  process.exit(1);
}
const finder = JSON.parse(fs.readFileSync(finderFile, "utf8"));
const sites = [...new Map(finder.parishes.filter((p) => p.site).map((p) => [new URL(p.site).host.replace(/^www\./, ""), p])).entries()];
console.log(`${sites.length} distinct sites`);

const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
const rows = [];
for (const [host, p] of sites) {
  const page = await ctx.newPage();
  let requests = 0;
  page.on("request", () => requests++);
  const row = { host, parish: p.name, town: p.town ?? "", status: "" };
  try {
    const res = await page.goto(p.site, { waitUntil: "load", timeout: 45_000 });
    row.status = String(res?.status() ?? "");
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const html = document.documentElement.outerHTML;
      const text = document.body?.innerText ?? "";
      const q = (s) => document.querySelectorAll(s).length;
      const meta = (n) => document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)?.getAttribute("content") ?? "";
      const years = [...text.matchAll(/\b(20[12]\d)\b/g)].map((x) => Number(x[1]));
      const platform = /ecatholic/i.test(html) ? "eCatholic" : /wp-content|wp-includes/.test(html) ? "WordPress" : /squarespace/i.test(html) ? "Squarespace" : /wix\.com|wixstatic/i.test(html) ? "Wix" : /weebly/i.test(html) ? "Weebly" : /godaddy|secureserver/i.test(html) ? "GoDaddy" : /diocesan\.com|weconnect/i.test(html) ? "Diocesan.com" : /drupal/i.test(html) ? "Drupal" : /flocknote/i.test(html) && !/wp-content/.test(html) ? "Flocknote" : /jimdo|duda|webflow|sharpspring/i.test(html) ? "Other builder" : "Unknown or custom";
      const giving = /vancopayments|vanco/i.test(html) ? "Vanco" : /osvonlinegiving|osvhub|onlinegiving\.org|osv\.com/i.test(html) ? "OSV" : /weshare|4lpi/i.test(html) ? "WeShare" : /pushpay/i.test(html) ? "Pushpay" : /givecentral/i.test(html) ? "GiveCentral" : /paypal/i.test(html) ? "PayPal" : /ecatholic.*giving|onlinegiving|online giving/i.test(html) ? "other" : "none";
      return {
        desc: meta("description") ? 1 : 0,
        og: meta("og:image") ? 1 : 0,
        ld: q('script[type="application/ld+json"]') ? 1 : 0,
        h1: q("h1"),
        scripts: q("script[src]"),
        css: q('link[rel="stylesheet"]'),
        imgs: q("img"),
        big: [...document.images].filter((i) => i.naturalWidth >= 1400).length,
        tel: q('a[href^="tel:"]'),
        mailto: q('a[href^="mailto:"]'),
        massPanel: /massTimes_|getMassMode|MassTime/i.test(html) ? 1 : 0,
        massText: /\bMass(es)?\b[^.\n]{0,80}\b\d{1,2}(:\d{2})?\s*(a|p)\.?m\b/i.test(text) ? 1 : 0,
        hours: /office hours|hours:|mon(day)?[^.\n]{0,40}\d{1,2}(:\d{2})?\s*(a|p)\.?m/i.test(text) ? 1 : 0,
        bulletin: /bulletin/i.test(html) ? 1 : 0,
        giving,
        live: /youtube\.com|youtu\.be|facebook\.com\/[^"]*\/(videos|live)|vimeo|livestream|live stream|watch (mass|online)/i.test(html) ? 1 : 0,
        spanish: /\b(misa|español|espanol|bienvenidos)\b/i.test(text) ? 1 : 0,
        maxYear: years.length ? Math.max(...years) : 0,
        cust: (/(\d+)\.sites\.ecatholic\.com/.exec(html) ?? [])[1] ?? "",
        platform,
        title: document.title,
      };
    });
    Object.assign(row, m, { res: requests });
  } catch (e) {
    row.status = row.status || `error: ${String(e.message).split("\n")[0].slice(0, 60)}`;
  }
  rows.push(row);
  console.log(`${row.status.padEnd(6)} ${host} ${row.platform ?? ""}`);
  await page.close();
}
await browser.close();
const cols = ["host", "parish", "town", "status", "platform", "desc", "og", "ld", "h1", "scripts", "css", "imgs", "big", "tel", "mailto", "massPanel", "massText", "hours", "bulletin", "giving", "live", "spanish", "maxYear", "cust", "res", "title"];
const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, csv + "\n");
const ok = rows.filter((r) => r.status === "200");
const pct = (f) => `${Math.round((100 * ok.filter(f).length) / ok.length)}% (${ok.filter(f).length})`;
console.log(`\n${ok.length} of ${rows.length} answered 200`);
console.log("platforms:", Object.entries(ok.reduce((a, r) => ((a[r.platform] = (a[r.platform] ?? 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "));
console.log("no description", pct((r) => !r.desc), "| no og:image", pct((r) => !r.og), "| no structured data", pct((r) => !r.ld), "| no/duplicate h1", pct((r) => r.h1 !== 1), "| phone not tappable", pct((r) => !r.tel), "| no hours", pct((r) => !r.hours), "| no giving link", pct((r) => r.giving === "none"), "| livestream", pct((r) => r.live), "| spanish", pct((r) => r.spanish));
console.log("median scripts", median(ok.map((r) => r.scripts)), "median requests", median(ok.map((r) => r.res)), "stale (newest year < 2026)", ok.filter((r) => r.maxYear && r.maxYear < 2026).length);
function median(a) {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}
