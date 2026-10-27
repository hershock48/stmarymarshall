/**
 * Which element shifts, and when, on the home page under the throttled
 * mobile profile perf-check uses. Prints every layout-shift entry with its
 * source nodes. Run when perf-check reports CLS; the number alone never
 * says what moved.
 *   node tools/cls-probe.mjs
 */
import { pathToFileURL } from "node:url";
const { loadChromium, launchOpts } = await import(pathToFileURL("C:/Users/hersh/Glazedweb/glazedweb/glaze/scripts/lib/browser.mjs").href);
const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({ value: e.value, t: Math.round(e.startTime), sources: (e.sources || []).map((s) => { const n = s.node; return n ? (n.tagName + (n.id ? "#" + n.id : "") + (n.className && typeof n.className === "string" ? "." + n.className.split(" ").slice(0, 3).join(".") : "") + " :: " + (n.textContent || "").trim().slice(0, 40)) : "?"; }) });
    }
  }).observe({ type: "layout-shift", buffered: true });
});
await page.goto("http://127.0.0.1:4490/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const shifts = await page.evaluate(() => window.__shifts);
console.log(JSON.stringify(shifts, null, 1));
await browser.close();
