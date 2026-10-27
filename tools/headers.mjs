// Header strips at the laptop widths and the open mobile menu, for a look.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadChromium, launchOpts } = await import(pathToFileURL(path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs")).href);
const chromium = await loadChromium(); const browser = await chromium.launch(launchOpts());
for (const w of [1024, 1280, 1536]) { const p = await browser.newPage({ viewport: { width: w, height: 400 } }); await p.goto("http://127.0.0.1:4490/mass-times", { waitUntil: "networkidle" }); await p.screenshot({ path: path.join(ROOT, "tools/out", `header-${w}.png`), clip: { x: 0, y: 0, width: w, height: 80 } }); await p.close(); }
const m = await browser.newPage({ viewport: { width: 390, height: 844 } }); await m.goto("http://127.0.0.1:4490/", { waitUntil: "networkidle" }); await m.click("button[aria-controls=mobile-nav]"); await m.waitForTimeout(200); await m.screenshot({ path: path.join(ROOT, "tools/out", "mobile-menu-390.png") }); await m.close();
await browser.close(); console.log("headers done");
