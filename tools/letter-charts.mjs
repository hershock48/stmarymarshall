/**
 * The charts in the diocese letter, generated from their data and written
 * between the <!-- chart:name --> markers in public/pitch/diocese/index.html.
 *
 *   node tools/letter-charts.mjs
 *
 * Horizontal bars in plain HTML (styled by .bars in the letter), 22px
 * thick, square at the baseline and rounded at the data end, the value at
 * the tip, text in ink and mute and never in the series color, a legend only where there are two series. The two hues
 * (the letter's pink for what was measured on the template, its green for
 * the new sites) were validated against the paper surface with the studio's
 * palette checker: contrast passes, CVD separation sits in the band that is
 * legal only with direct labels, which every bar has.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "public/pitch/diocese/index.html");
const PINK = "#CE3672";
const GREEN = "#467C3D";
const GRAY = "#C9BBA8";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * rows: [{ label, value, color }], max: the scale's top, unit: "%" or "".
 * Plain HTML, so the labels keep their type size on a phone (an SVG would
 * scale them down to nothing): a grid of label | bar | value, the label
 * moving above the bar under 600px.
 */
function bars({ rows, max, unit = "" }) {
  return `<div class="bars" role="img" aria-label="${esc(rows.map((r) => `${r.label}: ${r.value}${unit}`).join("; "))}">${rows
    .map((r) => {
      const pct = Math.max(1, Math.round((r.value / max) * 1000) / 10);
      return `<div class="row"><span class="lab">${esc(r.label)}</span><span class="bar"><i style="width:${pct}%;background:${r.color}"></i><b>${esc(String(r.value))}${unit}</b></span></div>`;
    })
    .join("")}</div>`;
}

function legend(items) {
  return `<p class="cap" style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px">${items.map((i) => `<span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${i.color};vertical-align:-1px;margin-right:6px"></span>${esc(i.label)}</span>`).join("")}</p>`;
}

const charts = {
  missing: `<div class="fig">
<h4>What is missing on the 42 template home pages</h4>
<p class="cap">Share of sites, measured in a browser on November 2, 2026.</p>
${bars({
  max: 100,
  unit: "%",
  rows: [
    { label: "No structured data", value: 100, color: PINK },
    { label: "No link-card image", value: 95, color: PINK },
    { label: "No office hours", value: 64, color: PINK },
    { label: "No search description", value: 60, color: PINK },
    { label: "No online giving link", value: 52, color: PINK },
    { label: "Email not tappable", value: 50, color: PINK },
    { label: "Phone not tappable", value: 17, color: PINK },
    { label: "Heading missing or doubled", value: 14, color: PINK },
  ],
})}
</div>`,

  images: `<div class="fig">
<h4>Images loaded by the home page</h4>
<p class="cap">The six heaviest template sites, and the rebuilt St. Mary site.</p>
${bars({
  max: 500,
  rows: [
    { label: "St. Mary, Paw Paw", value: 472, color: PINK },
    { label: "St. Joseph, St. Joseph", value: 431, color: PINK },
    { label: "St. Mary, Niles", value: 214, color: PINK },
    { label: "San Felipe, Fennville", value: 213, color: PINK },
    { label: "St. Mary, Marshall (old)", value: 208, color: PINK },
    { label: "St. John, Albion", value: 207, color: PINK },
    { label: "St. Mary, Marshall (new)", value: 3, color: GREEN },
  ],
})}
${legend([
  { color: PINK, label: "The template today" },
  { color: GREEN, label: "The new site" },
])}
</div>`,

  pew: `<div class="fig">
<h4>How Americans looked for a new congregation</h4>
<p class="cap">Share of adults who have ever searched. Pew Research Center, 5,000 adults, 2015 fieldwork.</p>
${bars({
  max: 100,
  unit: "%",
  rows: [
    { label: "Attended a service", value: 85, color: GRAY },
    { label: "Talked to members", value: 69, color: GRAY },
    { label: "Talked to friends", value: 68, color: GRAY },
    { label: "Talked to clergy", value: 55, color: GRAY },
    { label: "Looked online", value: 37, color: PINK },
    { label: "Made a phone call", value: 19, color: GRAY },
  ],
})}
<h4 style="margin-top:18px">Who looked online</h4>
<p class="cap">Same study. The online step is the one that grows.</p>
${bars({
  max: 100,
  unit: "%",
  rows: [
    { label: "Searched more than 5 years ago", value: 26, color: GRAY },
    { label: "Searched in the last 5 years", value: 47, color: PINK },
    { label: "Searchers under 30", value: 59, color: PINK },
  ],
})}
<p class="src">Pew Research Center, <a href="https://www.pewresearch.org/religion/2016/08/23/1-the-search-for-a-new-congregation/" target="_blank" rel="noopener">Choosing a New Church or House of Worship</a>, 2016. Of the same searchers, 70% said location played an important role.</p>
</div>`,

  cara: `<div class="fig">
<h4>Catholics who use their parish website</h4>
<p class="cap">CARA at Georgetown, national surveys of self-identified Catholics.</p>
${bars({
  max: 100,
  unit: "%",
  rows: [
    { label: "2005", value: 5, color: GRAY },
    { label: "2023", value: 44, color: PINK },
    { label: "2023, attends monthly or more", value: 62, color: PINK },
  ],
})}
<p class="src">Center for Applied Research in the Apostolate, <a href="https://cara.georgetown.edu/s/MediaUseReport2023.pdf" target="_blank" rel="noopener">Catholic Media Use Report</a>, 2023, 1,019 Catholics surveyed April 21 to May 5, 2023. Catholics under 55 were three times as likely as those over 55 to have used their parish website heavily during the pandemic.</p>
</div>`,
};

let html = fs.readFileSync(FILE, "utf8");
let n = 0;
for (const [name, markup] of Object.entries(charts)) {
  const re = new RegExp(`<!-- chart:${name} -->[\\s\\S]*?<!-- /chart:${name} -->`);
  if (!re.test(html)) {
    console.error(`no marker for chart:${name}`);
    process.exit(1);
  }
  html = html.replace(re, `<!-- chart:${name} -->\n${markup}\n<!-- /chart:${name} -->`);
  n++;
}
fs.writeFileSync(FILE, html);
console.log(`${n} charts written into ${path.relative(ROOT, FILE)}`);
