/**
 * Date logic, exercised at fixed instants. Run against the TS sources via
 * a tiny loader: `node tools/logic-tests.mjs`. Prints each case; exits 1
 * on any failure. Instants are UTC; the expectation is what a parishioner
 * in Marshall would see at that moment.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
// Strip TS types the cheap way with the TypeScript compiler already in node_modules.
const ts = (await import(pathToFileURL(path.join(ROOT, "node_modules/typescript/lib/typescript.js")).href)).default;
const tmp = path.join(ROOT, ".next-logic-tests");
fs.mkdirSync(tmp, { recursive: true });
for (const f of ["site", "schedule", "events", "ics"]) {
  const src = fs.readFileSync(path.join(ROOT, "lib", f + ".ts"), "utf8").replace(/from "@\/lib\/(\w+)"/g, 'from "./$1.mjs"');
  const out = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(tmp, f + ".mjs"), out);
}
const S = await import(pathToFileURL(path.join(tmp, "schedule.mjs")).href);
const E = await import(pathToFileURL(path.join(tmp, "events.mjs")).href);
const I = await import(pathToFileURL(path.join(tmp, "ics.mjs")).href);
let fails = 0;
const t = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fails++; console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${JSON.stringify(got)}${ok ? "" : " want " + JSON.stringify(want)}`); };
const at = (iso) => S.localNow(new Date(iso));
// Tue 2026-10-27 15:30 Detroit = 19:30Z (EDT)
let n = at("2026-10-27T19:30:00Z"); t("localNow Tue 3:30pm", [n.iso, n.weekday, n.minutes], ["2026-10-27", 2, 930]);
t("next mass Tue 3:30pm", (({ label, time, daysAhead }) => [label, time, daysAhead])(S.nextService(S.MASSES, n)), ["Tuesday", "4:00 PM", 0]);
n = at("2026-10-27T20:01:00Z"); t("next mass Tue 4:01pm -> Wed noon", (({ time, daysAhead }) => [time, daysAhead])(S.nextService(S.MASSES, n)), ["12:00 PM", 1]);
// Midnight Detroit: 2026-10-28T04:00Z is 00:00 EDT Wed
n = at("2026-10-28T04:00:00Z"); t("localNow midnight", [n.iso, n.weekday, n.minutes], ["2026-10-28", 3, 0]);
// Sunday 11:01am after last Sunday Mass -> Tue 4pm, 2 days ahead
n = at("2026-11-01T16:01:00Z"); // Nov 2 2026 is All Souls, a special Mass at 7 PM, so it comes before Tuesday.
t("Sun 11:01 -> All Souls Mon", (({ label, time, daysAhead }) => [label, time, daysAhead])(S.nextService(S.MASSES, n)), ["All Souls’ Day Mass", "7:00 PM", 1]);
n = at("2026-11-08T16:01:00Z"); t("Sun 11:01 (plain week) -> Tue", (({ dayName, time, daysAhead }) => [dayName, time, daysAhead])(S.nextService(S.MASSES, n)), ["Tuesday", "4:00 PM", 2]);
// DST ends 2026-11-01 02:00. Sun 2026-11-01 10:30 EST = 15:30Z -> 11:00 Mass today
n = at("2026-11-01T15:30:00Z"); t("DST-end Sunday 10:30 -> 11:00 today", (({ time, daysAhead }) => [time, daysAhead])(S.nextService(S.MASSES, n)), ["11:00 AM", 0]);
// Special Mass: All Souls Nov 2 7pm. Mon Nov 2 18:00 EST = 23:00Z -> special today beats Tue
n = at("2026-11-02T23:00:00Z"); t("special All Souls today", (({ label, time, daysAhead }) => [label, time, daysAhead])(S.nextService(S.MASSES, n)), ["All Souls’ Day Mass", "7:00 PM", 0]);
n = at("2026-11-03T01:00:00Z"); t("after All Souls 8pm -> Tue 4pm", (({ label, daysAhead }) => [label, daysAhead])(S.nextService(S.MASSES, n)), ["Tuesday", 1]);
t("upcomingSpecials on Nov 3 drops Nov 2", S.upcomingSpecials(at("2026-11-03T12:00:00Z")).map((s) => s.date), ["2026-11-26"]);
// Confession: Sat 3:30. Sat 2026-10-31 16:31 EDT -> next Sat, 7 days
n = at("2026-10-31T20:31:00Z"); t("confession after 4:30 Sat -> 7 days", S.nextService(S.CONFESSION, n, []).daysAhead, 7);
// addDays across DST end and year end
t("addDays over DST end", S.addDays("2026-10-31", 2), "2026-11-02");
t("addDays year end", S.addDays("2026-12-31", 1), "2027-01-01");
// Events: Tue Oct 27 at 17:30 Detroit (21:30Z): RE 4-5pm ended, Bible study 7pm remains
n = at("2026-10-27T21:30:00Z"); let occ = E.occurrences(n, 1); t("today ended events dropped", occ.map((o) => o.title), ["Bible Study"]);
// Exdate: Tue Nov 3 RE grades 6-8 skipped; Elections and Adult Choir (moved) present
n = at("2026-11-03T12:00:00Z"); occ = E.occurrences(n, 1); t("Nov 3 exdate + once rules", occ.map((o) => o.title), ["Elections", "Adult Choir Rehearsal", "Bible Study"]);
// Monthly: 2nd Monday Nov = Nov 9, Dec = Dec 14
n = at("2026-11-04T12:00:00Z"); occ = E.occurrences(n, 45).filter((o) => o.title.startsWith("Knights")); t("Knights 2nd Mondays", occ.map((o) => o.date), ["2026-11-09", "2026-12-14"]);
// until: Adult choir weekly ends Nov 19; none on Nov 25 (Wed)
n = at("2026-11-20T12:00:00Z"); occ = E.occurrences(n, 10).filter((o) => o.title === "Adult Choir Rehearsal"); t("adult choir after until", occ.length, 0);
// from: youth choir second block starts Dec 2, none Nov 25
n = at("2026-11-21T12:00:00Z"); occ = E.occurrences(n, 12).filter((o) => o.title.startsWith("Youth Choir")); t("youth choir from Dec 2", occ.map((o) => o.date), ["2026-12-02"]);
// Holy Saturday 2027-03-27 confession exdate
n = at("2027-03-27T12:00:00Z"); occ = E.occurrences(n, 1).filter((o) => o.title.startsWith("Confessions")); t("Holy Saturday 2027 skipped", occ.length, 0);
// All-day event sorts and ICS DTEND next day
n = at("2027-04-24T12:00:00Z"); occ = E.occurrences(n, 3).filter((o) => o.title === "Family Catechesis Event"); t("all-day Apr 25", occ.map((o) => [o.date, o.start ?? null]), [["2027-04-25", null]]);
const id = I.occurrenceId(occ[0]); const single = I.singleEvent(id); t("all-day ICS", [/DTSTART;VALUE=DATE:20270425/.test(single), /DTEND;VALUE=DATE:20270426/.test(single)], [true, true]);
// ICS folding on multibyte
const feed = I.calendarFeed(); const lines = feed.split("\r\n"); t("ICS no line over 75 octets", lines.filter((l) => Buffer.byteLength(l) > 75).length, 0);
t("ICS UIDs unique", new Set(lines.filter((l) => l.startsWith("UID:"))).size === lines.filter((l) => l.startsWith("UID:")).length, true);
// Holy days upcoming on Dec 9 drops Dec 8
t("holy days after Dec 8", S.upcomingHolyDays(at("2026-12-09T12:00:00Z")).map((h) => h.date)[0], "2026-12-25");
// fmtTime edge
t("fmtTime noon/midnight", [S.fmtTime("12:00"), S.fmtTime("00:05")], ["12:00 PM", "12:05 AM"]);
// In progress: Sat 2026-10-31 16:00 EDT (20:00Z) is inside the 3:30 to 4:30 confession hour
n = at("2026-10-31T20:00:00Z"); let c = S.nextService(S.CONFESSION, n, []); t("confession in progress", [S.whenWord(c), c.time], ["Now,", "until 4:30 PM"]);
n = at("2026-10-31T20:31:00Z"); c = S.nextService(S.CONFESSION, n, []); t("confession just over -> Next Saturday", S.whenWord(c), "Next Saturday");
// Holy day Mass times reach the tile once supplied
const hd = S.datedMasses().concat([{ date: "2026-12-08", start: "19:00", label: "Immaculate Conception" }]);
// Tue Dec 8 at 5 PM EST: the 4 PM Tuesday Mass is past, the 7 PM holy day Mass is next
n = at("2026-12-08T22:00:00Z"); t("holy day in tile", (({ label, daysAhead }) => [label, daysAhead])(S.nextService(S.MASSES, n, hd)), ["Immaculate Conception", 0]);
// Coming-up list drops All Souls after 7 PM the same day
n = at("2026-11-03T01:00:00Z"); t("specials drop after time today", S.upcomingSpecials(n).map((s) => s.date), ["2026-11-26"]);
// Add-to-calendar still resolves after the event has ended today
const ended = I.singleEvent("2026-10-27-1600-religious-education-grades-6-to-8"); t("single event after end resolves", ended ? /BEGIN:VEVENT/.test(ended) : false, true);
// Women’s Ministry 4th Monday: Nov 23, Dec 28
n = at("2026-11-04T12:00:00Z"); occ = E.occurrences(n, 60).filter((o) => o.title.startsWith("Women")); t("women 4th Mondays", occ.map((o) => [o.date, o.end ?? null]), [["2026-11-23", null], ["2026-12-28", null]]);
// Feed reaches back: an event from last week is in it
const past = S.addDays(S.localNow().iso, -7); t("feed includes last week", I.calendarFeed().includes("DTSTART;TZID=America/Detroit:" + past.replace(/-/g, "")) || I.calendarFeed().includes(past.replace(/-/g, "")), true);
t("massTimesSentence", S.massTimesSentence(), "Saturday 5:00 PM, Sunday 9:00 and 11:00 AM, Tuesday 4:00 PM, Wednesday 12:00 PM, Friday 7:30 AM");
fs.rmSync(tmp, { recursive: true, force: true });
console.log(fails ? `\n${fails} failure(s)` : "\nall passed");
process.exit(fails ? 1 : 0);
