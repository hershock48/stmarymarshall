# St. Mary Catholic Church, Marshall

The parish website, rebuilt by Glazed Web in October 2026 to replace the
eCatholic site at stmarymarshall.org. Next.js 16 App Router, React 19,
Tailwind 4 (through the Turbopack loader), TypeScript, deployed on Vercel.
No page builder, no plugin, nothing the parish pays a subscription for.

```bash
npm install
npm run build && npm start -- -p 4490     # production, which is what gets audited
npm run dev                                # for editing only
```

## Where things live

Facts live in one place each. Change the file, not the page.

| What | File |
|---|---|
| Address, phone, email, diocese, outbound links, document paths | `lib/site.ts` |
| Mass, Confession, Adoration times, special Masses | `lib/schedule.ts` |
| The calendar (every recurring event, with exceptions) | `lib/events.ts` |
| Staff, history, cemetery, sacraments, faith formation, ministries, giving | `lib/content.ts` |
| Registration form fields | `lib/register.ts` |
| Mass intention and prayer request fields | `lib/requests.ts` |
| Holy Days of Obligation (dates, Mass times once known) | `HOLY_DAYS` in `lib/schedule.ts` |
| The iCalendar feed | `lib/ics.ts`, served at `/calendar.ics` |
| The PDFs the old site hosted on files.ecatholic.com | `public/docs/` |
| Photos (the parish's own, cropped from its eCatholic slideshow) | `public/img/` |
| Icons and the link card, generated | `node tools/icons.mjs` |

Nothing on the site reads from anywhere else. There is no CMS; a change is a
pull request. The parish office does not edit this repo today; see the open
decisions below.

## How the pages work

- **Next Mass, Next Confession, Next Adoration** are computed on the parish's
  clock (America/Detroit) at request time, so `/` and `/mass-times` and
  `/events` are dynamic routes, not static. A page that reads the clock cannot
  be cached (glaze.md). The logic is `nextService` in `lib/schedule.ts`.
- **The calendar** is data the site owns. Every rule in `lib/events.ts` was
  transcribed from the parish's eCatholic iCalendar feed on 2026-10-27,
  exceptions included. The eCatholic feed dies when the parish leaves
  eCatholic, which is why it is not fetched. To add an event, add a rule.
  Seasonal rules carry `from` and `until`; cancelled dates go in `exdates`.
- **The bulletin** is printed and hosted by Diocesan Publications on
  DiscoverMass. `lib/bulletins.ts` fetches their page server side, pulls the
  dated download links, and caches six hours. If the fetch fails the page
  shows the plain DiscoverMass link, which is what the old site did. **This is
  a remote source: verify on the deployment**, not just locally. DiscoverMass
  single-quotes its attributes; the regex accepts both quote styles.
- **Today's readings** is a computed USCCB link (MMDDYY).
- **The calendar feed** at `/calendar.ics` is the next ninety days of events
  expanded into plain VEVENTs (no RRULEs, so every calendar app agrees),
  tagged America/Detroit. `?e=<id>` returns one event for the “Add to my
  calendar” links; ids come from `occurrenceId` in `lib/ics.ts`.
- **Mass intentions and prayer requests** (`/mass-intentions`,
  `/prayer-request`) post to `/api/request` with the same three honest states
  as registration. A Mass intention is a request the office confirms, never a
  booking: the site does not know which Masses are taken and says so. No
  stipend amount is printed because the parish has not published one.
- **New here?** (`/new`) answers the first-visit questions from facts already
  on the old site; nothing about parking or doors was invented.
- **Holy Days** on the Mass times page list the dates for the current year with
  `masses: null` until the office gives times.
- **Registration** is a plain POST to `/api/register`. No JavaScript needed.
  Three honest outcomes: sent, unconfigured, failed. The visitor is told which
  on `/register/thanks`. Until SMTP is set, submissions are logged in full and
  the thanks page tells the visitor to call. Never a fake "we got it".
  A hidden `website` field drops bots.
- **Ministries and faith formation** are native `<details>` rows, rendered
  closed in the server HTML (no layout shift) and opened by `OpenOnHash` when
  the URL hash names one. Without JavaScript the row is one tap away.
- **Mail** is SMTP through a mailbox the parish owns (`lib/mail.ts`,
  nodemailer). `.env.example` is the authority on variable names. Kevin sets
  them in Vercel.

## Design

Navy ground with cream and a gold accent, a book serif (Cormorant Garamond)
for display and Source Sans 3 for text, both self-hosted at build time. The
old site was Marian blue; the navy keeps that and the gold comes from the
church's own brass and the chapel tabernacle. Palette contrast was computed,
not judged; the table is at the top of `app/globals.css`.

The mark is the parish's own ring-and-M favicon, redrawn as geometry in
`components/Mark.tsx`, gold on navy. Nothing was added to it.

The studio credit plate is cream under the navy footer (plate.mjs: 14.9
against the footer; chocolate would be invisible).

## Checks beyond the auditor

`node tools/ux-check.mjs` (production server on 4490) measures what axe does
not: every link and button at least 24px, every inline-flex button still
laid out as flex (an unlayered CSS rule once turned the Call buttons into
inline-block and their text sat at the top), button text vertically
centered, the header on one line at 390, 1024, 1280 and 1440, nothing
clipped. `tools/headers.mjs` screenshots the header strips and the open
mobile menu for a look. Run both before shipping any header or CSS change.

## Traps

- **Tailwind 4 on Next 16.4 needs the Turbopack loader rule in
  `next.config.ts`.** The first build dropped it and every utility class
  vanished while the build stayed green. Keep the `turbopack.rules` block.
- `MSYS_NO_PATHCONV=1` before any glaze script on Windows Git Bash, or the
  `/` route becomes `C:/Program Files/Git/`.
- The two addresses are real: the church is 214 S. Eagle St. (corner of Eagle
  and Green), the office and all mail is 212 W. Hanover St. Do not merge them.
- `app/favicon.ico` carries bitmaps, not PNGs (Next 16 refuses RGB PNG-in-ICO).
  Regenerate with `tools/icons.mjs`, never by hand.

## Open with the parish

Things the old site did not settle. Each is an unchecked box until the office
answers.

- [ ] **Which number for Gus Groat and the We Care Fund.** The Donate page
      said (269) 781-0008; the Knights section said (269) 830-7744. Both are
      kept where they were.
- [ ] **Deacon Mike's full name**, and whether he belongs on the staff list.
      He is named only under Shut-In Ministry.
- [ ] **Where registrations should go** (`MAIL_TO`) and which mailbox sends
      them. The office address is stmarymarshall@aol.com; AOL SMTP works with
      an app password.
- [x] **Bishop line in the history.** The old site stopped at Bishop Bradley; Bishop
      Edward M. Lohse (installed July 25, 2023) added from the diocese and St. Philip BC.
- [ ] **Office hours** are not published anywhere. Ask.
- [ ] **Holy day Mass times** for Dec 8, Christmas, Jan 1. Fill `HOLY_DAYS`.
- [ ] **Mass stipend amount**, if the parish wants it printed on /mass-intentions.
- [ ] **Prayer list practice**: does the bulletin print names, and for how long?
- [ ] **MyParishApp** had a tab on the old About page with no content.
      Dropped. Ask whether the parish uses it.
- [ ] **Who edits the calendar** once eCatholic is gone. Today: a pull request.
      If the office wants to edit it themselves, that is a small owner panel
      (see glaze/catalog) and a separate conversation.
- [ ] **Photo credits.** The slideshow photos carry no photographer name.

## The letter

`public/pitch/stmarymarshall/index.html` is the proposal to Fr. Craig, served at
`/` on stmarymarshall.glazedweb.com by the rewrites in `next.config.ts`; the
site is `/demo` on that host. Stylesheet and marks lifted from the Mike's Place
letter. The standing GPT judge and prose pass (glaze/scripts/second.mjs) could
not run on 2026-10-27: the Codex model in ~/.codex/config.toml is refused on
the ChatGPT account. Claude did a stand-in prose pass against standards.md and
logged the owed review in glaze/handoff.md. Delete the pitch folder and the
rewrites when the parish says yes.

## Before launch

From `glaze/launch.md`. Work to zero.

- [x] Zero axe violations at 390 and 1440 on every route (2026-10-27, 11 routes).
- [x] Zero at 320 and 768 (width-check, 10 routes).
- [x] Zero console errors, zero 4xx.
- [x] LCP 1.25s, CLS 0.0001, JS 142KB compressed on a throttled mobile profile.
- [x] Reduced motion: nothing autoplays; the only transition is the details chevron.
- [x] JavaScript off: every nav link works, the form submits, details open.
- [x] A real 404 in the site's design.
- [x] Every route has its own title and description; canonical on the parish domain.
- [x] `og.jpg` at 1200x630, sitemap, robots, Church structured data with Mass events.
- [x] Favicon set is the parish's mark, full bleed, generated from one source.
- [x] Studio credit placed, plate ground computed.
- [ ] Registration form sent and **confirmed in the office inbox** (needs SMTP vars).
- [x] Bulletin list verified on the deployment (stmarymarshall.vercel.app, 2026-10-27).
- [x] GitHub repo `hershock48/stmarymarshall` (public, Kevin's call) and one Vercel project on the glazedweb team.
- [ ] Canonical host decided (apex `stmarymarshall.org`, as the old site) and DNS moved from eCatholic.
- [ ] The parish told the credit is there.
- [ ] Looked at on a real iPhone.

## Offboarding

The six steps in `glaze/launch.md`. The parish owns the repo, the Vercel
project and the domain once the build fee is paid.
