# Narthex: the plan

Narthex is the parish and diocese platform in this repository, built by
Glazed Web. The narthex is the entrance hall of a church, where the bulletin
board, the sign-up sheets and the coffee-hour invitations live. That is what
this is for a diocese: the public-facing layer every parish shares, owned
by the diocese, kept by us. Working name, chosen 2026-11-04; "Egnatia" (the
Roman road that carried the Gospel into Europe) is the one alternative on
file.

This file is the build plan and the order of work. What is built is marked
built; everything else is in the order it will be done. The research behind
each item is in the glazedweb repo under `glaze/research/`
(`ecatholic-better-2026-11.md`, `diokzoo-audit-2026-11.md`) and the client
record in `glaze/clients/diokzoo.md`.

## What Narthex is, in one paragraph

One codebase, many parish sites, each on its own domain with its own words,
photos and palette, in English or Spanish, with a diocese layer over all of
them: a Mass finder for every parish in the diocese from day one, events and
groups across parishes, the chancery's notices on every site, the bishop's
voice on every site, a Watch page per parish, and a chancery view with counts
and no visitors in them. The schedule is typed once and published as
structured data, a feed, and the finder. The diocese owns its data, its
content, its domains and its accounts outright, in writing, with export at
any time; the platform is ours, and if we ever fail a diocese it receives a
perpetual source-included license to run it for its own parishes.

## The story the letters tell (Kevin, 2026-11-04)

Not "we rebuilt three of fifty sites." The story is what one parish site
turned into: a platform. A parish site that is alive, a proper reflection
of a living faith, where the schedule, the calendar and the week's news run
from the same data. Parishes connected to each other through one finder,
one calendar, one set of groups. A layer for the diocese to see every site
and to send, the bishop's voice long form and short, notices, gatherings
across parishes. An upgrade from a stale drag-and-drop template. The
rebuilt sites and the measurements are proof inside that story, never the
headline. Both letters follow this order: alive, connected, the diocese,
then what we measured, ownership, cost, next.

## Progress (2026-11-04, evening)

Built since the plan was written: the platform is multi-diocese
(`dioceses/<slug>/config.ts`, Lansing added as the second with its own
finder reader, vicariates, podcast voice, letter at lansing.glazedweb.com
and finder.lansing.glazedweb.com); the Lansing audit (72 sites, seven
platforms; `glaze/research/lansing-audit-2026-11.md`); religious education
enrollment (`/enroll`); sacramental prep as checklists on the sacraments
page; the chancery view by deanery with the finder's age and each parish's
week. Still owed from this list: nothing. A fresh-eyes review of the day's code
(2026-11-04, evening) found ten defects; all are fixed and covered by
tests where a test could hold them: a saint's name read as a month, a
"No X on <date>" note deleting its weekly row, Michigan Center losing its
name, the Watch page and its gate disagreeing, holy-day notices a week out
reading as today, RSS dates an hour off in summer, every diocese's site
allowed to frame every finder, the refresh gate pinned to content the
diocese will remove. Next, per the plan: phase two's credential-gated
pieces when the keys exist, and the office panel.

## Principles

- **Typed once.** A fact lives in one data file; every page, feed and finder
  reads it. Nothing is re-keyed, by us or by an office.
- **Office-first.** The people who keep these sites are mostly 50 and older
  and part-time (CARA). Every workflow is judged by whether it removes a
  chore from that person's week.
- **Owned, exportable, measured.** Everything eCatholic's terms forbid
  (export, API, feeds, donors that travel) is a line in our agreement. Every
  page is measured before it ships: zero accessibility violations, page
  weight, every route.
- **Rent the commodity, write the Catholic part.** Video hosting, mail, maps
  and payments are rented. The schedule logic, the sacramental workflows and
  the diocese layer are ours.
- **Nothing pretends.** A missing fact renders nothing. A demo parish's forms
  reach no real office. A feature without its credentials says so.

## Phase one: the public layer (now)

The pitch for the diocese meetings. Each item lands on the live pilot hosts.

1. **The finder as a standalone offer.** Built: `/diocese/near` for all 60
   parishes, three from platform data and 57 from the diocese's own Parish
   Finder. To do: its own host with diocesan branding, so the diocese can
   point its Parish Finder page at it before any parish moves; a "checked
   on" date on every finder-sourced card; a "wrong time? tell us" report
   link per parish that reaches the chancery or us; the finder embeddable on
   diokzoo.org and only there (frame-ancestors); a weekly refresh of the
   Parish Finder read with a guard that refuses a short or empty parse.
2. **Holy-day notice.** The one eCatholic feature the St. Mary office named:
   a line on every page of a parish site when the next days' Masses differ
   from the usual week (a holy day, a special Mass, a cancelled Mass), from
   the same data as the finder.
