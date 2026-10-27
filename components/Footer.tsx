import Link from "next/link";
import Mark from "@/components/Mark";
import GlazedPlate from "@/components/GlazedPlate";
import { CONFESSION, MASSES, fmtTime, DAY_NAMES } from "@/lib/schedule";
import { LINKS, NAV, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-navy-line bg-navy">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Mark size={34} className="text-gold" />
              <p className="display text-2xl leading-none text-cream">St. Mary</p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
              {SITE.tagline}. A parish of the{" "}
              <a href={SITE.diocese.url} className="underline decoration-navy-line underline-offset-4 hover:text-cream" target="_blank" rel="noopener noreferrer">
                {SITE.diocese.name}
              </a>
              .
            </p>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="St. Mary Marshall on Facebook"
              className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-navy-line text-dim transition-colors hover:border-gold hover:text-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13v-2c0-.6.4-1 1-1Z" />
              </svg>
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Mass</h2>
            <ul className="mt-4 space-y-2 text-sm text-dim">
              {MASSES.map((m) => (
                <li key={m.day + m.start}>
                  <span className="text-cream">{DAY_NAMES[m.day]}</span> {fmtTime(m.start)}
                  {m.day === 6 ? " (Vigil)" : ""}
                </li>
              ))}
              {CONFESSION.map((c) => (
                <li key={"c" + c.start} className="pt-2">
                  <span className="text-cream">Confession</span> {DAY_NAMES[c.day]} {fmtTime(c.start)} to {fmtTime(c.end!)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Visit</h2>
            <address className="mt-4 space-y-3 text-sm not-italic leading-relaxed text-dim">
              <p>
                <span className="text-cream">Church</span>
                <br />
                {SITE.church.street}, {SITE.church.corner}
                <br />
                {SITE.church.city}, {SITE.church.state} {SITE.church.zip}
              </p>
              <p>
                <span className="text-cream">Office and mail</span>
                <br />
                {SITE.office.street}
                <br />
                {SITE.office.city}, {SITE.office.state} {SITE.office.zip}
              </p>
              <p>
                <a href={SITE.phoneHref} className="hover:text-cream">
                  {SITE.phone}
                </a>
                <br />
                <a href={`mailto:${SITE.email}`} className="hover:text-cream">
                  {SITE.email}
                </a>
              </p>
            </address>
            <a href={SITE.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block min-h-6 text-sm text-gold underline underline-offset-4 hover:text-gold-light">
              Get directions
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Pages</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-dim md:grid-cols-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block min-h-6 hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/register" className="inline-block min-h-6 hover:text-cream">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/mass-intentions" className="inline-block min-h-6 hover:text-cream">
                  Mass intentions
                </Link>
              </li>
              <li>
                <Link href="/prayer-request" className="inline-block min-h-6 hover:text-cream">
                  Prayer request
                </Link>
              </li>
              <li>
                <a href={LINKS.swmCatholic} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 hover:text-cream">
                  Southwest Michigan Catholic
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-navy-line pt-6 text-xs text-dim">
          <p>
            © {new Date().getFullYear()} {SITE.parish}, Marshall, Michigan.
          </p>
        </div>
      </div>

      {/* Glazed Web signs off below the parish's footer, not inside it. */}
      <GlazedPlate line="Built by" />
    </footer>
  );
}
