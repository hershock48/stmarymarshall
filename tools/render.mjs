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
const arg = (flag, dflt) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt);
// --host picks the parish: Chromium will not send a forged Host header, so the
// parish's domain is mapped to the local server instead and the page is asked
// for by its real name. --prefix names the files.
const host = arg("--host", "");
const prefix = arg("--prefix", "");
const port = new URL(arg("--base", "http://127.0.0.1:4490")).port || "80";
const base = host ? `http://${host}:${port}` : arg("--base", "http://127.0.0.1:4490");
const routes = ["/", "/mass-times", "/about", "/sacraments", "/faith-formation", "/ministries", "/events", "/bulletin", "/give", "/register", "/register/thanks?state=unconfigured", "/new", "/mass-intentions", "/prayer-request", "/nope"];
const out = path.join(ROOT, "tools", "out");
fs.mkdirSync(out, { recursive: true });
const chromium = await loadChromium();
const browser = await chromium.launch({ ...launchOpts(), ...(host ? { args: [`--host-resolver-rules=MAP ${host} 127.0.0.1`] } : {}) });
for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const name = prefix + (r === "/" ? "home" : r.replace(/^\//, "").replace(/[\/?=]/g, "-")) + "-" + width + ".png";
    await page.screenshot({ path: path.join(out, name), fullPage: true });
    console.log(name);
  }
  await page.close();
}
await browser.close();
