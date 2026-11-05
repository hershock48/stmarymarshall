import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Locate from "@/components/Locate";
import { SmartLink } from "@/components/DsModules";
import { Band, H2 } from "@/components/ui";
import { dioceseEvents } from "@/lib/diocese";
import { pageBySlug, pageSummary } from "@/lib/dsite";
import { fmtLongDate, fmtRange } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { liveNotices } from "@/lib/notices";
import { getDiocese } from "@/lib/parish";
import { fmtDate, localNow } from "@/lib/schedule";
import { latestVoice, thumb, watchUrl } from "@/lib/voice";
import { siteBySlug } from "@/dioceses/sites";

/**
 * A diocese's home page on the platform (served at / on the diocese's site
 * host; proxy.ts). The first thing on it is the thing most people came
 * for: the next Mass near them. Under it, what a visitor most often came
 * to do, this week across every parish, the bishop's newest message, and
 * the diocese's own sections. Every list here is read from data the
 * parishes and the chancery already keep; nothing is typed for this page.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const d = await getDiocese();
  const site = siteBySlug(d.slug);
  if (!site) return {};
  return { title: d.name, description: site.tagline, robots: { index: false }, alternates: {} };
}

export default async function DioceseHome() {
  const d = await getDiocese();
  const site = siteBySlug(d.slug);
  if (!site) notFound();
  const s = strings("en");
  const t = s.diocese.near;
  const now = localNow(d.timeZone);
  const events = dioceseEvents(d, 14, now).slice(0, 6);
  const bishop = latestVoice(d, "en");
  const notices = liveNotices(d.notices, now.iso);
  const sections = site.nav.filter((n) => n.href && n.href.startsWith("/"));
  const link = "font-semibold text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian";
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <h1 className="display max-w-4xl text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">{d.name}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dim">{site.tagline}</p>
          <div className="mt-10 max-w-3xl rounded-sm border border-navy-line bg-navy-soft p-5 sm:p-6">
            <h2 className="display text-3xl leading-tight text-cream">{s.diocese.nav.near}</h2>
            <p className="mt-1 text-[15px] text-dim">Every parish and mission in the diocese, nearest first, each with its next Mass, Confession and Adoration.</p>
            <form action="/diocese/near" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="flex flex-1 flex-col gap-1 text-sm font-semibold text-cream">
                {t.where}
                <input name="q" placeholder={t.placeholder} inputMode="text" autoComplete="postal-code" className="min-h-12 w-full rounded-sm border border-navy-line bg-navy px-3 text-base text-cream placeholder:text-dim" />
              </label>
              <input type="hidden" name="r" value="25" />
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold px-6 font-semibold text-navy hover:bg-gold-light">
                {t.go}
              </button>
              <Locate label={t.useLocation} busy={t.locating} radius={25} />
            </form>
          </div>
        </div>
      </section>

      {notices.length > 0 && (
        <section aria-label="From the chancery" className="border-b border-paper-dim bg-paper">
          <ul className="mx-auto max-w-7xl space-y-3 px-4 py-5 sm:px-6 lg:px-8">
            {notices.map((n) => (
              <li key={n.id} className="text-[16px] leading-relaxed text-ink">
                <span className="font-semibold">{n.title}.</span> {n.body}{" "}
                {n.href ? (
                  <SmartLink href={n.href} className={link}>
                    {n.label ?? "Read more"}
                  </SmartLink>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Band tone="paper">
        <H2>What brought you here</H2>
        <ul className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.tasks.map((k) => (
            <li key={k.href} className="border-t-2 border-gold pt-3">
              <SmartLink href={k.href} className="display text-2xl leading-tight text-ink underline decoration-marian/30 underline-offset-4 hover:decoration-marian">
                {k.label}
              </SmartLink>
              <p className="mt-1 text-[15px] leading-snug text-ink-soft">{k.note}</p>
            </li>
          ))}
        </ul>
      </Band>

      <section className="paper border-y border-paper-dim">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[3fr_2fr] lg:px-8">
          <div>
            <H2>{s.diocese.nav.events}</H2>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-ink-soft">What the parishes have on in the next two weeks, read from each parish’s own calendar. Nobody posts anything here; the parish calendar is the post.</p>
            {events.length > 0 ? (
              <ul className="mt-6">
                {events.map((o) => (
                  <li key={o.id + o.date} className="flex flex-col gap-0.5 border-b border-paper-dim py-3 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="w-56 shrink-0 text-sm font-semibold text-ink-soft">
                      {fmtLongDate(o.date)} · {fmtRange(o)}
                    </span>
                    <span className="text-[16px] text-ink">
                      {o.href ? (
                        <SmartLink href={o.href} className={link}>
                          {o.title}
                        </SmartLink>
                      ) : (
                        <span className="font-semibold">{o.title}</span>
                      )}
                      <span className="text-ink-soft">
                        {" "}
                        · {o.host}, {o.town}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <Link href="/diocese/events" className={link}>
                Everything in the next six weeks
              </Link>
              <Link href="/diocese/groups" className={link}>
                {s.diocese.nav.groups}
              </Link>
              <Link href="/diocese/insider" className={link}>
                {s.diocese.news.digestTitle}
              </Link>
            </p>
          </div>
          <div>
            <H2>{s.diocese.voice.title}</H2>
            {bishop ? (
              <div className="mt-6">
                {bishop.youtube ? (
                  <a href={watchUrl(bishop.youtube)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-sm" aria-hidden="true" tabIndex={-1}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(bishop.youtube)} alt="" width={480} height={360} loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
                  </a>
                ) : null}
                <p className="mt-3 text-lg font-semibold leading-snug text-ink">{bishop.title}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">
                  {bishop.lede} {fmtDate(bishop.date, true, "en")}.
                </p>
                <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
                  {bishop.youtube ? (
                    <a href={watchUrl(bishop.youtube)} target="_blank" rel="noopener noreferrer" className={link}>
                      {s.diocese.voice.watch}
                    </a>
                  ) : null}
                  <Link href="/diocese/voice" className={link}>
                    {s.diocese.voice.all}
                  </Link>
                  <Link href="/bishop-lohse" className={link}>
                    About {d.bishop}
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Band tone="paper">
        <H2>The diocese</H2>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((n) => {
            const page = pageBySlug(site, n.href!.slice(1));
            const below = n.children.flatMap((c) => (c.href ? [c] : c.children)).filter((c) => c.href);
            // A section with nothing under it in the menu shows the buttons its own page carries.
            const kids = below.length > 0 ? below : (page?.modules ?? []).flatMap((m) => (m.kind === "button" ? [{ label: m.label, href: m.href, children: [] }] : []));
            return (
              <li key={n.label} className="rounded-sm border border-paper-dim p-6">
                <h3 className="display text-2xl leading-tight text-ink">
                  <SmartLink href={n.href!} className="underline decoration-marian/30 underline-offset-4 hover:decoration-marian">
                    {n.label}
                  </SmartLink>
                </h3>
                {page && pageSummary(page) ? <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{pageSummary(page)}</p> : null}
                {kids.length > 0 ? (
                  <ul className="mt-4 space-y-1.5 text-[15px]">
                    {kids.slice(0, 5).map((c) => (
                      <li key={c.label + c.href}>
                        <SmartLink href={c.href!} className={link}>
                          {c.label}
                        </SmartLink>
                      </li>
                    ))}
                    {kids.length > 5 ? (
                      <li className="text-ink-soft">
                        and {kids.length - 5} more, on{" "}
                        <SmartLink href={n.href!} className="underline underline-offset-2">
                          the {n.label} page
                        </SmartLink>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Band>
    </>
  );
}