3. **Bishop's voice.** A module the diocese writes once: video or audio
   posts (a homily, a Lent reflection, a letter read aloud), shown on the
   diocese page and syndicated to every parish home page that has not opted
   out, with a podcast feed so people subscribe in Apple Podcasts or any
   podcast app rather than Facebook. Clips are entries with a start time.
4. **Watch.** A `/watch` page per parish that is schedule-aware: live at Mass
   time, the latest recording the rest of the week, the next Mass in words.
   It works today on the parish's YouTube channel and upgrades to hosted
   video (Cloudflare Stream or Mux: RTMP ingest per parish, player, automatic
   recording, simulcast to YouTube and Facebook) when the credentials exist.
   A diocese `/diocese/watch` page lists what is live now across the diocese
   and the bishop's latest. Hosted video is a priced add-on (about $49 a
   month covers the CDN bill of a typical streaming parish).
5. **Letter and agreement.** The diocese letter names Narthex, carries the
   finder offer ("take the finder today, nothing to sign"), the bishop's
   voice and Watch; the agreement gains export at any time, feeds and an
   API, and giving on the parish's own account.

## Phase two: the office's week

What removes the most work from a parish office, in order.

1. **The announcements inbox.** One place a parish worker types an item with
   a run window. It renders the site's news, the weekly email, the text, the
   Facebook post and the bulletin PDF the printer accepts (LPi, Diocesan
   Publications). Flocknote stays as an output. The diocesan communications
   office gets the same inbox at diocese level, which fills its weekly email
   from parish submissions instead of from forwarded mail.
2. **Giving and paid forms on Stripe,** on the parish's own Stripe account, at
   processor cost with nothing to us. Registration, tuition, tickets and
   retreats take a card. Vanco and OSV stay where a parish wants them.
3. **Mass intentions online.** A calendar of open Masses the family books and
   pays, the office approves, the bulletin and the site list fill themselves.
4. **Schedule sync.** The schedule pushed to Google Business Profile hours
   and to the directories (MassTimes.org, DiscoverMass) on their self-update
   paths, so no third login drifts.
5. **The household account.** Register once; religious education,
   sacramental prep and sign-ups prefill from it. The on-ramp to records.
6. **Notice types with deadlines.** A funeral posts the same hour; banns run
   three weeks; a diocesan notice lands everywhere at once (built).
7. **Bilingual fields** on every content type, one publish (the platform is
   already EN/ES by parish; this makes it EN and ES on one parish).

## Phase three: self-service

The owner panel line Glazed Web already has, as the parish's login: Mass
times, holy days, staff, the calendar, announcements, photos. Built for the
50-plus volunteer, measured the way the public pages are. Email-us works for
one diocese; a second and third do not scale on one inbox. Deaneries become
a level in events and the chancery view. The chancery view grows into the
diocese's dashboard.

## Phase four: records

Sacramental prep as a checklist the family can see, then the parish
database: households, members, sacraments with book-and-page references,
religious education, contributions. Migration from ParishSOFT, PDS and
eCatholic ChMS is a paid service done with the chancellor at the table. Not
before the diocese trusts us with the public layer.

## The business model (Kevin, 2026-11-05)

Researched in `glaze/research/narthex-business-model-2026-11.md` and
adopted. Support, not hosting, is the cost; the money in a diocese flows
assessments in and services out; half the parishes live under $250,000 a
year; a subscription under the bishop's signature threshold is ordinary
administration. So:

- **A diocesan program license, billed to the diocese, every parish
  included, no parish billed.** Kalamazoo $3,990 a month; Lansing $4,990.
  No build fee; a twelve-month first term, then month to month. Sized
  near one percent of the appeal and under the signature threshold.
- **Giving at 1% of each gift, capped at $5, donor-covered by default,**
  on the parish's own Stripe nonprofit account, no monthly fee; the
  appeal on the same rails on the diocese's own account.
- **Add-ons a parish chooses and pays for:** hosted video $89, office
  panel $29, texting at cost plus a margin, newsletter sending later.
- **A lone parish outside a license** pays the published build and $99 a
  month. The path that stays open if a diocese says no.
- **Later, not now:** diocese-controlled self-serve sponsorships with a
  parish revenue share (never Google Ads: pennies, and it breaks the
  no-tracking promise); the appeal processed on the platform; records
  migration as a service.
- **The ladder is the offer:** the layer free for ninety days with
  nothing signed, three parishes built free, then the license.

Never say "$99 a parish" to a diocese.

## Who owns what (Kevin, 2026-11-05)

Researched in `glaze/research/narthex-ownership-2026-11.md` (glazedweb
repo) and adopted. "The diocese holds the repository" was the single-site
promise and no longer fits: the repository is the product and serves every
diocese. What replaces it, in the letters and the agreement:

