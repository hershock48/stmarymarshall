import Link from "next/link";
import {
  ADORATION,
  CONFESSION,
  CONFESSION_NOTE,
  DAY_NAMES,
  fmtDate,
  fmtTime,
  groupedMasses,
  localNow,
  nextService,
  upcomingSpecials,
  whenWord,
  type Service,
} from "@/lib/schedule";
import { LINKS, SITE } from "@/lib/site";

/**
 * The Mass card and the full schedule. Both read the parish clock at render
 * time, so any page that mounts them must be dynamic.
 */

function Row({ s }: { s: Service }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-navy-line py-2.5 last:border-0">
      <span className="text-cream">{s.label ?? DAY_NAMES[s.day]}</span>
      <span className="font-semibold tabular-nums text-gold-light">
        {fmtTime(s.start)}
        {s.end ? ` to ${fmtTime(s.end)}` : ""}
      </span>
    </li>
  );
}

/** The three tiles: next Mass, next Confession, next Adoration. */
export function NextUp() {
  const now = localNow();
  const mass = nextService(upcomingMassesWithVigilLabel(), now);
  const conf = nextService(CONFESSION, now, []);
  const ador = nextService(ADORATION, now, []);
  const tiles = [
    { name: "Next Mass", n: mass, href: "/mass-times" },
    { name: "Next Confession", n: conf, href: "/mass-times#confession" },
    { name: "Next Adoration", n: ador, href: "/mass-times#adoration" },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <li key={t.name}>
          <Link href={t.href} className="block rounded-sm border border-navy-line bg-navy-soft/80 p-5 transition-colors hover:border-gold">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{t.name}</p>
            {t.n ? (
              <>
                <p className="display mt-2 text-3xl leading-none text-cream">
                  {whenWord(t.n)} {t.n.time}
                </p>
                <p className="mt-2 text-sm text-dim">{t.n.label}</p>
              </>
            ) : (
              <p className="mt-2 text-dim">See the schedule</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function upcomingMassesWithVigilLabel() {
  return groupedMasses().weekend.concat(groupedMasses().weekday);
}

export function FullSchedule() {
  const now = localNow();
  const { weekend, weekday } = groupedMasses();
  const specials = upcomingSpecials(now);
  return (
    <div className="grid items-start gap-8 lg:grid-cols-3">
      <div className="rounded-sm border border-navy-line bg-navy-soft/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Mass</h2>
        <p className="mt-3 text-xs uppercase tracking-wider text-dim">Weekend</p>
        <ul className="mt-1">
          {weekend.map((m) => (
            <Row key={m.day + m.start} s={{ ...m, label: m.day === 6 ? "Saturday Vigil" : "Sunday" }} />
          ))}
        </ul>
        <p className="mt-5 text-xs uppercase tracking-wider text-dim">Weekday</p>
        <ul className="mt-1">
          {weekday.map((m) => (
            <Row key={m.day + m.start} s={m} />
          ))}
        </ul>
        {specials.length > 0 && (
          <>
            <p className="mt-5 text-xs uppercase tracking-wider text-dim">Coming up</p>
            <ul className="mt-1">
              {specials.map((s) => (
                <li key={s.date} className="flex items-baseline justify-between gap-4 border-b border-navy-line py-2.5 last:border-0">
                  <span className="text-cream">
                    {s.label}
                    <span className="block text-sm text-dim">{fmtDate(s.date)}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-gold-light">{fmtTime(s.start)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div id="confession" className="scroll-mt-24 rounded-sm border border-navy-line bg-navy-soft/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Confession</h2>
        <ul className="mt-3">
          {CONFESSION.map((c) => (
            <Row key={c.start} s={c} />
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-dim">{CONFESSION_NOTE}</p>
        <p className="mt-2 text-sm leading-relaxed text-dim">
          For an appointment, call{" "}
          <a href={SITE.phoneHref} className="text-cream underline underline-offset-4">
            {SITE.phone}
          </a>
          .
        </p>
      </div>

      <div id="adoration" className="scroll-mt-24 rounded-sm border border-navy-line bg-navy-soft/60 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Adoration</h2>
        <ul className="mt-3">
          {ADORATION.map((a) => (
            <Row key={a.start} s={a} />
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-dim">Eucharistic Adoration during the Saturday confession hour.</p>
        <p className="mt-6 text-sm leading-relaxed text-dim">
          Need another time?{" "}
          <a href={LINKS.findAMass} target="_blank" rel="noopener noreferrer" className="text-cream underline underline-offset-4">
            Find a Mass nearby
          </a>
          .
        </p>
      </div>
    </div>
  );
}
