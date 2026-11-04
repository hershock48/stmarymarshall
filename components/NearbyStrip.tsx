import Link from "next/link";
import { nearby } from "@/lib/diocese";
import { dioceseOfParish } from "@/dioceses";
import { strings } from "@/lib/i18n";
import { localNow, whenWord } from "@/lib/schedule";
import type { Parish } from "@/lib/types";

/**
 * On a parish's Mass times page: the three nearest other parishes and
 * their next Mass, from the diocese finder, with a link into it. The one
 * line that connects a parish site to every other.
 */
export default function NearbyStrip({ parish: p }: { parish: Parish }) {
  if (!p.geo) return null;
  const s = strings(p.lang).diocese;
  const near = nearby(dioceseOfParish(p), p.geo, 30, p.lang, localNow(p.timeZone)).filter((n) => n.id !== p.slug && n.next.mass).slice(0, 3);
  if (!near.length) return null;
  const q = `${p.geo.lat.toFixed(4)},${p.geo.lng.toFixed(4)}`;
  return (
    <section aria-labelledby="nearby" className="border-t border-navy-line bg-navy-soft">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 id="nearby" className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {s.nav.strip}
        </h2>
        <p className="mt-1 text-dim">{s.nav.stripLede}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {near.map((n) => (
            <li key={n.id} className="rounded-sm border border-navy-line p-4">
              <p className="font-semibold text-cream">
                {n.name} <span className="text-sm font-normal text-dim">· {n.town}, {s.near.away(n.miles < 10 ? n.miles.toFixed(1) : String(Math.round(n.miles)))}</span>
              </p>
              <p className="mt-1 text-gold-light">
                {whenWord(n.next.mass!, p.lang)} {n.next.mass!.time}
                {n.next.mass!.label && n.next.mass!.label !== n.next.mass!.dayName ? <span className="ml-2 text-sm text-dim">{n.next.mass!.label}</span> : null}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href={`/diocese/near?q=${q}&r=25`} className="inline-block min-h-6 font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
            {s.nav.near}
          </Link>
        </p>
      </div>
    </section>
  );
}
