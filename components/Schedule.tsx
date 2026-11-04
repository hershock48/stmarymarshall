import Link from "next/link";
import { strings } from "@/lib/i18n";
import { datedMasses, fmtDate, fmtTime, groupedMasses, localNow, nextService, upcomingSpecials, whenWord } from "@/lib/schedule";
import type { Parish, Service } from "@/lib/types";

/**
 * The Mass tiles and the full schedule for a parish. Both read the parish
 * clock at render time, so any page that mounts them must be dynamic.
 */

function Row({ s, days, to }: { s: Service; days: readonly string[]; to: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-navy-line py-2.5 last:border-0">
      <span className="text-cream">
        {s.label ?? days[s.day]}
        {s.lang && <span className="ml-2 text-xs uppercase tracking-wider text-dim">{s.lang}</span>}
        {s.where && <span className="block text-sm text-dim">{s.where}</span>}
      </span>
      <span className="font-semibold tabular-nums text-gold-light">
        {fmtTime(s.start)}
        {s.end ? ` ${to} ${fmtTime(s.end)}` : ""}
      </span>
    </li>
  );
}

/** The three tiles: next Mass, next Confession, next Adoration. */
export function NextUp({ parish: p }: { parish: Parish }) {
  const s = strings(p.lang).schedule;
  const now = localNow(p.timeZone);
  const tiles = [
    { name: s.nextMass, n: nextService(p.masses, now, datedMasses(p), p.lang), href: "/mass-times" },
    ...(p.confession.length ? [{ name: s.nextConfession, n: nextService(p.confession, now, [], p.lang), href: "/mass-times#confession" }] : []),
    ...(p.adoration.length ? [{ name: s.nextAdoration, n: nextService(p.adoration, now, [], p.lang), href: "/mass-times#adoration" }] : []),
  ];
  return (
    <ul className={`grid gap-3 ${tiles.length === 3 ? "sm:grid-cols-3" : tiles.length === 2 ? "sm:grid-cols-2" : ""}`}>
      {tiles.map((t) => (
        <li key={t.name}>
          <Link href={t.href} className="block rounded-sm border border-navy-line bg-navy-soft/80 p-5 transition-colors hover:border-gold">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{t.name}</p>
            {t.n ? (
              <>
                <p className="display mt-2 text-3xl leading-none text-cream">
                  {whenWord(t.n, p.lang)} {t.n.time}
                </p>
                <p className="mt-2 text-sm text-dim">{t.n.label}</p>
              </>
            ) : (
              <p className="mt-2 text-dim">{s.seeSchedule}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FullSchedule({ parish: p }: { parish: Parish }) {
  const all = strings(p.lang);
  const s = all.schedule;
  const now = localNow(p.timeZone);
  const { weekend, weekday } = groupedMasses(p.masses);
  const specials = upcomingSpecials(p, now);
  const cols = 1 + (p.confession.length ? 1 : 0) + (p.adoration.length ? 1 : 0);
  return (
    <div className={`grid items-start gap-8 ${cols === 3 ? "lg:grid-cols-3" : cols === 2 ? "lg:grid-cols-2" : ""}`}>
      <div className="rounded-sm border border-navy-line bg-navy-soft/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{s.mass}</h2>
        <p className="mt-3 text-xs uppercase tracking-wider text-dim">{s.weekend}</p>
        <ul className="mt-1">
          {weekend.map((m, i) => (
            <Row key={i} s={{ ...m, label: m.label ?? (m.day === 6 ? s.saturdayVigil : s.sunday) }} days={all.days} to={s.to} />
          ))}
        </ul>
        {weekday.length > 0 && (
          <>
            <p className="mt-5 text-xs uppercase tracking-wider text-dim">{s.weekday}</p>
            <ul className="mt-1">
              {weekday.map((m, i) => (
                <Row key={i} s={m} days={all.days} to={s.to} />
              ))}
            </ul>
          </>
        )}
        {specials.length > 0 && (
          <>
            <p className="mt-5 text-xs uppercase tracking-wider text-dim">{s.comingUp}</p>
            <ul className="mt-1">
              {specials.map((sp) => (
                <li key={sp.date + sp.start} className="flex items-baseline justify-between gap-4 border-b border-navy-line py-2.5 last:border-0">
                  <span className="text-cream">
                    {sp.label}
                    <span className="block text-sm text-dim">{fmtDate(sp.date, false, p.lang)}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-gold-light">{fmtTime(sp.start)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {p.confession.length > 0 && (
        <div id="confession" className="scroll-mt-24 rounded-sm border border-navy-line bg-navy-soft/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{s.confession}</h2>
          <ul className="mt-3">
            {p.confession.map((c, i) => (
              <Row key={i} s={c} days={all.days} to={s.to} />
            ))}
          </ul>
          {p.confessionNote && <p className="mt-4 text-sm leading-relaxed text-dim">{p.confessionNote}</p>}
          <p className="mt-2 text-sm leading-relaxed text-dim">
            {s.appointment}{" "}
            <a href={p.phoneHref} className="text-cream underline underline-offset-4">
              {p.phone}
            </a>
            .
          </p>
        </div>
      )}

      {p.adoration.length > 0 && (
        <div id="adoration" className="scroll-mt-24 rounded-sm border border-navy-line bg-navy-soft/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{s.adoration}</h2>
          <ul className="mt-3">
            {p.adoration.map((a, i) => (
              <Row key={i} s={a} days={all.days} to={s.to} />
            ))}
          </ul>
          {p.adorationNote && <p className="mt-4 text-sm leading-relaxed text-dim">{p.adorationNote}</p>}
          <p className="mt-6 text-sm leading-relaxed text-dim">
            {s.anotherTime}{" "}
            <a href={p.geo ? `/diocese/near?q=${p.geo.lat.toFixed(2)},${p.geo.lng.toFixed(2)}&r=25` : p.findAMass} {...(p.geo ? {} : { target: "_blank", rel: "noopener noreferrer" })} className="text-cream underline underline-offset-4">
              {s.findAMass}
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
