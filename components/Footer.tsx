import Link from "next/link";
import Mark from "@/components/Mark";
import GlazedPlate from "@/components/GlazedPlate";
import { strings } from "@/lib/i18n";
import { fmtTime } from "@/lib/schedule";
import { morePages, navFor } from "@/lib/nav";
import type { Parish } from "@/lib/types";

export default function Footer({ parish: p }: { parish: Parish }) {
  const s = strings(p.lang);
  const f = s.footer;
  const nav = navFor(p);
  return (
    <footer className="border-t border-navy-line bg-navy">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Mark mark={p.mark} size={34} className="text-gold" />
              <p className="display text-2xl leading-none text-cream">{p.shortName}</p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
              {p.tagline}. {f.parishOf}{" "}
              <a href={p.diocese.url} className="underline decoration-navy-line underline-offset-4 hover:text-cream" target="_blank" rel="noopener noreferrer">
                {p.diocese.name}
              </a>
              .
            </p>
            <div className="mt-5 flex gap-3">
              {p.facebook && (
                <a href={p.facebook} target="_blank" rel="noopener noreferrer" aria-label={f.onFacebook(p.shortName)} className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-navy-line text-dim transition-colors hover:border-gold hover:text-gold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1Z" />
                  </svg>
                </a>
              )}
              {p.youtube && (
                <a href={p.youtube} target="_blank" rel="noopener noreferrer" aria-label={f.onYouTube(p.shortName)} className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-navy-line text-dim transition-colors hover:border-gold hover:text-gold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{f.mass}</h2>
            <ul className="mt-4 space-y-2 text-sm text-dim">
              {p.masses.map((m, i) => (
                <li key={i}>
                  <span className="text-cream">{s.days[m.day]}</span> {fmtTime(m.start)}
                  {m.lang ? ` (${m.lang})` : m.day === 6 && m.label?.toLowerCase().includes("vigil") ? ` (${f.vigil})` : ""}
                </li>
              ))}
              {p.confession.map((c, i) => (
                <li key={"c" + i} className="pt-2">
                  <span className="text-cream">{f.confession}</span> {s.days[c.day]} {fmtTime(c.start)}
                  {c.end ? ` ${s.schedule.to} ${fmtTime(c.end)}` : ""}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{f.visit}</h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-relaxed text-dim">
              <p>
                <span className="text-cream">{f.church}</span>
                <br />
                {p.church.street}
                {p.church.corner ? `, ${p.church.corner}` : ""}
                <br />
                {p.church.city}, {p.church.state} {p.church.zip}
              </p>
              {p.office && (
                <p>
                  <span className="text-cream">{f.officeAndMail}</span>
                  <br />
                  {p.office.street}
                  <br />
                  {p.office.city}, {p.office.state} {p.office.zip}
                </p>
              )}
              {p.officeHours && (
                <p>
                  <span className="text-cream">{f.officeHours}</span>
                  {p.officeHours.map((h) => (
                    <span key={h}>
                      <br />
                      {h}
                    </span>
                  ))}
                </p>
              )}
              <p>
                <a href={p.phoneHref} className="hover:text-cream">
                  {p.phone}
                </a>
                {p.email && (
                  <>
                    <br />
                    <a href={`mailto:${p.email}`} className="hover:text-cream">
                      {p.email}
                    </a>
                  </>
                )}
              </p>
            </address>
            <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block min-h-6 text-sm text-gold underline underline-offset-4 hover:text-gold-light">
              {f.directions}
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">{f.pages}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-dim md:grid-cols-1">
              {[...nav, ...morePages(p)].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block min-h-6 hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-line pt-6 text-xs text-dim">
          <p>
            © {new Date().getFullYear()} {p.parishName}, {p.church.city}, Michigan.
          </p>
        </div>
      </div>

      {/* Glazed Web signs off below the parish's footer, not inside it. */}
      <GlazedPlate line={p.credit} />
    </footer>
  );
}
