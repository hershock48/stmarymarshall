import type { Metadata } from "next";
import { Band } from "@/components/ui";
import { getParish } from "@/lib/parish";

/**
 * What we store, what we do not, where it runs. One page a chancellor can
 * hand to whoever asks about security, written to be true rather than
 * reassuring. Every line here describes the code in this repository; when
 * the code changes, this page changes in the same commit.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "What we store, what we do not, where it runs | Diocese of Kalamazoo pilot", description: "The parish platform's security and data practices, in plain English.", robots: { index: false }, alternates: {} };

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-paper-dim py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-marian">{k}</p>
      <div className="text-[15px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export default async function SecurityPage() {
  await getParish();
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Diocese of Kalamazoo · pilot</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">What we store, what we do not, where it runs</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">The whole of it, for whoever at the Pastoral Center asks. Every line describes the code the diocese would hold; when the code changes, this page changes with it.</p>
        </div>
      </section>
      <Band tone="paper">
        <div className="max-w-4xl">
          <h2 className="display text-3xl text-ink">What we do not store</h2>
          <div className="mt-4 border-b border-paper-dim">
            <Row k="Card numbers">Never. Giving stays on each parish&rsquo;s own provider (Vanco, OSV, whichever it has). The Give button links out; no payment page, card field or amount exists on the platform.</Row>
            <Row k="Visitor accounts">None. There is nothing to sign up for and no password for a visitor to lose. The only login on the platform is the chancery view&rsquo;s passcode.</Row>
            <Row k="Tracking">No advertising or analytics scripts, no third-party cookies, no visitor ids. The counts the chancery sees are per day, host, page and kind, with no person in them; a finder search is counted by a point rounded to about seven miles.</Row>
            <Row k="Member records">The platform is not a church-management system. Registrations, Mass intentions and prayer requests are passed to the parish office, not kept as a database of people.</Row>
          </div>

          <h2 className="display mt-12 text-3xl text-ink">What we do store</h2>
          <div className="mt-4 border-b border-paper-dim">
            <Row k="The parish data">Each parish&rsquo;s schedule, calendar, staff list, pages, photos and documents, as files in a code repository the diocese holds, with the full history of every change.</Row>
            <Row k="Form submissions">A registration, a Mass intention, a prayer request or a wrong-time report from the finder is emailed to the inbox the parish names and written to the server log so nothing is lost if mail fails. Logs are kept by the host for its standard retention and are not searched or used for anything else. Until a parish names its inbox, the form says so to the visitor rather than pretending to send.</Row>
            <Row k="Counts">Pages served, finder searches, forms sent and Give taps, as numbers per day, once a database is connected. Nothing in that table identifies anyone.</Row>
            <Row k="One cookie">The chancery view sets a single cookie after the passcode is typed, scoped to that page, expiring in twelve hours. No other page sets one.</Row>
          </div>

          <h2 className="display mt-12 text-3xl text-ink">Where it runs</h2>
          <div className="mt-4 border-b border-paper-dim">
            <Row k="Hosting">Vercel, in its US East region, on a global edge network. Every page is served over HTTPS with certificates renewed automatically; plain HTTP is redirected and browsers are told to insist on HTTPS for two years (HSTS).</Row>
            <Row k="Headers">Every response says it may not be framed by another site (the one exception is the finder, which the diocese&rsquo;s own site diokzoo.org may embed), may not be sniffed into another content type, sends only the site&rsquo;s origin as a referrer to other sites, and allows location access only for the finder&rsquo;s own button, with camera, microphone and payment APIs switched off.</Row>
            <Row k="Software">A current web framework with no plugins and no page-builder login. Dependencies are updated the week a fix ships; the site is rebuilt and re-checked (accessibility, page weight, every route) before each change goes live.</Row>
            <Row k="Email">Form mail goes out through a sending-only account on the studio&rsquo;s domain, with the visitor&rsquo;s address as reply-to; no mailbox is read by the platform.</Row>
            <Row k="Backups">The repository is the backup: every parish&rsquo;s data and files, with history, in a place the diocese holds and can clone at any time.</Row>
          </div>

          <h2 className="display mt-12 text-3xl text-ink">Who can touch it</h2>
          <div className="mt-4 border-b border-paper-dim">
            <Row k="Access">The studio and the diocese. A parish office sends changes by email or text and never holds a login. The chancery view is one passcode the diocese sets and can change at any time, which signs everyone out.</Row>
            <Row k="If we part ways">The diocese gets the working project, the repository, the hosting project and the logins, under the agreement. Not a snapshot, not an export.</Row>
            <Row k="Reporting a problem">kevin@glazedweb.com, or a text. A security report is answered the same day and fixed before anything else.</Row>
          </div>
        </div>
      </Band>
    </>
  );
}
