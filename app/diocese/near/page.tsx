import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { after } from "next/server";
import DioceseNav from "@/components/DioceseNav";
import Locate from "@/components/Locate";
import { Band } from "@/components/ui";
import { nearby, TIME_ZONE, type Near } from "@/lib/diocese";
import { coarse, resolvePlace } from "@/lib/geo";
import { strings } from "@/lib/i18n";
import { getParish } from "@/lib/parish";
import { localNow, whenWord, type NextService } from "@/lib/schedule";
import { bump } from "@/lib/tally";

/**
 * Mass near you: every parish in the diocese within a radius of a zip, a
 * town or the phone's own location, nearest first, each with its next
 * Mass, Confession and Adoration from the clock. Works with no JavaScript
 * (the zip box) and gets the location button with it.
 *
 * The three parishes on the platform answer from their own data; the rest
 * from the diocese's Parish Finder as read on the date in finder.json.
 */
export const dynamic = "force-dynamic";

const RADII = [10, 25, 50];

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang).diocese.near;
  return { title: `${s.title} | ${strings(p.lang).diocese.kicker}`, description: s.lede, robots: { index: false }, alternates: {} };
}

function Tile({ name, n, lang }: { name: string; n: NextService | null; lang: "en" | "es" }) {
  if (!n) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-marian">{name}</p>
      <p className="mt-0.5 text-lg font-semibold leading-tight text-ink">
        {whenWord(n, lang)} {n.time}
      </p>
      <p className="text-sm text-ink-soft">{n.label}</p>
    </div>
  );
}

function Card({ p, lang }: { p: Near; lang: "en" | "es" }) {
  const s = strings(lang).diocese.near;
  const schedule = p.source === "platform" ? `${p.site}/mass-times` : p.site;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address}`)}`;
  return (
    <li className="rounded-sm border border-paper-dim bg-paper p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="display text-2xl text-ink">{p.name}</h2>
        <p className="text-sm font-semibold tabular-nums text-ink-soft">{s.away(p.miles < 10 ? p.miles.toFixed(1) : String(Math.round(p.miles)))}</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        {p.address}
        {p.masses.some((m) => /espa/i.test(m.lang ?? "")) ? <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-marian">Español</span> : null}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Tile name={s.nextMass} n={p.next.mass} lang={lang} />
        <Tile name={s.nextConfession} n={p.next.confession} lang={lang} />
        {p.adorationPerpetual ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-marian">{s.nextAdoration}</p>
            <p className="mt-0.5 text-lg font-semibold leading-tight text-ink">{s.perpetual}</p>
            <p className="text-sm text-ink-soft">{p.adorationPerpetual}</p>
          </div>
        ) : (
          <Tile name={s.nextAdoration} n={p.next.adoration} lang={lang} />
        )}
      </div>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
        {schedule ? (
          <a href={schedule} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4" target="_blank" rel="noopener noreferrer">
            {p.source === "platform" ? s.schedule : s.site}
          </a>
        ) : null}
        <a href={maps} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4" target="_blank" rel="noopener noreferrer">
          {s.directions}
        </a>
        {p.phone ? (
          <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
            {s.call} {p.phone}
          </a>
        ) : null}
      </p>
      <p className="mt-3 text-xs text-ink-soft">{p.source === "platform" ? s.fromPlatform : s.fromFinder}</p>
    </li>
  );
}

export default async function NearPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await getParish();
  const lang = p.lang;
  const s = strings(lang).diocese;
  const t = s.near;
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const radius = RADII.includes(Number(sp.r)) ? Number(sp.r) : 25;
  const place = q ? resolvePlace(q) : null;
  const now = localNow(TIME_ZONE);
  const results = place ? nearby(place.point, radius, lang, now) : [];
  if (place) {
    const host = (await headers()).get("host") ?? "";
    after(() => bump(host, "search", `${coarse(place.point)}:${results.length}`));
  }
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{s.kicker}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{t.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dim">{t.lede}</p>
          <form action="/diocese/near" method="get" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-col gap-1 text-sm font-semibold text-cream">
              {t.where}
              <input name="q" defaultValue={place?.kind === "point" ? "" : q} placeholder={t.placeholder} inputMode="text" autoComplete="postal-code" className="min-h-11 w-full rounded-sm border border-navy-line bg-navy-soft px-3 text-base text-cream placeholder:text-dim sm:w-64" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-cream">
              {t.radius}
              <select name="r" defaultValue={String(radius)} className="min-h-11 rounded-sm border border-navy-line bg-navy-soft px-3 text-base text-cream">
                {RADII.map((r) => (
                  <option key={r} value={r}>
                    {r} {t.milesShort}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="inline-flex min-h-11 items-center rounded-sm bg-gold px-5 text-sm font-semibold text-navy hover:bg-gold-light">
              {t.go}
            </button>
            <Locate label={t.useLocation} busy={t.locating} radius={radius} />
          </form>
        </div>
      </section>
      <DioceseNav lang={lang} current="near" />
      <Band tone="paper">
        {q && !place ? <p className="text-lg text-ink">{t.badPlace}</p> : null}
        {place ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-marian">{place.label ? t.from(place.label) : t.count(results.length, radius)}</p>
            {place.label ? <p className="mt-1 text-ink-soft">{t.count(results.length, radius)}</p> : null}
            {results.length ? (
              <ul className="mt-6 grid gap-5 lg:grid-cols-2">
                {results.map((r) => (
                  <Card key={r.id} p={r} lang={lang} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-lg text-ink">{t.noResults(radius)}</p>
            )}
          </>
        ) : null}
        <p className="mt-10 text-sm text-ink-soft">
          <Link href="/diocese" className="font-semibold text-marian underline decoration-marian/40 underline-offset-4">
            {t.all}
          </Link>
        </p>
      </Band>
    </>
  );
}
