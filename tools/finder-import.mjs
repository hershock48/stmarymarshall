/**
 * Read the diocese's own Parish Finder (diokzoo.org/parishfinder, saved to
 * disk) into one JSON file: every parish and mission with its address,
 * phone, email, site and the Mass, Confession and Adoration panels the
 * finder shows, then a latitude and longitude for each address from
 * Nominatim (one request a second, as its policy asks).
 *
 *   curl -A "Mozilla/5.0" -o parishfinder.html https://diokzoo.org/parishfinder
 *   node tools/finder-import.mjs parishfinder.html parishes/diocese/finder.json
 *
 * The finder is eCatholic's MassTime data as the diocese publishes it; the
 * page is parsed in a real browser so the markup is read the way the
 * finder renders it. This is the ingestion the diocese letter describes:
 * every parish on the platform's finder from day one, the ones on the
 * platform from their own data, the rest from here, each marked with its
 * source. Re-run it when the finder changes; the diff is the news.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);
const [, , htmlFile, outFile] = process.argv;
if (!htmlFile || !outFile) {
  console.error("usage: node tools/finder-import.mjs <parishfinder.html> <out.json>");
  process.exit(1);
}
const previousFile = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : { parishes: [] };
const previous = Array.isArray(previousFile) ? previousFile : previousFile.parishes ?? [];
const geoCache = new Map(previous.filter((p) => p.geo).map((p) => [p.address, p.geo]));

const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
const page = await browser.newPage();
await page.setContent(fs.readFileSync(htmlFile, "utf8"));
const rows = await page.evaluate(() => {
  const out = [];
  for (const a of document.querySelectorAll('a[href*="google.com/maps/search"]')) {
    let card = a;
    for (let i = 0; i < 8 && card && !(card.querySelectorAll('a[href*="google.com/maps/search"]').length === 1 && card.querySelector('a[href^="#massTimes_"]')); i++) card = card.parentElement;
    if (!card) continue;
    const query = decodeURIComponent(new URL(a.href).searchParams.get("query") || "");
    const lines = card.innerText.split("\n").map((s) => s.trim()).filter(Boolean);
    const name = lines.find((l) => !/^back$/i.test(l)) || "";
    const address = query.startsWith(name) ? query.slice(name.length).trim() : lines[lines.indexOf(name) + 1] || "";
    const mt = card.querySelector('a[href^="#massTimes_"]');
    const id = mt ? mt.getAttribute("href").slice(1) : null;
    const panel = id ? document.getElementById(id) : null;
    const site = [...card.querySelectorAll('a[href^="http"]')].map((x) => x.href).filter((h) => !/google\.com\/maps|diokzoo\.org|facebook|youtube/.test(h))[0] || null;
    const phone = (card.innerText.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/) || [null])[0];
    const email = [...card.querySelectorAll('a[href^="mailto:"]')].map((x) => x.href.slice(7))[0] || null;
    const panels = [];
    if (panel) {
      let cat = "";
      for (const el of panel.querySelectorAll(".categoryName, ul.sacramentTimes")) {
        if (el.classList.contains("categoryName")) {
          cat = el.textContent.trim();
          continue;
        }
        const ulClass = el.className;
        for (const li of el.querySelectorAll("li.sacramentDay")) {
          const d = li.querySelector(".day");
          const dayClass = [...(d ? d.classList : [])].filter((c) => !["day", "massModeSacramentDay"].includes(c)).join(" ");
          const dayText = d ? d.textContent.replace(":", "").trim() : "";
          const times = [...li.querySelectorAll(".sacramentTime")].map((t) => ({
            time: (t.querySelector(".startTime")?.textContent || "").replace(/\s+/g, " ").trim(),
            end: (t.querySelector(".endTime")?.textContent || "").replace(/\s+/g, " ").trim() || undefined,
            lang: (t.querySelector(".abbrLanguage")?.textContent || "").trim() || undefined,
            note: (t.querySelector(".notes")?.textContent || "").replace(/\s+/g, " ").trim() || undefined,
          }));
          panels.push({ cat, ulClass, dayClass, dayText, times, text: times.length ? undefined : li.innerText.replace(/\s+/g, " ").trim() });
        }
      }
    }
    out.push({ name, address, site, phone, email, finderId: id, panels });
  }
  return out;
});
await browser.close();
console.log(`${rows.length} parishes read from the finder`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const r of rows) {
  if (geoCache.has(r.address)) {
    r.geo = geoCache.get(r.address);
    continue;
  }
  const q = r.address.replace(/\s*,\s*/g, ", ").replace(/,\s*,/g, ",");
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "glazedweb parish platform (kevin@glazedweb.com)" } });
    const j = await res.json();
    if (j[0]) r.geo = { lat: Number(Number(j[0].lat).toFixed(6)), lng: Number(Number(j[0].lon).toFixed(6)), source: "nominatim:address" };
    else {
      // Fall back to the town, so the parish still lands on the map.
      const town = q.split(",").slice(-3).join(",");
      const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(town)}`, { headers: { "User-Agent": "glazedweb parish platform (kevin@glazedweb.com)" } });
      const j2 = await res2.json();
      if (j2[0]) r.geo = { lat: Number(Number(j2[0].lat).toFixed(6)), lng: Number(Number(j2[0].lon).toFixed(6)), source: "nominatim:town" };
    }
  } catch (e) {
    console.error("geocode failed", r.name, e.message);
  }
  await sleep(1100);
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ readAt: new Date().toISOString().slice(0, 10), source: "https://diokzoo.org/parishfinder", parishes: rows }, null, 1));
const missing = rows.filter((r) => !r.geo).map((r) => r.name);
console.log(`${rows.length - missing.length} geocoded${missing.length ? `; no fix for: ${missing.join(", ")}` : ""}`);
