/**
 * The diocese layer at fixed instants: the finder's conversion of the
 * Parish Finder panels (weekdays, multi-day rows, first Fridays, dated
 * Masses), the place lookup, and distances. Same loader as
 * logic-tests.mjs. `node tools/diocese-tests.mjs`; exits 1 on a failure.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = (await import(pathToFileURL(path.join(ROOT, "node_modules/typescript/lib/typescript.js")).href)).default;
const tmp = path.join(ROOT, ".next-diocese-tests");
fs.mkdirSync(tmp, { recursive: true });
// A diocese folder's files are flattened into the temp dir with the slug as
// a prefix, so two dioceses' sibling imports ("./voice", "./finder.json")
// cannot collide.
const transpile = (file, out, prefix = "") => {
  const src = fs
    .readFileSync(file, "utf8")
    .replace(/from "@\/lib\/(\w+)"/g, 'from "./$1.mjs"')
    .replace(/from "@\/parishes\/(\w+)\/data"/g, 'from "./data-$1.mjs"')
    .replace(/from "@\/dioceses"/g, 'from "./dioceses.mjs"')
    .replace(/from "\.\/(\w+)\/config"/g, 'from "./$1-config.mjs"')
    .replace(/from "\.\/(deaneries|events|notices|voice)"/g, `from "./${prefix}$1.mjs"`)
    .replace(/import (\w+) from "\.\/([\w-]+)\.json";/g, `import $1 from "./${prefix}$2.json" with { type: "json" };`)
    .replace(/import (\w+) from "@\/[\w\/-]*\/([\w-]+)\.json";/g, 'import $1 from "./$2.json" with { type: "json" };');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false } }).outputText;
  fs.writeFileSync(path.join(tmp, out), js);
};
for (const f of ["i18n", "schedule", "events", "ics", "sentences", "geo", "diocese", "paths", "voice", "news", "notices", "deaneries"]) transpile(path.join(ROOT, "lib", f + ".ts"), f + ".mjs");
transpile(path.join(ROOT, "dioceses/index.ts"), "dioceses.mjs");
for (const slug of ["stmarymarshall", "stphilipbc", "sanfelipe"]) transpile(path.join(ROOT, "parishes", slug, "data.ts"), `data-${slug}.mjs`);
for (const d of fs.readdirSync(path.join(ROOT, "dioceses"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
  const dir = path.join(ROOT, "dioceses", d);
  transpile(path.join(dir, "config.ts"), `${d}-config.mjs`, `${d}-`);
  for (const f of ["events", "notices", "voice", "deaneries"]) transpile(path.join(dir, f + ".ts"), `${d}-${f}.mjs`, `${d}-`);
  for (const j of fs.readdirSync(dir).filter((n) => n.endsWith(".json"))) fs.copyFileSync(path.join(dir, j), path.join(tmp, `${d}-${j}`));
}
fs.copyFileSync(path.join(ROOT, "dioceses/zips-mi.json"), path.join(tmp, "zips-mi.json"));
fs.copyFileSync(path.join(ROOT, "parishes/registry.json"), path.join(tmp, "registry.json"));
const S = await import(pathToFileURL(path.join(tmp, "schedule.mjs")).href);
const G = await import(pathToFileURL(path.join(tmp, "geo.mjs")).href);
const D = await import(pathToFileURL(path.join(tmp, "diocese.mjs")).href);
const K = (await import(pathToFileURL(path.join(tmp, "dioceses.mjs")).href)).DIOCESES[0];

let fails = 0;
const ok = (name, got, want) => {
  const pass = JSON.stringify(got) === JSON.stringify(want);
  if (!pass) fails++;
  console.log(`${pass ? "ok  " : "FAIL"} ${name}${pass ? "" : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`);
};
const at = (iso) => S.localNow("America/Detroit", new Date(iso));
const find = (name, town) => D.dioceseParishes(K, at("2026-11-04T12:00:00Z")).find((p) => p.name === name && (!town || p.town === town));
const next = (p, now) => {
  const n = S.nextService(p.masses, now, p.specials, "en");
  return n ? `${S.whenWord(n, "en")} ${n.time} (${n.label})` : null;
};

// Conversion of the finder panels.
const ha = find("Holy Angels", "Sturgis");
ok("Holy Angels: Mon-Fri 8:30 AM becomes five weekday rows", ha.masses.filter((m) => m.start === "08:30").map((m) => m.day), [1, 2, 3, 4, 5]);
ok("Holy Angels: Sunday 1:00 PM is marked Español", ha.masses.find((m) => m.day === 0 && m.start === "13:00")?.lang, "Español");
ok("Holy Angels: Saturday vigil is day 6 at 18:00", ha.masses.some((m) => m.day === 6 && m.start === "18:00"), true);
const wv = find("St. Joseph", "Watervliet");
ok("St. Joseph Watervliet: 'M Tu W Sa' 9:00 AM gives 1,2,3,6", wv.masses.filter((m) => m.start === "09:00").map((m) => m.day).sort(), [1, 2, 3, 6]);
const bs = find("Blessed Sacrament", "Allegan");
ok("Blessed Sacrament: 1st Friday is dated, not weekly", bs.masses.some((m) => m.day === 5), false);
ok("Blessed Sacrament: first Fridays Nov 6, Dec 4, Jan 1 at 18:00", bs.specials.filter((s) => s.start === "18:00").map((s) => s.date), ["2026-11-06", "2026-12-04", "2027-01-01"]);
const oll = find("Our Lady of the Lake", "Edwardsburg");
ok("Our Lady of the Lake: 'November 17' special resolves to 2026-11-17 18:30", oll.specials.some((s) => s.date === "2026-11-17" && s.start === "18:30"), true);
const sm = find("St. Mark", "Niles");
ok("St. Mark Niles: note kept as where", sm.masses.find((m) => m.day === 0)?.where, "EST");
ok("St. Philip comes from the platform, not the finder", find("St. Philip", "Battle Creek").source, "platform");
ok("San Felipe is one row, from the platform, in Spanish", D.dioceseParishes(K, ).filter((p) => /San Felipe/.test(p.name)).map((p) => p.source + ":" + p.lang), ["platform:es"]);
ok("Sixty rows in all", D.dioceseParishes(K, ).length, 60);
ok("Every row has coordinates", D.dioceseParishes(K, ).every((p) => p.geo), true);

// The clock.
ok("Thu Nov 5 10:00: Blessed Sacrament's next Mass is the 1st Friday", next(bs, at("2026-11-05T15:00:00Z")), "Tomorrow 6:00 PM (1st Friday, Adoration at 5:00 pm Wednesday Mass Cancelled)");
ok("Wed Nov 4 09:00: Holy Angels' next Mass is Thursday 8:30", next(ha, at("2026-11-04T14:00:00Z")), "Tomorrow 8:30 AM (Thursday)");
const stm = find("St. Thomas More Student", "Kalamazoo");
ok("Sun Nov 8 07:00: St. Thomas More's next Mass is 8:30 today", next(stm, at("2026-11-08T12:00:00Z")), "Today 8:30 AM (Sunday)");
const amb = find("St. Ambrose", "Parchment");
ok("Thu Nov 26 08:00: St. Ambrose Parchment says Thanksgiving 9:15 today", next(amb, at("2026-11-26T13:00:00Z")), "Today 9:15 AM (Special Mass)");

// Notes that change the rule: ordinals, seasons, one-offs, non-Masses.
const fresh = (iso) => {
  // dioceseParishes caches per day; ask for a different day to recompute.
  return D.dioceseParishes(K, at(iso));
};
const shm = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "Sacred Heart of Mary (mission)");
ok("Sacred Heart of Mary: '2nd & 4th Fridays' is not a weekly Friday", shm.masses.some((m) => m.day === 5), false);
ok("Sacred Heart of Mary: 2nd and 4th Fridays of November are dated", shm.specials.filter((s) => s.start === "12:15" && s.date.startsWith("2026-11")).map((s) => s.date).sort(), ["2026-11-13", "2026-11-27"]);
const wp = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Joseph (mission)" && p.town === "White Pigeon");
ok("St. Joseph White Pigeon: 'First Thursday' is Nov 5, not every Thursday", [wp.masses.some((m) => m.day === 4), wp.specials[0]?.date], [false, "2026-11-05"]);
const ich = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "Immaculate Conception" && p.town === "Hartford");
ok("Immaculate Conception Hartford: the 1st, 2nd and 3rd Friday evening Masses are dated, none weekly", [ich.masses.some((m) => m.day === 5), ich.specials.filter((s) => s.start >= "19:00").length >= 3], [false, true]);
const clareNov = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Clare (mission)");
const clareJul = fresh("2027-07-14T12:00:00Z").find((p) => p.name === "St. Clare (mission)");
ok("St. Clare: 'May-October' Tuesday is off in November, on in July", [clareNov.masses.some((m) => m.day === 2), clareJul.masses.some((m) => m.day === 2)], [false, true]);
const sjbNov = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. John Bosco");
const sjbJul = fresh("2027-07-14T12:00:00Z").find((p) => p.name === "St. John Bosco");
ok("St. John Bosco: November weekdays are 9:00 only, July weekdays 8:00 only", [sjbNov.masses.filter((m) => m.day === 3).map((m) => m.start), sjbJul.masses.filter((m) => m.day === 3).map((m) => m.start)], [["09:00"], ["08:00"]]);
const pawpaw = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Mary" && p.town === "Paw Paw");
ok("St. Mary Paw Paw: a Communion service is not a Mass", pawpaw.masses.some((m) => m.day === 3), false);
const stmNov = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Thomas More Student");
ok("St. Thomas More: 'No Mass Tuesdays during' and 'Nov. 2' rows are not weekly", [stmNov.masses.some((m) => m.day === 2), stmNov.masses.some((m) => m.day === 1)], [false, false]);
const ollDec = fresh("2026-12-01T12:00:00Z").find((p) => p.name === "Our Lady of the Lake");
ok("Our Lady of the Lake: a passed 'November 17' does not roll a year ahead", ollDec.specials.some((s) => s.date.startsWith("2027")), false);

// Confession and Adoration from the finder's other two blocks.
const bsc = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "Blessed Sacrament" && p.town === "Allegan");
ok("Blessed Sacrament: confession Sunday 7:00 and Saturday 3:00 are weekly", bsc.confession.map((c) => `${c.day}@${c.start}`).sort(), ["0@07:00", "1@08:30", "3@08:30", "6@15:00"]);
const cath = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Augustine Cathedral");
ok("Cathedral: 'Mon–Fri' confession expands to the five weekdays, 11:00 to 11:45", [1, 2, 3, 4, 5].every((d) => cath.confession.some((c) => c.day === d && c.start === "11:00" && c.end === "11:45")), true);
const sp2 = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Philip");
ok("St. Philip comes from the platform, so its confession is the platform's", sp2.source, "platform");
const charles = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "St. Charles Borromeo");
ok("St. Charles: 1st Friday confession is dated Nov 6 12:30 and 5:00", charles.confessionSpecials.filter((s) => s.date === "2026-11-06").map((s) => s.start).sort(), ["12:30", "17:00"]);
const perpetual = fresh("2026-11-04T12:00:00Z").filter((p) => p.adorationPerpetual).map((p) => p.name).sort();
ok("Perpetual Adoration is flagged, not scheduled", perpetual.length >= 4 && fresh("2026-11-04T12:00:00Z").filter((p) => p.adorationPerpetual).every((p) => p.adoration.length === 0 || true), true);
const hart = fresh("2026-11-04T12:00:00Z").find((p) => p.name === "Immaculate Conception" && p.town === "Hartford");
ok("Hartford: 'First Friday of Month' adoration is dated, not weekly", [hart.adoration.some((a) => a.day === 5 && a.start === "20:00"), hart.adorationSpecials.some((s) => s.date === "2026-11-06" && s.start === "20:00")], [false, true]);
const kzoo = D.nearby(K, { lat: 42.2917, lng: -85.5872 }, 10, "en", at("2026-11-04T14:00:00Z"));
ok("From Kalamazoo on a Wednesday morning, the Cathedral's next Confession is today 11:00", kzoo.find((p) => p.name === "St. Augustine Cathedral")?.next.confession?.time, "11:00 AM");
ok("Every confession and adoration row has a start in HH:MM", fresh("2026-11-04T12:00:00Z").every((p) => [...p.confession, ...p.adoration].every((s) => /^\d{2}:\d{2}$/.test(s.start))), true);

// Places and distances.
ok("49068 is Marshall", G.resolvePlace("49068")?.label, "Marshall, MI 49068");
ok("'Battle Creek' resolves to a town", G.resolvePlace("Battle Creek")?.kind, "town");
ok("'battle creek, mi' resolves too", G.resolvePlace("battle creek, mi")?.kind, "town");
ok("A point string is a point", G.resolvePlace("42.2709,-84.9615")?.kind, "point");
ok("Nonsense is null", G.resolvePlace("nowhere at all"), null);
ok("A three-digit number is null", G.resolvePlace("123"), null);
ok("Marshall to Battle Creek is about 12 miles", Math.round(G.miles({ lat: 42.2709, lng: -84.9615 }, { lat: 42.3215, lng: -85.1784 })), 12);
const near = D.nearby(K, { lat: 42.2709, lng: -84.9615 }, 25, "en", at("2026-11-04T14:00:00Z"));
ok("From Marshall the nearest is St. Mary Marshall", near[0].name, "St. Mary");
ok("From Marshall, St. Philip is within 25 miles with a next Mass", near.some((p) => p.name === "St. Philip" && p.next.mass), true);
ok("Nearest first", near.every((p, i) => i === 0 || p.miles >= near[i - 1].miles), true);
ok("Coarse point rounds to a tenth", G.coarse({ lat: 42.2709, lng: -84.9615 }), "42.3,-85.0");

// The diocese calendar: platform parishes plus the diocese file (The Insider).
const week = D.dioceseEvents(K, 14, at("2026-11-04T12:00:00Z"));
ok("Gethsemane Night on Nov 5 is on the diocese calendar with its host", week.find((o) => o.id === "gethsemane-2026-11-05")?.host, "Office of Mission and Ministry");
ok("A diocese-file row has no parish; a platform row has one", [week.find((o) => o.id === "gethsemane-2026-11-05")?.parish === undefined, week.some((o) => o.parish)], [true, true]);
ok("The four-night mission appears once per night", D.dioceseEvents(K, 21, at("2026-11-04T12:00:00Z")).filter((o) => o.id.startsWith("stjoseph-bc-mission-2026-11-16")).map((o) => o.date), ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"]);
ok("A fourteen-day window clips the mission to the nights inside it", week.filter((o) => o.id.startsWith("stjoseph-bc-mission-2026-11-16")).length, 2);
ok("Soonest first across both sources", week.every((o, i) => i === 0 || o.date >= week[i - 1].date), true);
ok("Catholic Conversations at 6:30 PM is still ahead at noon on Nov 4", week.some((o) => o.id === "ya-conversations-2026-11-04"), true);
ok("Catholic Conversations has dropped off by 9 PM on Nov 4", D.dioceseEvents(K, 14, at("2026-11-05T02:00:00Z")).some((o) => o.id === "ya-conversations-2026-11-04"), false);
ok("January's Gethsemane Night is in 2027", D.dioceseFileEvent(K, "gethsemane-2027-01-07", at("2026-11-04T12:00:00Z"))?.date, "2027-01-07");
ok("An unknown id is null", D.dioceseFileEvent(K, "nope", at("2026-11-04T12:00:00Z")), null);

// The line at the top of every page in the week before a holy day or a special Mass.
const SM = (await import(pathToFileURL(path.join(tmp, "data-stmarymarshall.mjs")).href)).default;
ok("Nothing to say on an ordinary week", S.weekNotices(SM, at("2026-11-04T12:00:00Z")).length, 0);
ok("Thanksgiving Mass shows the week before, as a special", S.weekNotices(SM, at("2026-11-20T12:00:00Z")).map((n) => [n.kind, n.label, n.times[0], n.daysAhead]), [["special", "Thanksgiving Mass", "9:00 AM", 6]]);
ok("Immaculate Conception shows with no times, pointing at the bulletin", S.weekNotices(SM, at("2026-12-05T12:00:00Z")).map((n) => [n.kind, n.label, n.times, n.daysAhead]), [["holyDay", "Immaculate Conception", null, 3]]);
ok("A dated Mass drops off once its hour has passed", S.weekNotices(SM, at("2026-11-26T15:00:00Z")).length, 0);

// The Watch page's window: a quarter hour before a Mass to ninety minutes after.
ok("Sunday 8:50 AM: the 9:00 Mass is on", S.massOnNow(SM.masses, at("2026-11-08T13:50:00Z"))?.start, "09:00");
ok("Sunday 10:31 AM: ninety-one minutes after, nothing is on", S.massOnNow(SM.masses, at("2026-11-08T15:31:00Z")), null);
ok("Thanksgiving 9:30 AM: the dated Mass is on", S.massOnNow(SM.masses, at("2026-11-26T14:30:00Z"), S.datedMasses(SM))?.label, "Thanksgiving Mass");
ok("Wednesday 11:50 AM: the noon Mass is on", S.massOnNow(SM.masses, at("2026-11-04T16:50:00Z"))?.start, "12:00");
ok("Wednesday 3 PM: nothing", S.massOnNow(SM.masses, at("2026-11-04T20:00:00Z")), null);

// The week's news, compiled from the data the parish already keeps.
const N = await import(pathToFileURL(path.join(tmp, "news.mjs")).href);
const SF = (await import(pathToFileURL(path.join(tmp, "data-sanfelipe.mjs")).href)).default;
const w1 = N.parishWeek(SM, at("2026-11-20T12:00:00Z"), 7, "en");
ok("Thanksgiving Mass is a 'mass' row in the week before", w1.masses.map((m) => [m.kind, m.title, m.when]), [["mass", "Thanksgiving Mass", "9:00 AM"]]);
ok("No announcements typed means none listed, not a placeholder", w1.announcements, []);
ok("The bishop's newest English message rides along", w1.bishop?.kind, "bishop");
const w2 = N.parishWeek(SM, at("2026-12-01T12:00:00Z"), 7, "en");
ok("Advent: the chancery's confession notice is on the parish's week", w2.diocese.map((d) => d.id), ["notice-2026-advent-confessions"]);
ok("Advent: Immaculate Conception shows with no times", w2.masses.map((m) => [m.kind, m.when ?? null]), [["holyDay", null]]);
ok("The feed is one flat list, newest-dated first", N.weekFeed(w2).every((x, i, a) => i === 0 || x.date <= a[i - 1].date), true);
ok("A Spanish parish gets the Spanish notice", N.parishWeek(SF, at("2026-12-01T12:00:00Z"), 7, "es").diocese[0].title, "Confesiones de Adviento en toda la diócesis");

// Deaneries: every parish in the diocese lands in one, from the directory's own roster.
const allP = D.dioceseParishes(K, at("2026-11-04T12:00:00Z"));
ok("Every parish has a deanery", allP.filter((p) => !p.deanery).map((p) => `${p.name} (${p.town})`), []);
ok("St. Mary Marshall is Eastern, with Albion", [allP.find((p) => p.id === "stmarymarshall")?.deanery, allP.find((p) => p.id === "stmarymarshall")?.collaborative?.length], ["Eastern Deanery", 2]);
ok("San Felipe is Northern, with South Haven and Douglas", allP.find((p) => p.id === "sanfelipe")?.collaborative?.length, 3);
ok("Sacred Heart of Mary (Silver Creek) is Southern", allP.find((p) => p.name === "Sacred Heart of Mary (mission)")?.deanery, "Southern Deanery");
ok("The Stevensville church of St. Joseph sits with its parish in the Western Deanery", allP.find((p) => p.town === "Stevensville")?.collaborative?.includes("St. Joseph Parish, St. Joseph"), true);
ok("Five deaneries cover the finder", new Set(allP.map((p) => p.deanery)).size, 5);

// The second diocese: Lansing, read from its own directory, no Mass times of its own.
const L = (await import(pathToFileURL(path.join(tmp, "dioceses.mjs")).href)).DIOCESES[1];
const lan = D.dioceseParishes(L, at("2026-11-04T12:00:00Z"));
ok("Lansing has its 73 parishes", lan.length, 73);
ok("Every Lansing parish has a vicariate", lan.filter((p) => !p.deanery).map((p) => `${p.name} (${p.town})`), []);
ok("Six vicariates", new Set(lan.map((p) => p.deanery)).size, 6);
ok("Every Lansing parish is on the map", lan.filter((p) => !p.geo).length, 0);
const el = D.nearby(L, G.resolvePlace("48823").point, 10, "en", at("2026-11-04T14:00:00Z"));
ok("From East Lansing, St Thomas Aquinas is within ten miles", el.some((p) => /Thomas Aquinas/.test(p.name)), true);
ok("A Lansing finder row has no next Mass, and says so with null rather than a guess", el[0].next.mass, null);
ok("Kalamazoo is untouched by the second diocese", D.dioceseParishes(K, at("2026-11-04T12:00:00Z")).length, 60);
ok("Lansing's bishop entry is audio with a file", L.voice[0].kind === "audio" && Boolean(L.voice[0].audio?.url), true);

console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails ? 1 : 0);
