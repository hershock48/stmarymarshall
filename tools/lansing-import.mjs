/**
 * Read the Diocese of Lansing's own parish directory (dioceseoflansing.org,
 * a Drupal site: /parish-list-vicariate groups every parish by vicariate,
 * /parish/<slug> is one record) into the same finder.json shape Kalamazoo
 * uses, plus vicariates.json for the deanery roster. The diocese publishes
 * no Mass times of its own (its site sends people to MassTimes.org), so
 * every row's panels are empty: the finder shows the parish, its address,
 * phone and site, and a parish on the platform answers with its own times.
 *
 *   node tools/lansing-import.mjs dioceses/lansing/finder.json
 *
 * Geocoding is Nominatim, one request a second, cached by address in the
 * previous file. No browser: the site answers plain fetches.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.dioceseoflansing.org";
const outFile = process.argv[2];
if (!outFile) {
  console.error("usage: node tools/lansing-import.mjs <out.json>");
  process.exit(1);
}
const UA = { "User-Agent": "Mozilla/5.0 (compatible; Narthex finder; +https://www.glazedweb.com)" };
const get = async (url) => {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
};
const text = (html) => html.replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&#039;/g, "’").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").split("\n").map((s) => s.trim()).filter(Boolean);

const previousFile = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : { parishes: [] };
// A zip-centroid fix (from the offline table) is retried against Nominatim; anything better is kept.
const geoCache = new Map((previousFile.parishes ?? []).filter((p) => p.geo && p.geo.source !== "zip").map((p) => [p.address, p.geo]));
const ZIPS = new Map(JSON.parse(fs.readFileSync(path.join(path.dirname(outFile), "..", "zips-mi.json"), "utf8")).rows.map((r) => [String(r[0]), { lat: r[2], lng: r[3] }]));

// The vicariate page: <h3>Vicariate</h3> then the parishes under it.
const list = await get(`${BASE}/parish-list-vicariate`);
const groups = [];
for (const m of list.matchAll(/<h3>([^<]+)<\/h3>|href="(\/parish\/[^"]+)"/g)) {
  if (m[1]) groups.push({ vicariate: m[1].trim(), paths: [] });
  else if (m[2] && groups.length && !groups[groups.length - 1].paths.includes(m[2])) groups[groups.length - 1].paths.push(m[2]);
}
console.log(groups.map((g) => `${g.vicariate}: ${g.paths.length}`).join("; "));

const rows = [];
const vicariates = [];
for (const g of groups) {
  const names = [];
  for (const p of g.paths) {
    const html = await get(`${BASE}${p}`);
    const name = (/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/&#039;/g, "’").replace(/&amp;/g, "&").trim();
    const addrHtml = /<p class="address"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? "";
    const parts = text(addrHtml);
    // The state only where it stands alone ("Michigan Center" is a town), and the zip after it.
    const address = parts.join(", ").replace(/, (MI|Michigan)(?=,|\s+\d{5}|$),?\s*/, ", MI, ").replace(/,\s*,/g, ",");
    const phone = /field--name-field-phone[^>]*>\s*<a href="tel:([^"]+)"/.exec(html)?.[1] ?? null;
    const site = /field--name-field-website[^>]*>\s*<a href="([^"]+)"/.exec(html)?.[1] ?? null;
    const email = /href="mailto:([^"?]+)"/.exec(html)?.[1] ?? null;
    // "807 St. Marys Blvd, Charlotte, MI, 48813": the town is the segment before the state.
    const town = (address.split(",").map((s) => s.trim()).slice(-3, -2)[0] ?? "").trim();
    if (!name) {
      console.error("no name at", p);
      continue;
    }
    rows.push({ name, address, site, phone, email, finderId: `dol_${p.split("/").pop()}`, town, vicariate: g.vicariate, panels: [] });
    // The roster entry is "Name, Town" with the "(includes ... Oratory)" note dropped, so lib/deaneries.ts can split it on the comma.
    names.push(`${name.replace(/\s*\(.*$/, "").trim()}, ${town}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  vicariates.push({ name: `${g.vicariate} Vicariate`, collaboratives: names.map((n) => [n]) });
}
console.log(`${rows.length} parishes read`);
if (rows.length < 60) {
  console.error("short read; nothing written");
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const r of rows) {
  if (geoCache.has(r.address)) {
    r.geo = geoCache.get(r.address);
    continue;
  }
  const q = r.address.replace(/\s*,\s*/g, ", ");
  // Nominatim answers HTML when it is throttling; treat that as "no fix" rather than a crash, and keep to its one-a-second policy.
  const nom = (query) => fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`, { headers: { "User-Agent": "glazedweb parish platform (kevin@glazedweb.com)" } }).then((x) => x.text()).then((t) => (t.startsWith("[") ? JSON.parse(t) : []));
  try {
    let j = await nom(q);
    let source = "nominatim:address";
    if (!j[0]) {
      j = await nom(`${r.town}, MI`);
      source = "nominatim:town";
    }
    if (j[0]) r.geo = { lat: Number(Number(j[0].lat).toFixed(6)), lng: Number(Number(j[0].lon).toFixed(6)), source };
  } catch (e) {
    console.error("geocode failed", r.name, e.message);
  }
  await sleep(1600);
}
// Whatever Nominatim could not place lands on its zip code's centroid from
// the offline table, a mile or two off at worst, so no parish is missing
// from the map; the source says so and the next run tries Nominatim again.
for (const r of rows) {
  if (r.geo) continue;
  const zip = /\b(\d{5})\b\s*$/.exec(r.address)?.[1];
  const z = zip ? ZIPS.get(zip) : undefined;
  if (z) r.geo = { lat: z.lat, lng: z.lng, source: "zip" };
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ readAt: new Date().toISOString().slice(0, 10), source: `${BASE}/parish-list-vicariate`, parishes: rows }, null, 1));
fs.writeFileSync(path.join(path.dirname(outFile), "vicariates.json"), JSON.stringify(vicariates, null, 1));
const missing = rows.filter((r) => !r.geo).map((r) => r.name);
console.log(`${rows.length - missing.length} geocoded${missing.length ? `; no fix for: ${missing.join(", ")}` : ""}`);
