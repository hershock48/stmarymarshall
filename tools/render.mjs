/**
 * Full-page screenshots of every route at a phone and a desktop width, so
 * the pages get LOOKED AT before they ship (render-before-shipping rule).
 *
 *   node tools/render.mjs [--base http://127.0.0.1:4490]
 *
 * Writes tools/out/<route>-<width>.png. The browser resolves through the
 * glaze helper, the same as the auditor.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);
const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://127.0.0.1:4490";
const routes = ["/", "/mass-times", "/about", "/sacraments", "/faith-formation", "/ministries", "/events", "/bulletin", "/give", "/register", "/register/thanks?state=unconfigured", "/nope"];
const out = path.join(ROOT, "tools", "out");
fs.mkdirSync(out, { recursive: true });
const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const name = (r === "/" ? "home" : r.replace(/^\//, "").replace(/[\/?=]/g, "-")) + "-" + width + ".png";
    await page.screenshot({ path: path.join(out, name), fullPage: true });
    console.log(name);
  }
  await page.close();
}
await browser.close();
