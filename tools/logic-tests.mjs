/**
 * Date logic, exercised at fixed instants against the real parish data.
 * Run against the TS sources via a tiny loader: `node tools/logic-tests.mjs`.
 * Prints each case; exits 1 on any failure. Instants are UTC; the
 * expectation is what a parishioner in Michigan would see at that moment.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// Strip TS types the cheap way with the TypeScript compiler already in node_modules.
const ts = (await import(pathToFileURL(path.join(ROOT, "node_modules/typescript/lib/typescript.js")).href)).default;
const tmp = path.join(ROOT, ".next-logic-tests");
fs.mkdirSync(tmp, { recursive: true });
const transpile = (file, out) => {
  const src = fs.readFileSync(file, "utf8").replace(/from "@\/lib\/(\w+)"/g, 'from "./$1.mjs"');
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false } }).outputText;
  fs.writeFileSync(path.join(tmp, out), js);
};
for (const f of ["i18n", "schedule", "events", "ics", "sentences"]) transpile(path.join(ROOT, "lib", f + ".ts"), f + ".mjs");
for (const slug of ["stmarymarshall", "stphilipbc", "sanfelipe"]) transpile(path.join(ROOT, "parishes", slug, "data.ts"), `data-${slug}.mjs`);
const S = await import(pathToFileURL(path.join(tmp, "schedule.mjs")).href);
const E = await import(pathToFileURL(path.join(tmp, "events.mjs")).href);
const I = await import(pathToFileURL(path.join(tmp, "ics.mjs")).href);
const T = await import(pathToFileURL(path.join(tmp, "sentences.mjs")).href);
const SM = (await import(pathToFileURL(path.join(tmp, "data-stmarymarshall.mjs")).href)).default;
const SP = (await import(pathToFileURL(path.join(tmp, "data-stphilipbc.mjs")).href)).default;
const SF = (await import(pathToFileURL(path.join(tmp, "data-sanfelipe.mjs")).href)).default;

let fails = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${JSON.stringify(got)}${ok ? "" : " want " + JSON.stringify(want)}`);
};
const at = (iso) => S.localNow("America/Detroit", new Date(iso));
const pick = (n, ...keys) => (n ? keys.map((k) => n[k]) : null);

// ---- St. Mary, Marshall --------------------------------------------------
const smSpecials = S.datedMasses(SM);
// Tue 2026-10-27 15:30 Detroit = 19:30Z (EDT)
let n = at("2026-10-27T19:30:00Z");
t("localNow Tue 3:30pm", [n.iso, n.weekday, n.minutes], ["2026-10-27", 2, 930]);
t("next mass Tue 3:30pm", pick(S.nextService(SM.masses, n, smSpecials), "label", "time", "daysAhead"), ["Tuesday", "4:00 PM", 0]);
n = at("2026-10-27T20:01:00Z");
t("next mass Tue 4:01pm -> Wed noon", pick(S.nextService(SM.masses, n, smSpecials), "time", "daysAhead"), ["12:00 PM", 1]);
// Midnight Detroit: 2026-10-28T04:00Z is 00:00 EDT Wed
n = at("2026-10-28T04:00:00Z");
t("localNow midnight", [n.iso, n.weekday, n.minutes], ["2026-10-28", 3, 0]);
// Sunday 11:01am after the last Sunday Mass. Nov 2 2026 is All Souls, a special Mass at 7 PM, so it comes before Tuesday.
n = at("2026-11-01T16:01:00Z");
t("Sun 11:01 -> All Souls Mon", pick(S.nextService(SM.masses, n, smSpecials), "label", "time", "daysAhead"), ["All Souls’ Day Mass", "7:00 PM", 1]);
n = at("2026-11-08T16:01:00Z");
t("Sun 11:01 (plain week) -> Tue", pick(S.nextService(SM.masses, n, smSpecials), "dayName", "time", "daysAhead"), ["Tuesday", "4:00 PM", 2]);
// DST ends 2026-11-01 02:00. Sun 2026-11-01 10:30 EST = 15:30Z -> 11:00 Mass today
n = at("2026-11-01T15:30:00Z");
t("DST-end Sunday 10:30 -> 11:00 today", pick(S.nextService(SM.masses, n, smSpecials), "time", "daysAhead"), ["11:00 AM", 0]);
n = at("2026-11-02T23:00:00Z");
t("special All Souls today", pick(S.nextService(SM.masses, n, smSpecials), "label", "time", "daysAhead"), ["All Souls’ Day Mass", "7:00 PM", 0]);
n = at("2026-11-03T01:00:00Z");
t("after All Souls 8pm -> Tue 4pm", pick(S.nextService(SM.masses, n, smSpecials), "label", "daysAhead"), ["Tuesday", 1]);
t("upcomingSpecials on Nov 3 drops Nov 2", S.upcomingSpecials(SM, at("2026-11-03T12:00:00Z")).map((s) => s.date), ["2026-11-26"]);
// Saturday 3:45 PM EDT = 19:45Z: confession in progress -> "Now, until 4:30 PM"
n = at("2026-10-31T19:45:00Z");
const c = S.nextService(SM.confession, n);
t("confession in progress", [S.whenWord(c), c.time], ["Now,", "until 4:30 PM"]);
t("whenWord a week out", S.whenWord({ daysAhead: 7, dayName: "Saturday" }), "Next Saturday");
t("massTimesSentence", S.massTimesSentence(SM.masses), "Saturday 5:00 PM, Sunday 9:00 and 11:00 AM, Tuesday 4:00 PM, Wednesday 12:00 PM, Friday 7:30 AM");
t("upcomingHolyDays keeps today until midnight", S.upcomingHolyDays(SM, at("2026-12-08T23:00:00Z")).map((h) => h.date)[0], "2026-12-08");

// Events: Tue 2026-11-03 is an exdate for grades 6 to 8; the choir moved to Tuesday that week.
let occ = E.occurrences(SM.events, at("2026-11-03T12:00:00Z"), 1);
t("RE 6-8 exdate Nov 3", occ.some((o) => o.title.startsWith("Religious Education, Grades 6")), false);
t("choir once Nov 3", occ.filter((o) => o.title === "Adult Choir Rehearsal").map((o) => o.start), ["18:45"]);
occ = E.occurrences(SM.events, at("2026-11-09T12:00:00Z"), 1);
t("KofC 2nd Monday Nov 9", occ.some((o) => o.title.startsWith("Knights")), true);
t("Elections once", E.occurrences(SM.events, at("2026-11-03T12:00:00Z"), 1).find((o) => o.title === "Elections")?.end, "20:00");
t("sorted within a day", E.occurrences(SM.events, at("2026-11-03T12:00:00Z"), 1).map((o) => o.start), ["08:00", "18:45", "19:00"]);
t("fmtRange all day", E.fmtRange({ title: "x" }), "All day");
t("fmtLongDate", E.fmtLongDate("2026-11-03"), "Tuesday, November 3");

// ICS
const feed = I.calendarFeed(SM);
t("ics CRLF only", /\r\n/.test(feed) && !/[^\r]\n/.test(feed), true);
t("ics no long lines", feed.split("\r\n").every((l) => Buffer.byteLength(l, "utf8") <= 75), true);
t("ics has events", (feed.match(/BEGIN:VEVENT/g) || []).length > 20, true);
t("ics uid domain", /@stmarymarshall\.org/.test(feed), true);
const first = E.occurrences(SM.events, at("2026-11-03T12:00:00Z"), 1)[0];
const id = I.occurrenceId(first);
t("single event resolves", (I.singleEvent(SM, id) || "").includes("BEGIN:VEVENT"), true);
t("single event unknown", I.singleEvent(SM, "nope"), null);

// ---- St. Philip, Battle Creek: adoration around the clock --------------------
// Thursday 2026-11-05 14:00 EST = 19:00Z: adoration in progress since Wednesday
n = at("2026-11-05T19:00:00Z");
const a = S.nextService(SP.adoration, n);
t("St. Philip adoration Thursday", [S.whenWord(a), a.label], ["Now,", "Thursday, all day"]);
// Sunday 2026-11-08 08:20 EST = 13:20Z: next confession 10:45 today, next Mass 9:00
n = at("2026-11-08T13:20:00Z");
t("St. Philip Sunday confession", pick(S.nextService(SP.confession, n), "time", "daysAhead"), ["10:45 AM", 0]);
t("St. Philip Sunday mass", pick(S.nextService(SP.masses, n, S.datedMasses(SP)), "time", "label"), ["9:00 AM", "Sunday"]);
t("St. Philip 3rd Tuesday KofC", E.occurrences(SP.events, at("2026-11-17T12:00:00Z"), 1).some((o) => o.title.startsWith("Knights of Columbus Council")), true);
t("St. Philip RE until May", E.occurrences(SP.events, at("2027-05-12T12:00:00Z"), 1).some((o) => o.title === "Religious Education"), false);

// ---- San Felipe, Fennville: Spanish --------------------------------------
// Thursday 2026-11-05 18:35 EST = 23:35Z: Mass in progress? No end time, so next is Sunday.
n = at("2026-11-05T23:35:00Z");
const m = S.nextService(SF.masses, n, [], "es");
t("San Felipe after Thursday Mass -> Sunday", [S.whenWord(m, "es"), m.time, m.label], ["Domingo", "12:30 PM", "Domingo"]);
n = at("2026-11-04T23:35:00Z");
t("San Felipe Wednesday -> Mañana", S.whenWord(S.nextService(SF.masses, n, [], "es"), "es"), "Mañana");
t("San Felipe massTimesSentence es", S.massTimesSentence(SF.masses, "es"), "Domingo 12:30 PM, Jueves 6:30 PM");
t("San Felipe fmtDate es", S.fmtDate("2026-12-08", true, "es"), "8 de diciembre de 2026");
t("San Felipe fmtLongDate es", E.fmtLongDate("2026-11-15", "es"), "domingo, 15 de noviembre");
t("San Felipe 3rd Sunday adoration", E.occurrences(SF.events, at("2026-11-15T12:00:00Z"), 1).map((o) => o.title), ["Adoración al Santísimo"]);
t("San Felipe not 2nd Sunday", E.occurrences(SF.events, at("2026-11-08T12:00:00Z"), 1).length, 0);
t("whenIsMass es", T.whenIsMass(SF, "es"), "Domingo 12:30 PM, Jueves 6:30 PM. Las confesiones son el jueves de 5:00 PM, con adoración a la misma hora.");
t("confessionSentence en", T.confessionSentence(SM, "en"), "Confession Saturday 3:30 PM to 4:30 PM. ");
const sfFeed = I.calendarFeed(SF);
t("San Felipe ics uid domain", /@sanfelipe-fennville\.org/.test(sfFeed), true);

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
