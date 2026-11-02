# Parish platform (St. Mary Marshall, St. Philip Battle Creek, San Felipe Fennville)

One Next.js deployment that serves a parish website per domain. It began in
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
| `stmarymarshall.vercel.app` | The default parish, noindex |

Every page calls `getParish()` and renders from that parish's data, so every
route is dynamic. A parish not yet `live` is noindex on every host.

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
`lib/ics.ts` or `lib/sentences.ts`. Then, against the production server on
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
0.0001, JS 142KB on a throttled phone; ux-check clean. The St. Philip and San
Felipe hosts were screenshotted and looked at, not audited by axe (the
auditor takes a base URL, not a host).

## Design

Navy ground with cream and a gold accent, Cormorant Garamond for display and
Source Sans 3 for text with the Latin Extended subset for Spanish, both
self-hosted at build time. Palette contrast was computed; the table is at
the top of `app/globals.css`. Every parish shares the palette; what differs
is the mark (`components/Mark.tsx`: St. Mary's ring-and-M from its favicon,
St. Philip's own logo image, letters in the ring for a parish with neither),
the photos and the words. The studio credit plate is cream under the navy
footer, "Hecho por" on the Spanish parish.

## Traps

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

`public/pitch/stmarymarshall/index.html` to Fr. Craig (October 2026) and
`public/pitch/diocese/index.html` to the Pastoral Center (November 2026),
served at `/` on their hosts by the rewrites in `next.config.ts`. The diocese
letter's numbers come from `glaze/research/diokzoo-audit-2026-11.md` in the
glazedweb repo, measured 2026-11-02. Its price ($99 a parish a month, no
build fee for any parish) is a position for Kevin to confirm before anyone
outside sees it; nothing has been sent. A parish that says yes loses its
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
