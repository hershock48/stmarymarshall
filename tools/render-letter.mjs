/**
 * Screenshot and axe the letter at 390 and 1440. The letter is only served
 * on the pitch host, so it is opened straight from disk here; the absolute
 * og and icon URLs 404 and nothing else differs.
 *   node tools/render-letter.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);
const axeSrc = fs.readFileSync(path.join(ROOT, "..", "glazedweb", "node_modules", "axe-core", "axe.min.js"), "utf8");
// --slug picks the letter under public/pitch; --host serves it through the
// running platform instead (the parish domain is mapped to 127.0.0.1:4490,
// since Chromium will not send a forged Host header), so the images resolve.
const argv = (flag, dflt) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt);
const slug = argv("--slug", "stmarymarshall");
const host = argv("--host", "");
const letter = host ? `http://${host}:4490/` : pathToFileURL(path.join(ROOT, "public", "pitch", slug, "index.html")).href;
const chromium = await loadChromium();
const browser = await chromium.launch({ ...launchOpts(), ...(host ? { args: [`--host-resolver-rules=MAP ${host} 127.0.0.1`] } : {}) });
for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(letter, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addScriptTag({ content: axeSrc });
  const res = await page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
    return r.violations.map((v) => `${v.id}: ${v.nodes.length} (${v.nodes[0]?.target?.[0]})`);
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${width}: axe ${res.length ? res.join(" | ") : "0"}; overflow ${overflow}`);
  await page.screenshot({ path: path.join(ROOT, "tools", "out", `letter-${host ? host.split(".")[0] : slug}-${width}.png`), fullPage: true });
  await page.close();
}
await browser.close();
