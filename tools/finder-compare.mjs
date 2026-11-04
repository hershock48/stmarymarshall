/**
 * Two phone screenshots for the diocese letter: the diocese's own Parish
 * Finder as it stands, and Narthex's finder from the same place (Marshall,
 * 49068), both at 390px wide. Written as WebP into public/pitch/diocese/.
 *
 *   node tools/finder-compare.mjs
 *
 * Look at both before shipping (glaze: render before shipping art). The
 * diocese's page sits behind Cloudflare, which a real Chromium passes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);
const out = path.join(ROOT, "public/pitch/diocese");
const shots = [
  { name: "finder-theirs", url: "https://www.diokzoo.org/parishfinder", wait: 'a[href^="#massTimes_"]' },
  { name: "finder-ours", url: "https://finder.kalamazoo.glazedweb.com/?q=49068&r=25", wait: "main li h2", scrollTo: "main li" },
];
const only = process.argv[2];
const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
for (const s of shots) {
  if (only && s.name !== only) continue;
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
  await page.goto(s.url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector(s.wait, { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  // Ours: the results, not the form; the form is the first screen and the point is the cards.
  if (s.scrollTo) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 56);
    }, s.scrollTo);
  }
  await page.waitForTimeout(400);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).webp({ quality: 82 }).toFile(path.join(out, `${s.name}.webp`));
  await sharp(png).png().toFile(path.join(out, `${s.name}.png`));
  console.log(s.name, (fs.statSync(path.join(out, `${s.name}.webp`)).size / 1024).toFixed(0) + " KB");
  await page.close();
}
await browser.close();
