/**
 * Writes public/pitch/<slug>/brief.html for each diocese below: the letter
 * on one printed page, for the person who was not on the call (a finance
 * officer, a chancellor, a vicar general). Served at /brief on the letter's
 * host (proxy.ts). One US Letter page; tools/out/brief-check.mjs prints it
 * to PDF and fails if it runs to a second.
 *
 *   node tools/brief-page.mjs
 *
 * The numbers here must match the letter and the agreement. When a price
 * or a count changes there, change it here and run this again.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const BRIEFS = [
  {
    slug: "kalamazoo",
    diocese: "Diocese of Kalamazoo",
    headline: "Sixty parishes. One living platform.",
    sub: "Connected to each other, and to the diocese. Three parishes run on it today, and its Mass finder covers all sixty.",
    parish: [
      "The next Mass, Confession and Adoration, worked out from the clock",
      "The holy day on every page the week before",
      "The week&rsquo;s news typed once and printed as the bulletin insert",
      "A calendar anyone can subscribe to, and Watch at Mass time",
      "The office texts a change and it is up the same week",
    ],
    between: [
      "The gatherings of every parish on one page, from the young adult night to the parish mission",
      "Every group and ministry, with the person to call",
      "One Mass finder for all sixty parishes and missions, nearest first",
      "The three nearest parishes on every Mass times page",
    ],
    chancery: [
      "The bishop&rsquo;s voice on every parish home page the hour it is posted",
      "A notice typed once, on every parish site",
      "The Tuesday email compiled from the parish calendars",
      "Every site&rsquo;s health and use on one page, by deanery",
    ],
    price: "$3,990",
    priceLines: [
      "One line to the diocese. All sixty parishes and missions included, the fourteen with no website among them. No parish is billed.",
      "No build fee. Twelve months, then month to month on thirty days&rsquo; notice.",
      "$47,880 a year, about one percent of what last year&rsquo;s appeal pledged.",
      "Giving through the platform, once built: 1% of a gift, capped at $5, on the parish&rsquo;s own Stripe account.",
    ],
    owns: "Every page, photo, schedule, calendar and form. Its domains, in its own registrar account. Each parish&rsquo;s giving account, with every donor in it. Export at any time, free, as files, as data and as a copy of each site that runs on any host.",
    holds: "The diocese also holds the platform itself: a sealed copy, source included, delivered every quarter, with a written license to run it for its own parishes.",
    theirs: "eCatholic&rsquo;s terms say it &ldquo;will not provide you with any form of export of your Website.&rdquo;",
    steps: [
      ["This month, free, nothing signed", "A finder of the diocese&rsquo;s own, the bishop&rsquo;s voice and the weekly digest, on the diocese&rsquo;s site as it is or as we rebuilt it. Ninety days; nothing renews on its own.", "Point the Parish Finder page on diokzoo.org at it."],
      ["Any parish you name, built free", "St. Mary Marshall, St. Philip Battle Creek and San Felipe de Jesús run on it now.", "Name as many as you like and we build them all."],
      ["Then one license", "Every parish included, moving at its own pace. Each old subscription ends after its site is live.", ""],
    ],
    see: ["kalamazoo.glazedweb.com", "finder.kalamazoo.glazedweb.com", "diokzoo.glazedweb.com (the diocese&rsquo;s site, rebuilt)"],
  },
  {
    slug: "lansing",
    diocese: "Diocese of Lansing",
    headline: "Seventy-three parishes. One living platform.",
    sub: "Connected to each other, and to the diocese. Its Mass finder covers all 73 Lansing parishes today, and three parishes run on it in the Diocese of Kalamazoo.",
    parish: [
      "The next Mass, Confession and Adoration, worked out from the clock",
      "The holy day on every page the week before",
      "The week&rsquo;s news typed once and printed as the bulletin insert",
      "A calendar anyone can subscribe to, and Watch at Mass time",
      "The office texts a change and it is up the same week",
    ],
    between: [
      "The gatherings of every parish on one page, as parishes join",
      "Every group and ministry, with the person to call",
      "One Mass finder for all 73 parishes, from the diocese&rsquo;s own directory",
      "Each parish that joins adds its Mass times the same day",
    ],
    chancery: [
      "The bishop&rsquo;s voice on every parish home page, with his podcast already in it",
      "A notice typed once, on every parish site",
      "The weekly email compiled from the parish calendars",
      "Every site&rsquo;s health and use on one page, by vicariate",
    ],
    price: "$4,990",
    priceLines: [
      "One line to the diocese. All 73 parishes included. No parish is billed.",
      "No build fee. Twelve months, then month to month on thirty days&rsquo; notice.",
      "$59,880 a year, about one percent of this year&rsquo;s appeal goal.",
      "Giving through the platform, once built: 1% of a gift, capped at $5, on the parish&rsquo;s own Stripe account.",
    ],
    owns: "Every page, photo, schedule, calendar and form. Its domains, in its own registrar account. Each parish&rsquo;s giving account, with every donor in it. Export at any time, free, as files, as data and as a copy of each site that runs on any host.",
    holds: "The diocese also holds the platform itself: a sealed copy, source included, delivered every quarter, with a written license to run it for its own parishes.",
    theirs: "eCatholic&rsquo;s terms, for the twenty-six parishes on it, say it &ldquo;will not provide you with any form of export of your Website.&rdquo;",
    steps: [
      ["This month, free, nothing signed", "A finder of the diocese&rsquo;s own and the bishop&rsquo;s voice. Ninety days; nothing renews on its own.", "Point the find-a-parish page on dioceseoflansing.org at it."],
      ["Any parish you name, built free", "Three run on it now in the Diocese of Kalamazoo; St. Philip, Battle Creek is the one to open.", "Name as many as you like and we build them all."],
      ["Then one license", "All 73 parishes included, moving at their own pace. Each old subscription ends after its site is live.", ""],
    ],
    see: ["lansing.glazedweb.com", "finder.lansing.glazedweb.com", "kalamazoo.glazedweb.com/terms"],
  },
];

const li = (items) => items.map((t) => `<li>${t}</li>`).join("");

for (const b of BRIEFS) {
  const letter = fs.readFileSync(path.join(root, "public/pitch", b.slug, "index.html"), "utf8");
  const a = letter.indexOf('<svg class="gmark gl"');
  const mark = letter.slice(a, letter.indexOf("</svg>", a) + 6);
  if (a < 0) throw new Error(`${b.slug}: the letter has no mark to borrow`);
  const icons = letter.split("\n").filter((l) => /<link rel="(icon|apple-touch-icon)"/.test(l)).join("\n");

  const page = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>One page · Glazed Web × the ${b.diocese}</title>
<meta name="description" content="The letter to the ${b.diocese} on one page, to print: what the platform is, what it costs, what the diocese owns, and what happens next.">
<meta name="theme-color" content="#FDF6EC">
${icons}
<style>
:root{
 --paper:#FDF6EC; --card:#FFFDF8; --ink:#2B1E16; --body:#5E4C3E; --mute:#7F6D5B; --line:#E8DCC8;
 --pink:#E84D8A; --pink-i:#C9356F; --green:#BFE07A; --green-d:#467C3D; --green-t:#F1F8DC;
 --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--paper);color:var(--body);font-family:var(--sans);font-size:12.4px;line-height:1.38;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}
a{color:var(--pink-i)}
.bar{max-width:8.5in;margin:0 auto;padding:14px 24px 0;font-size:13px;display:flex;gap:18px;flex-wrap:wrap}
.sheet{max-width:8.5in;margin:14px auto 40px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:.5in .55in}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line);padding-bottom:10px}
.brand{display:flex;align-items:center;gap:9px}
.brand svg{height:34px;width:auto;display:block}
.bw{font-weight:800;font-size:19px;color:var(--ink);letter-spacing:-.6px}
.bw span{font-weight:350;color:var(--mute)}
.for{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--green-d);text-align:right}
h1{font-size:29px;font-weight:800;color:var(--ink);letter-spacing:-1.1px;line-height:1.08;margin:12px 0 5px}
.sub{font-size:13.6px;color:var(--ink);max-width:6.6in;margin-bottom:11px}
h2{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--green-d);margin-bottom:6px}
h3{font-size:14.5px;font-weight:800;color:var(--ink);letter-spacing:-.2px;margin-bottom:5px}
.three{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:11px}
.three ul{list-style:none}
.three li{padding:3px 0 3px 12px;border-top:1px solid var(--line);position:relative}
.three li::before{content:"";position:absolute;left:0;top:9px;width:5px;height:5px;border-radius:50%;background:var(--pink)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:11px}
.box{border:1px solid var(--line);border-radius:8px;padding:10px 12px}
.box.own{border:2px solid var(--green);background:var(--green-t)}
.price{font-size:27px;font-weight:800;color:var(--ink);letter-spacing:-1px;line-height:1}
.price span{font-size:13px;font-weight:600;color:var(--mute);letter-spacing:0}
.box p{margin-top:5px}
.box .q{color:var(--ink);font-weight:600}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:13px}
.steps u{display:block;text-decoration:none;color:var(--pink-i);font-weight:700;margin-top:3px}
.steps div{border-top:3px solid var(--pink);padding-top:6px}
.steps b{display:block;color:var(--ink);font-size:13px;line-height:1.25;margin-bottom:3px}
.steps i{font-style:normal;font-size:11px;font-weight:700;color:var(--pink-i);letter-spacing:.1em}
.foot{display:flex;justify-content:space-between;gap:18px;border-top:1px solid var(--line);padding-top:9px;font-size:12px}
.foot b{color:var(--ink)}
@media (max-width:720px){
  .sheet{margin:10px 12px 30px;padding:20px 18px}
  .three,.two,.steps{grid-template-columns:1fr}
  .top,.foot{flex-direction:column;align-items:flex-start}
  .for{text-align:left}
  h1{font-size:27px}
}
@page{size:letter;margin:.4in}
@media print{
  body{background:#fff}
  .bar{display:none}
  .sheet{margin:0;max-width:none;border:0;border-radius:0;padding:0;background:#fff}
  .box.own{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  a{color:inherit;text-decoration:none}
}
</style>
</head><body>
<nav class="bar" aria-label="This page"><a href="/">← The full letter</a><span>This page prints on one sheet.</span></nav>
<main class="sheet">
  <div class="top">
    <div class="brand">${mark}<span class="bw">glazed<span>web</span></span></div>
    <div class="for">For the ${b.diocese}<br>November 2026</div>
  </div>
  <h1>${b.headline}</h1>
  <p class="sub">${b.sub}</p>

  <h2>The offer, in three steps</h2>
  <div class="steps">
    ${b.steps.map(([h, t, ask], i) => `<div><i>${i + 1}</i><b>${h}</b>${t}${ask ? `<u>The ask: ${ask}</u>` : ""}</div>`).join("\n    ")}
  </div>

  <div class="three">
    <div><h2>Between parishes</h2><h3>Connected to each other</h3><ul>${li(b.between)}</ul></div>
    <div><h2>For the diocese</h2><h3>A way to see, and to send</h3><ul>${li(b.chancery)}</ul></div>
    <div><h2>For a parish</h2><h3>A site that is alive</h3><ul>${li(b.parish)}</ul></div>
  </div>

  <div class="two">
    <div class="box">
      <h2>What it costs</h2>
      <div class="price">${b.price} <span>a month</span></div>
      ${b.priceLines.map((t) => `<p>${t}</p>`).join("\n      ")}
    </div>
    <div class="box own">
      <h2>What the diocese owns</h2>
      <p style="margin-top:0">${b.owns}</p>
      <p>${b.holds}</p>
      <p class="q">${b.theirs}</p>
    </div>
  </div>

  <div class="foot">
    <div><b>See it running</b><br>${b.see.join("<br>")}</div>
    <div><b>Say yes by email</b><br>Kevin Hershock · Glazed Web, Marshall, Michigan<br>kevin@glazedweb.com</div>
    <div><b>Two things to say yes to</b><br>Point the finder.<br>Name your parishes.</div>
  </div>
</main>
</body></html>
`;
  if (page.includes(String.fromCharCode(0x2014))) throw new Error("an em dash reached the brief");
  const out = path.join(root, "public/pitch", b.slug, "brief.html");
  fs.writeFileSync(out, page);
  console.log("wrote", path.relative(root, out));
}
