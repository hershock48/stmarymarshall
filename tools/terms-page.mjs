/**
 * Writes public/pitch/<letter>/terms.html: the diocese agreement's own text
 * (Exhibit A) as a page on the letter's host, so the letter's "the terms"
 * link answers before the agreement page on glazedweb.com is live.
 *
 * The text is read from the glazedweb repo's lib/customOrders.js, which is
 * the one place it is written; nothing is retyped here. Run it again
 * whenever that row changes, and commit the result.
 *
 *   node tools/terms-page.mjs kalamazoo diokzoo [path/to/customOrders.js]
 *
 * The page borrows the letter's stylesheet, header and footer from
 * public/pitch/<letter>/index.html so the two cannot drift apart in looks.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [letter = "kalamazoo", order = "diokzoo", given] = process.argv.slice(2);
const root = process.cwd();
const candidates = [given, "../_wt-glazedweb-diokzoo/lib/customOrders.js", "../glazedweb/lib/customOrders.js"].filter(Boolean).map((p) => path.resolve(root, p));
const src = candidates.find((p) => fs.existsSync(p));
if (!src) throw new Error("customOrders.js not found; pass its path as the third argument");

const mod = await import(pathToFileURL(src).href);
const o = mod.CUSTOM_ORDERS[order];
if (!o) throw new Error(`no order "${order}" in ${src}`);
const part3 = o.moreTerms?.[0];
if (!o.scope?.length || !part3?.items?.length) throw new Error(`order "${order}" has no scope or no part 3; refusing to write an empty page`);

const letterFile = path.join(root, "public/pitch", letter, "index.html");
const html = fs.readFileSync(letterFile, "utf8");
const between = (a, b) => {
  const i = html.indexOf(a);
  const j = html.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error(`the letter has no ${a} ... ${b}`);
  return html.slice(i, j + b.length);
};
const style = between("<style>", "</style>");
const header = between("<header>", "</header>").replace(/<nav>[\s\S]*?<\/nav>/, `<nav>\n      <a href="/">The letter</a>\n      <a href="/brief">One page</a>\n    </nav>`).replace('href="#top"', 'href="/"');
const footer = between("<footer>", "</footer>");
const icons = html.split("\n").filter((l) => /<link rel="(icon|apple-touch-icon)"/.test(l)).join("\n");

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const money = (n) => `$${n.toLocaleString("en-US")}`;
const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Detroit" });

const page = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>The terms · Glazed Web × the ${esc(o.client)}</title>
<meta name="description" content="The diocesan agreement in plain words: what is included, what it costs, what the diocese owns, and the copy of the platform it holds.">
<meta name="theme-color" content="#FDF6EC">
${icons}
${style}
<style>
.terms ol{margin:0 0 14px 22px}
.terms li{margin:0 0 12px}
.terms ul{margin:0 0 14px 20px}
.terms .lead{color:var(--ink);font-weight:700}
.terms table.cmp td:first-child{width:30%}
@media print{
  header,.hdemo,footer .gmark{display:none}
  body{background:#fff;font-size:11pt}
  section{padding:18px 0;border-top:0}
  a{color:inherit;text-decoration:none}
}
</style>
</head><body>

${header}

<main class="terms">
<section id="top"><div class="wrap">
  <div class="k">The terms, in plain words</div><div class="rule"></div>
  <h1 style="font-size:clamp(30px,4.4vw,48px);font-weight:800;color:var(--ink);letter-spacing:-1.6px;line-height:1.08;margin:10px 0 14px">What the ${esc(o.client)} would be agreeing to.</h1>
  <p>This is the text of the agreement we would put in front of the diocese, as it stands on ${today}: ${esc(o.exhibit)}. It sits on top of the <a href="${mod.AGREEMENT_URL}" target="_blank" rel="noopener">${esc(mod.AGREEMENT_VERSION)} ↗</a>, the general terms every Glazed Web client gets. Where the two differ, this page governs, and part 3 says where.</p>
  <p class="note">Opening this page signs nothing. The copy to sign comes after the call, with the diocese&rsquo;s legal name on it.</p>
</div></section>

<section id="part1"><div class="wrap">
  <div class="k">Part 1</div><div class="rule"></div>
  <h2>What is included.</h2>
  <ul>
${o.scope.map((t) => `    <li>${esc(t)}</li>`).join("\n")}
  </ul>
  <h3>Not included, and quoted separately if wanted</h3>
  <p>${esc(cap(o.notIncluded))}</p>
</div></section>

<section id="part2"><div class="wrap">
  <div class="k">Part 2</div><div class="rule"></div>
  <h2>What it costs.</h2>
  <table class="cmp">
    <tr><td>Build fee</td><td>None. Every parish is migrated at no charge against the first term.</td></tr>
    <tr><td>Monthly service fee</td><td>${money(o.monthly)} a month, ${esc(o.monthlyWhen)} ${esc(o.monthlyCovers)} ${esc(o.termNote)}</td></tr>
    <tr><td>Included edits</td><td>Up to ${esc(o.editAllowance)} of small edits: ${esc(o.editExamples)}</td></tr>
    <tr><td>Beyond scope</td><td>${money(o.hourlyRate)} per hour, always quoted and approved in writing before any work starts. Nothing lands on a bill unannounced.</td></tr>
    <tr><td>The domains</td><td>${esc(o.domain)}, each in the parish&rsquo;s or the diocese&rsquo;s own registrar account.</td></tr>
  </table>
</div></section>

<section id="part3"><div class="wrap">
  <div class="k">Part 3</div><div class="rule"></div>
  <h2>${esc(cap(part3.title))}.</h2>
  <p>${esc(part3.intro)}</p>
  <ol>
${part3.items.map((it) => `    <li><span class="lead">${esc(it.lead)}</span> ${esc(it.text)}</li>`).join("\n")}
  </ol>
  <p class="note">Questions about any line: <a href="mailto:kevin@glazedweb.com?subject=${encodeURIComponent(o.client + " agreement")}">kevin@glazedweb.com</a>.</p>
</div></section>
</main>

${footer}
</body></html>
`;

if (page.includes(String.fromCharCode(0x2014))) throw new Error("an em dash reached the page; fix the source text");
const out = path.join(root, "public/pitch", letter, "terms.html");
fs.writeFileSync(out, page);
console.log(`wrote ${path.relative(root, out)} from ${path.relative(root, src)}: ${o.scope.length} scope lines, ${part3.items.length} part 3 items`);
