/**
 * The checks the axe auditor does not make, after Kevin spotted a "Call"
 * button whose text sat at the top instead of the middle.
 *
 *   node tools/ux-check.mjs [--base http://127.0.0.1:4490]
 *
 * At 390, 1024, 1280 and 1440, on every route:
 *   - every link and button measures at least 24px tall and wide
 *     (glaze/standards.md), reported with its text if not;
 *   - every element whose classes say inline-flex or flex is actually
 *     laid out that way (an unlayered CSS rule can silently override a
 *     utility, which is exactly what happened);
 *   - inside every flex button the text is vertically centered within 2px;
 *   - the header fits on one line, with no item wrapping and nothing clipped;
 *   - no element scrolls horizontally inside its own box.
 * Exit code 1 if anything fails.
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(ROOT, "..", "glazedweb", "glaze", "scripts", "lib", "browser.mjs");
const { loadChromium, launchOpts } = await import(pathToFileURL(helper).href);
const base = process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : "http://127.0.0.1:4490";
const routes = ["/", "/new", "/mass-times", "/about", "/sacraments", "/faith-formation", "/ministries", "/events", "/bulletin", "/give", "/register", "/mass-intentions", "/prayer-request", "/register/thanks?state=unconfigured"];
const widths = [390, 1024, 1280, 1440];

const chromium = await loadChromium();
const browser = await chromium.launch(launchOpts());
let failures = 0;
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: "networkidle" });
    await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
    // Open every <details> so folded controls get measured too.
    await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
    const problems = await page.evaluate(() => {
      const out = [];
      const vis = (el) => {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 || r.height > 0;
      };
      const label = (el) => (el.innerText || el.getAttribute("aria-label") || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
      for (const el of document.querySelectorAll("a, button, input, select, textarea, summary")) {
        if (!vis(el)) continue;
        if (el.closest(".sr-only") || el.classList.contains("sr-only")) continue;
        if (el.type === "hidden" || el.closest('[aria-hidden="true"]')) continue;
        const r = el.getBoundingClientRect();
        if (r.height < 24 || r.width < 24) out.push(`small target ${Math.round(r.width)}x${Math.round(r.height)}: ${label(el)}`);
        const cls = el.className && typeof el.className === "string" ? el.className : "";
        const cs = getComputedStyle(el);
        // A flex item is blockified, so an inline-flex child of a flex or
        // grid parent legitimately computes to "flex". Either is fine; a
        // block or inline-block is the override this check exists for.
        if (/\binline-flex\b/.test(cls) && !/^(inline-)?flex$/.test(cs.display)) out.push(`inline-flex lost (${cs.display}): ${label(el)}`);
        if (/\bflex\b/.test(cls) && !/\binline-flex\b/.test(cls) && cs.display !== "flex" && !/\b(sm|md|lg|xl):flex\b/.test(cls)) out.push(`flex lost (${cs.display}): ${label(el)}`);
        if (/^(inline-)?flex$/.test(cs.display) && cs.alignItems === "center" && el.firstChild && el.firstChild.nodeType === 3) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const t = range.getBoundingClientRect();
          const off = Math.abs(t.top + t.height / 2 - (r.top + r.height / 2));
          if (off > 2) out.push(`text off center by ${off.toFixed(1)}px: ${label(el)}`);
        }
        if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== "visible") out.push(`clipped: ${label(el)}`);
      }
      const header = document.querySelector("header > div");
      if (header) {
        const items = [...header.querySelectorAll("a, button")].filter(vis);
        const tops = new Set(items.map((i) => Math.round(i.getBoundingClientRect().top / 8)));
        if (tops.size > 1) out.push(`header wraps onto ${tops.size} lines`);
        for (const i of items) if (i.scrollWidth > i.clientWidth + 1) out.push(`header item clipped: ${label(i)}`);
        if (header.scrollWidth > header.clientWidth + 1) out.push("header overflows its box");
      }
      if (document.documentElement.scrollWidth > document.documentElement.clientWidth) out.push(`page overflow ${document.documentElement.scrollWidth}`);
      return out;
    });
    if (problems.length) {
      failures += problems.length;
      console.log(`FAIL ${r} @${width}\n  ${[...new Set(problems)].join("\n  ")}`);
    } else {
      console.log(`ok   ${r} @${width}`);
    }
  }
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} problem(s)` : "\nclean");
process.exit(failures ? 1 : 0);
