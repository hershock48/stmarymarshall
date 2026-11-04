# Narthex (St. Mary Marshall, St. Philip Battle Creek, San Felipe Fennville)

Narthex is the parish and diocese platform, built by Glazed Web; the plan and
the order of work are in `docs/narthex-plan.md`. One Next.js deployment that
serves a parish website per domain. It began in
October 2026 as the St. Mary Catholic Church rebuild (Marshall, Michigan,
replacing the parish's eCatholic site) and became a platform on
2026-11-02 so the same code could carry every parish in the Diocese of
Kalamazoo: the pilot for the diocese pitch at kalamazoo.glazedweb.com.
Next.js 16 App Router, React 19, Tailwind 4 (through the Turbopack loader),
TypeScript, Vercel. No page builder, no plugin, nothing a parish pays a
subscription for.

```bash
npm install
npm run build && npm start -- -p 4490     # production, which is what gets audited
npm run dev                                # for editing only
node tools/logic-tests.mjs                 # date logic against all three parishes
node tools/diocese-tests.mjs               # the finder, the places, the distances
```

## How a parish gets served

The parish is chosen per request from the Host header (`lib/parish.ts`).
`parishes/registry.json` lists every parish's hosts and pitch host for
`next.config.ts`, which cannot import the TypeScript data; the data itself
is `parishes/<slug>/data.ts`. An unknown host (a Vercel preview URL) gets
the registry default, St. Mary.

| Host | Serves |
|---|---|
| `stmarymarshall.org` (once DNS moves) | St. Mary, indexable |
| `stmarymarshall.glazedweb.com` | The letter to Fr. Craig at `/`, the site at `/demo`, all noindex |
| `stphilip.glazedweb.com`, `sanfelipe.glazedweb.com` | The St. Philip and San Felipe demos at `/` and `/demo`, noindex (no letter yet) |
| `kalamazoo.glazedweb.com` | The diocese letter at `/`; the diocesan feed at `/diocese/mass-times.json` |
| any host, `/diocese` | Every parish on one page (address, Mass, Confession, Adoration, site and calendar links): the readable twin of the JSON feed, dressed in the host's parish |
| any host, `/diocese/near` | Mass near you: a zip, a town or `lat,lng` from the phone, every parish within 10, 25 or 50 miles, nearest first, with the next Mass, Confession and Adoration from the clock. All sixty parishes and missions: the platform's from their data, the rest from `dioceses/kalamazoo/finder.json` |
| any host, `/diocese/events`, `/diocese/groups` | Every platform parish's calendar for 14 days by kind and town; every ministry and formation group with its contact |
| any host, `/diocese/security` | What we store, what we do not, where it runs: the security and data page a chancellor can hand to IT. It describes this code; change it in the same commit as the behavior it describes |
| any host, `/diocese/office` | The chancery view, behind `DIOCESE_PASSCODE`: each site's freshness and unconfirmed facts from the data, the finder's coverage, and (with `DATABASE_URL`) pages served, finder searches, forms sent and Give taps as counts |
| `stmarymarshall.vercel.app` | The default parish, noindex |

Every page calls `getParish()` and renders from that parish's data, so every
route is dynamic. A parish not yet `live` is noindex on every host.
`PARISH_DEFAULT=<slug>` makes a local server answer as that parish on
127.0.0.1 (`PARISH_DEFAULT=sanfelipe npm start -- -p 4493`), which is how
the auditor, which takes a base URL and not a host, runs against each one.

`proxy.ts` runs at the edge for two things Next 16.4 does not do on its
own: a letter is served only on its own pitch host (any other host gets a
real 404), and a one-segment path the parish does not have (`lib/paths.ts`
`knowsPath`: a San Felipe `/bulletin`, a typo) is rewritten to an unmatched
route so the 404 is server-rendered. `notFound()` thrown from a matched
dynamic segment returns an empty client-rendered body in this Next version
(vercel/next.js #98954), which is why the rewrite exists.

## The diocese layer

A diocese is a folder, `dioceses/<slug>/`, with a `config.ts` that gathers
its name in both languages, site, clock, hosts, bishop, the finder read from
the diocese's own page (`finder.json`), the chancery's dates (`events.ts`)
and notices (`notices.ts`), the bishop's recordings (`voice.ts`) and the
deanery roster (`deaneries.ts`); `dioceses/index.ts` lists them and
`parishes/registry.json` repeats each one's hosts for next.config.ts. A
parish names its diocese by slug in its data.ts. Nothing in a page names a
diocese: `getDiocese()` answers from the host (a diocese's own host or
letter host, else the host's parish's diocese). Two today: Kalamazoo
(eCatholic Parish Finder, read by `tools/finder-import.mjs`) and Lansing
(a Drupal directory with no Mass times, read by `tools/lansing-import.mjs`,
which also writes `vicariates.json` for the roster; its finder rows show
the parish, address, phone and site, and a Nominatim miss lands on the zip
centroid from `dioceses/zips-mi.json`, marked `source: "zip"`).

`lib/diocese.ts` joins the three platform parishes with the other
fifty-seven read from the diocese's own Parish Finder. `node
tools/finder-import.mjs <saved parishfinder.html> dioceses/kalamazoo/finder.json`
reads that page in a browser (fetch it with curl first; `finder.json` records
the date) and geocodes each address through Nominatim once, one request a
second; a parish's `finderId` in its data.ts replaces its finder row the
day it joins. The finder keeps three blocks per parish, Mass, Confession
and Adoration, and all three are read; a note that carries the real rule
("2nd & 4th Fridays", "May-October", "Communion Service Only") becomes
dated rows, a seasonal gate, or nothing, and Perpetual Adoration is a flag
rather than a time. Distances and the
zip lookup are offline (`lib/geo.ts`, `dioceses/zips-mi.json` from
GeoNames). Every parish site shows its three nearest parishes on the Mass
times page (`components/NearbyStrip.tsx`) and the chancery's notices
(`dioceses/kalamazoo/notices.ts`) at the top of its home page unless
`diocesanNotices: false`.

Every response carries the headers listed on that page (`next.config.ts`:
nosniff, referrer policy, a permissions policy that allows geolocation
only for the finder, frame-ancestors self; HSTS is Vercel's). The Mass
times page links a parish's livestream as "Watch Mass online" when
`livestream` is set, and its "find a Mass nearby" link goes to the
diocese's own finder from that church instead of eCatholic's FindAMass.

The layer has its own host, `registry.dioceseHost` (today
finder.kalamazoo.glazedweb.com): the finder at `/`, the diocese pages under
`/diocese`, the diocese's own header and footer (`components/DioceseChrome.tsx`)
and no parish anywhere (proxy.ts sends parish paths there to the 404). The
finder may be framed by diokzoo.org and by nothing else (next.config.ts);
every other page may be framed by no one. `DIOCESE_DEFAULT=kalamazoo npm start` (or `=1` for the first diocese)
makes a local server answer as that host so the auditor can run against
it. Every finder card says when the Parish Finder was read and carries
"Wrong time? Tell us" (`/diocese/report`, `/api/report`, delivered to
`DIOCESE_MAIL_TO` or `MAIL_TO`, always logged). `.github/workflows/finder-refresh.yml`
re-reads the Parish Finder every Monday with `tools/finder-import.mjs <url>`,
which refuses a parse shorter than ninety percent of the last one, runs the
structural tests only (`node tools/diocese-tests.mjs --structural`; the dated content pins would fail the week the diocese removes a passed Mass), and commits `finder.json` only when something other than its read date changed.

`/diocese/events` joins the platform parishes' calendars with
`dioceses/kalamazoo/events.ts`, the chancery's and the other parishes' dates
typed from the diocese's weekly email (The Insider), and `/diocese/events.ics`
is the whole diocese as one subscription. `/diocese/voice` is the bishop's
voice: `dioceses/kalamazoo/voice.ts` lists the recordings the diocese has
published, newest first, every parish home page carries the newest one
(`components/BishopsVoice.tsx`, off with `bishopsVoice: false`),
`/diocese/voice.xml` is the same list as RSS, and the page's tail reads the
diocese's YouTube channel feed, cached an hour (`lib/voice.ts`).

`/watch` on a parish is schedule-aware (`lib/schedule.ts massOnNow`: a
quarter hour before a Mass to ninety minutes after): the player then, the
next Mass otherwise, so nobody meets an offline player. The source is
whatever the parish has (`lib/stream.ts`): a Cloudflare Stream live input
when `STREAM_CUSTOMER_CODE` is set, else the YouTube channel's live embed
(`youtubeChannelId`), else the Facebook page as a link. A parish with none
has no `/watch`. `/diocese/watch` lists every streaming parish with what is
on now. `components/HolyDayNotice.tsx` is the line at the top of every
parish page in the week before a holy day or a dated Mass, from the same
`holyDays` and `specialMasses` the Mass times page uses.

`dioceses/kalamazoo/deaneries.ts` holds the five deaneries and their
collaboratives as the diocese's own directory prints them (December 2025);
`deaneryOf` matches every finder row, the test fails if one is left out,
the finder cards say the deanery and `/diocese/events` filters by it.

The week's news is compiled, not typed (`lib/news.ts`): what the office
wrote (`announcements` on the parish, each with a run window and an optional
Spanish block, `diocesan: true` to offer it to the diocese), the dated Masses
and holy days that differ from the usual week, the calendar, the chancery's
notices and the bishop's newest message. One function feeds `/news`,
`/news.xml` (RSS, for Flocknote or any tool that turns a feed into an
email), `/bulletin-insert` (the same rows laid out for a half sheet; print
to PDF on bulletin day) and `/diocese/insider` with `/diocese/insider.xml`,
the diocese's weekly digest from notices, the bishop, the parishes' offered
announcements and the next two weeks across the diocese. Nothing is keyed
twice. `tools/finder-compare.mjs` takes the two phone screenshots of the
finders that the diocese letter shows side by side.

Counting (`lib/tally.ts`) is per day, host, kind and key, with no visitor
in it: a page served by path (the proxy passes the path as `x-path`), a
finder search by a point rounded to about seven miles plus the result
count, a form sent by kind and parish, a Give tap by parish (the Give button
leaves through `/give/out`). It needs `DATABASE_URL` (Neon) and
`db/tally.sql` applied once; without them every call is a no-op and the
chancery view says counting has not started. The chancery view's passcode is
`DIOCESE_PASSCODE`; unset, the page is closed.

## Where things live

Facts live in one place each. Change the data file, not the page.

| What | File |
|---|---|
| Everything about one parish: contact, schedule, events, staff, sections, giving, photos | `parishes/<slug>/data.ts` |
| The shape of that file, with the rules | `lib/types.ts` |
| Hosts and pitch hosts, for routing | `parishes/registry.json` |
| Every word the platform says itself, in English and Spanish | `lib/i18n.ts` |
| Registration form fields; Mass intention and prayer request fields | `lib/register.ts`, `lib/requests.ts` (Spanish labels inside) |
| Next-Mass logic, holy days, time formatting | `lib/schedule.ts` |
| The calendar expander (weekly, monthly, once, with exceptions) | `lib/events.ts` |
| The iCalendar feed, per parish, at `/calendar.ics` | `lib/ics.ts` |
| The diocesan feed of every parish's schedule | `app/diocese/mass-times.json/route.ts` |
| A parish's own extra pages (San Felipe's prayers) | `pages` in its data, rendered by `app/[page]/page.tsx` |
| Photos, PDFs, icons, link card, per parish | `public/parishes/<slug>/` |
| Icons and the link card, generated from the data | `node tools/icons.mjs <slug>` |
| The letters | `public/pitch/<slug>/index.html`, `public/pitch/diocese/index.html` |

Adding a parish: a `data.ts`, a row in the registry, an import in
`lib/parish.ts`, photos under `public/parishes/<slug>/img`, then
`node tools/icons.mjs <slug>`. The pages, forms, feed, sitemap, manifest and
structured data follow from the data. A Spanish parish sets `lang: "es"`
and every word the platform says comes out in Spanish; the parish's own
words are whatever its data says.

## How the pages work

- **Next Mass, Next Confession, Next Adoration** are computed on the parish's
  clock at request time. A service with an end time that is in progress says
  "Now, until 4:30 PM"; St. Philip's adoration chapel does that from Wednesday
  morning to Saturday morning because its four rows carry end times.
- **The calendar** is data the parish owns, transcribed from its old eCatholic
  feed with exceptions. Six weeks on `/events`, filtered by kind; ninety days
  in `/calendar.ics`, expanded into plain VEVENTs tagged with the parish's
  zone; `?e=<id>` for one event.
- **The bulletin** (`/bulletin`) exists only for a parish with a DiscoverMass
  URL; `lib/bulletins.ts` reads the dated links and caches six hours. A
  remote source: verify on the deployment.
- **Give** (`/give`) exists only for a parish with a giving URL or extra
  funds; San Felipe has neither, so the page 404s and the nav omits it.
  Giving never moves: Vanco stays Vanco, OSV stays OSV.
- **Forms** post to `/api/register` and `/api/request` with three honest
  outcomes (sent, unconfigured, failed) and go to the parish's `mailTo`,
  falling back to `MAIL_TO`. The demo parishes set no `mailTo`, so no real
  office receives a demo submission.
- **New here?** answers four questions from the data and whatever the parish
  adds in `newHere`.
- **Today's readings** is a computed USCCB link, Spanish first on a Spanish
  parish.

## Checks

`node tools/logic-tests.mjs` (42 cases over all three parishes, Spanish
included) before any change to `lib/schedule.ts`, `lib/events.ts`,
`lib/ics.ts` or `lib/sentences.ts`; `node tools/diocese-tests.mjs` (27
cases: the finder's panel conversion, first Fridays and dated Masses at
fixed instants, the place lookup, distances) before any change to
`lib/diocese.ts`, `lib/geo.ts` or `tools/finder-import.mjs`. Then, against the production server on
4490: the glaze auditor, `width-check.mjs`, `perf-check.mjs`,
`node tools/ux-check.mjs`, and `node tools/render.mjs [--host <parish
domain>] --prefix <xx->` to screenshot every route of one parish for a look
(the host is mapped to 127.0.0.1 inside Chromium, which will not send a
forged Host header). `node tools/render-letter.mjs --host
kalamazoo.glazedweb.com` renders a letter through the platform so its
images resolve.

2026-11-02, after the platform refactor: 13 routes, zero axe violations at
320, 390, 768 and 1440 (after the home link's accessible name was widened to
the full parish name); zero overflow, console errors or 4xx; LCP 2.0s, CLS
0.0001, JS 142KB on a throttled phone; ux-check clean. On 2026-11-02 again, with the
per-parish palettes and `/diocese`: all three parishes audited through
`PARISH_DEFAULT` on 4490, 4492 and 4493, 14 routes each, zero axe
violations, overflow, console errors or 4xx (San Felipe's `/ministries`,
`/bulletin` and `/give` 404 by design, it has no data for them); the
diocese letter zero axe at both widths with the charts in.

## Design

Dark ground with cream and a gold accent, Cormorant Garamond for display and
Source Sans 3 for text with the Latin Extended subset for Spanish, both
self-hosted at build time. Each parish has its own palette since 2026-11-02:
`Parish.theme` (13 tokens) is written onto `<html>` as the `--color-*`
variables by `lib/theme.ts`, so every Tailwind color utility follows the
parish. St. Mary is the navy and gold in `app/globals.css` (no theme, the
defaults); St. Philip is a deep wine with warm gold; San Felipe is a dark
umber with a Marian blue and amber. `node tools/palette-check.mjs` computes
the WCAG ratio of every color role on every palette and must say "every
palette clears its roles" before a theme ships; `tools/icons.mjs` reads the
theme so the icons and link card match. What also differs is the mark (`components/Mark.tsx`: St. Mary's ring-and-M from its favicon,
St. Philip's own logo image, letters in the ring for a parish with neither),
the photos and the words. The studio credit plate is cream under the navy
footer, "Hecho por" on the Spanish parish.

## Traps

- **A finder note is prose, not a rule.** A month is only a word that is a
  prefix of a month's name (`monthIndex` in lib/diocese.ts), because
  "St. Margaret Mary (Marcellus)" read as a March-to-May season once and
  hid a Sunday Mass eleven months of the year. "No Adoration April 30"
  is an exception to a weekly row, not a dated extra; the row stays
  weekly and the exception is not modelled. "No Mass" with a season word
  still drops the row, which is right for "No Mass Tuesdays during the
  semester" and wrong for a one-date exception written that way; an
  exdate would be the fix when one turns up.
- **The Monday refresh gate runs the structural tests only.** The content
  pins (a dated Mass that the diocese removes once it passes) are `pin()`
  in tools/diocese-tests.mjs and skipped with `--structural`.
- **Tailwind 4 on Next 16.4 needs the Turbopack loader rule in
  `next.config.ts`.** Drop it and every utility class vanishes while the
  build stays green.
- Any plain CSS rule in `globals.css` outside `@layer base` beats every
  Tailwind utility.
- `MSYS_NO_PATHCONV=1` before any glaze script on Windows Git Bash, or the
  `/` route becomes `C:/Program Files/Git/`.
- Chromium ignores a `Host` header from `extraHTTPHeaders`; map the domain
  with `--host-resolver-rules` instead (tools/render.mjs does).
- eCatholic sites sit behind a Cloudflare challenge: read them in a real
  browser; `files.ecatholic.com` and `/icalendar1.ics` are fetchable.
- `favicon.ico` carries bitmaps, not PNGs. Regenerate with `tools/icons.mjs`.

## Open with each parish

**St. Mary** (the parish knows about the site; Fr. Craig has the letter):
Gus Groat's number for the We Care Fund ((269) 781-0008 or (269) 830-7744),
Deacon Mike's full name, `MAIL_TO` and the sending mailbox, office hours,
the Children's Choir time (the calendar's 4:30 won over the music letter's
4:00), the Women's Ministry end time, holy day Mass times, a stipend amount
if wanted, the prayer list practice, MyParishApp, who edits the calendar
after eCatholic, photo credits.

**St. Philip** (built from public pages for the diocese demo; the parish has
not been asked): Thursday and Friday 8:00 AM Masses come from the calendar
feed while the Mass times page lists Monday, Wednesday and Saturday only;
the receptionist is Kateri Claussen on the staff page and Kateri Herold on
two others; staff emails were reconstructed from the obfuscated page text and
the known `admin@` and `tmcnamara@` addresses; Mt. Olivet Cemetery, the
pastoral councils and several ministry pages were not crawled and are not on
the demo; holy day times; the Sunday 9:00 AM "combined with St. Joseph"
note was a dated one-off and was dropped.

**San Felipe** (same status): the adoration on the third Sunday is 6:00 PM on
the page and 6:30 PM in the feed (the page won); emails reconstructed as
above; no bulletin page because the parish's bulletin lives only on
eCatholic; the prayers page is the platform's Spanish text of the five
standard prayers, not the parish's English originals; no online giving found.

## The letters

The diocese letter's charts (what is missing on the 42 home pages, images
per home page, Pew's search study, CARA's parish-website use) are plain
HTML bars written by `node tools/letter-charts.mjs` between the
`<!-- chart:name -->` markers in the letter; change the data there, not in
the HTML. `node tools/render-letter.mjs --slug diocese` screenshots and
axes the letter at 390 and 1440.

2026-11-03: the diocese layer, the nearby strip and the chancery view
audited on all three parishes (ten routes each) with zero axe violations,
overflow, console errors or 4xx (San Felipe's `/give` 404 by design).

`public/pitch/stmarymarshall/index.html` to Fr. Craig (October 2026) and
`public/pitch/diocese/index.html` to the Pastoral Center (November 2026),
served at `/` on their hosts by the rewrites in `next.config.ts`. The diocese
letter's numbers come from `glaze/research/diokzoo-audit-2026-11.md` in the
glazedweb repo, measured 2026-11-02. Its terms are Kevin's, locked 2026-11-02: $99 a parish a
month, no build fee for a parish moving under the diocesan agreement, a
twelve-month first term then month to month; a lone parish pays the
published build price. Nothing has been sent. A parish that says yes loses its
pitch host from the registry and its letter stops being served.

## Before launch (per parish)

From `glaze/launch.md`: zero axe violations at four widths, zero console
errors and 4xx, LCP under 2.5s and CLS under 0.1 on a throttled phone, every
route titled and described, the link card and icons generated, the form
confirmed in the office inbox, the canonical host decided and DNS moved, the
credit mentioned to the parish, a look on a real phone. St. Mary has
everything but the last four.

## Offboarding

The six steps in `glaze/launch.md`. A parish owns its data, photos and
documents outright; the diocese, if it signs, owns the platform.