- **Layer one, the diocese's outright:** every page, photo, document,
  schedule, calendar, event, group, notice and form submission; domains in
  its own registrar account; giving on each parish's own Stripe account
  with full Dashboard (Customers, PaymentMethods, Prices and Subscriptions
  created on the parish account, never cloned from ours, no platform
  controls). Export at any time, self-serve where offered, free, as
  readable files, as data and as a static copy of each site; feeds for its
  own data never metered; ninety days of export after any ending, then
  deletion confirmed in writing.
- **Layer two, continuity:** if we dissolve, give notice of ceasing, file
  for insolvency, discontinue the platform, terminate for convenience or
  fail to cure a material support or uptime breach in sixty days, the
  diocese receives a perpetual, non-exclusive, royalty-free license to the
  source and build documentation as they stand, to run for its own
  parishes, schools and institutions, modifiable by anyone it hires; no
  resale, no hosting for another diocese. The diocese's own leaving is not
  a trigger. A quarterly encrypted deposit (git bundle, schema, migrations,
  runbook, env inventory, deploy steps) goes to storage the diocese names
  with the hash and commit attested in writing; the key sits with our
  attorney. Recites 11 U.S.C. 365(n).
- **Layer three, source-available (FSL): not yet.** Revisit at three or
  more dioceses after a security pass.
- The lone parish ($99 a month) gets the same two layers.
- General terms section 3 stays for single-site clients; Exhibit A says it
  does not govern the platform.

Build items this adds: the self-serve export (JSON, CSV, media zip, static
site per parish) and the quarterly deposit script with its attestation.

## Hosts and names

- Parish sites: the parish's own domain; until live, `<slug>.glazedweb.com`
  as pitch host.
- The diocese layer: today under every parish host at `/diocese/*` and on
  the letter host `kalamazoo.glazedweb.com`. Phase one adds a standalone
  finder host; the diocese is asked for a host it owns (for example a
  subdomain of diokzoo.org) the day it says yes.
- Product: Narthex, built by Glazed Web. Domains free as of 2026-11-04:
  usenarthex.com, narthexhq.com; narthex.com and narthex.app are taken.

## Kevin's to-do

Nothing here blocks the build; each one switches on a piece that is already
built. Kevin said "not yet" to the first two on 2026-11-03 and to the third
on 2026-11-04.

- [ ] `DIOCESE_PASSCODE` in Vercel: opens the chancery view.
- [ ] `DATABASE_URL` (Neon) in Vercel and `db/tally.sql` run once: starts the counts.
- [ ] `DIOCESE_MAIL_TO` (or `MAIL_TO`) and the `SMTP_*` variables in Vercel: the
      finder's wrong-time reports and the parish forms reach a person instead
      of the log.
- [ ] A Cloudflare Stream account; `STREAM_CUSTOMER_CODE` in Vercel; a live
      input per parish that wants hosted video.
- [ ] The price of hosted video (the letter says about $49 a month) and of the
      chancery view.
- [ ] Merge glazedweb PR #33 so /agreement/diokzoo and /build/diokzoo go live.
- [ ] The diocese meetings; Vikki Sesna's introduction; the eCatholic back end
      through Stacie's login, look only.
- [ ] St. Mary as the free first-year reference parish; a named second person
      for support.
- [ ] The product entity, before the first diocese signs (added 2026-11-05;
      costs and sources in `glaze/research/narthex-ownership-2026-11.md`,
      section 8): a Michigan LLC for the platform (sister LLC or subsidiary of
      Glazed Web LLC, CPA picks; $50 state, attorney $0 to $1,500); an IP
      assignment from Glazed Web LLC to it covering code, schema, designs,
      content, domains and the mark, with a schedule of repositories, and a
      check that no client-owned code sits inside the platform (attorney,
      $500 to $2,000); the diocese agreement redrafted by the attorney as a
      twelve-month SaaS license with a data-processing addendum, breach
      notice and liability cap ($1,500 to $3,500, reused per diocese);
      insurance in the entity's name, general liability $1M plus tech
      E&O/cyber $1M, diocese and bishop as additional insureds, W-9 and
      certificate in the vendor packet ($1,000 to $2,000 a year); the Stripe
      platform account under the entity. About two weeks and $3,000 to
      $8,000 with an attorney, under $1,500 filing the LLC yourself. The IP
      assignment and the license review are the two not to do alone. Not
      legal or tax advice.
- [ ] After the first diocese pays: S-corp election review with the CPA;
      federal mark (Class 42, intent to use, $350 a class) within thirty days
      of a name.

## Order of work, phase one

1. Plan written (this file), README renamed.
2. Finder: standalone host, diocesan header on that host, checked-on date,
   report link, embed allowance.
3. Finder: weekly refresh workflow with parse guard.
4. Holy-day notice.
5. Bishop's voice: data, page, parish card, podcast feed.
6. Watch: parish page on YouTube, diocese page, hosted-video seam.
7. Tests, audits (axe, weight, every route, three parishes), production
   verification on the pilot hosts.
8. Letter and agreement copy; catalog row in the glazedweb repo.
