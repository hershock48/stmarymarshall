/**
 * The pictures for the letters' tour: one screenshot of each stop, taken
 * from the platform's own live pages, saved beside each letter.
 *
 *   node tools/tour-shots.mjs
 *
 * Every address here is one of ours. Run it again when a stop changes so
 * the picture in the letter is the page as it is.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);

const SHOTS = [
  ["kalamazoo", "tour-diocese", "https://diokzoo.glazedweb.com/"],
  ["kalamazoo", "tour-parish", "https://stphilip.glazedweb.com/demo"],
  ["kalamazoo", "tour-finder", "https://diokzoo.glazedweb.com/diocese/near?q=49007&r=25"],
  ["kalamazoo", "tour-week", "https://diokzoo.glazedweb.com/diocese/events"],
  ["kalamazoo", "tour-voice", "https://diokzoo.glazedweb.com/diocese/voice"],
  ["lansing", "tour-finder", "https://finder.lansing.glazedweb.com/?q=48933&r=25"],
  ["lansing", "tour-voice", "https://finder.lansing.glazedweb.com/diocese/voice"],
  ["lansing", "tour-parish", "https://stphilip.glazedweb.com/demo"],
  ["lansing", "tour-week", "https://finder.kalamazoo.glazedweb.com/diocese/events"],
];

const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
for (const [slug, name, url] of SHOTS) {
  const page = await ctx.newPage();
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  if (!res || res.status() !== 200) throw new Error(`${url} answered ${res?.status()}`);
  await page.evaluate(async () => {
    await Promise.all([...document.images].filter((im) => im.getBoundingClientRect().top < 900).map((im) => im.decode().catch(() => 0)));
  });
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 800 } });
  const out = path.join(ROOT, "public/pitch", slug, `${name}.webp`);
  const info = await sharp(png).resize({ width: 1400 }).webp({ quality: 82 }).toFile(out);
  console.log(slug, name, info.width + "x" + info.height, Math.round(info.size / 1024) + " KB");
  await page.close();
}
await browser.close();

// The chancery view's top, from the full picture the letters already carry.
for (const slug of ["kalamazoo", "lansing"]) {
  const src = path.join(ROOT, "public/pitch", slug, "chancery.webp");
  const info = await sharp(src).extract({ left: 0, top: 0, width: 1400, height: 875 }).webp({ quality: 82 }).toFile(path.join(ROOT, "public/pitch", slug, "tour-chancery.webp"));
  console.log(slug, "tour-chancery", info.width + "x" + info.height);
}
