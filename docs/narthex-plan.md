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
structured data, a feed, and the finder. The diocese holds the repository,
the hosting and the data, in writing, and can leave with all of it.

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

## Hosts and names

- Parish sites: the parish's own domain; until live, `<slug>.glazedweb.com`
  as pitch host.
- The diocese layer: today under every parish host at `/diocese/*` and on
  the letter host `kalamazoo.glazedweb.com`. Phase one adds a standalone
  finder host; the diocese is asked for a host it owns (for example a
  subdomain of diokzoo.org) the day it says yes.
- Product: Narthex, built by Glazed Web. Domains free as of 2026-11-04:
  usenarthex.com, narthexhq.com; narthex.com and narthex.app are taken.

## What Kevin holds

- `DIOCESE_PASSCODE`, `DATABASE_URL` and `db/tally.sql` for the chancery
  view's counts (said "not yet" 2026-11-03).
- SMTP variables for the forms and the report link.
- Cloudflare Stream (or Mux) account and token for hosted video.
- The diocese meetings; Vikki Sesna's introduction; the eCatholic back end
  via Stacie's login, look only.
- Price of hosted video and of the chancery view; St. Mary as the free
  first-year reference parish; a named second person for support.

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
