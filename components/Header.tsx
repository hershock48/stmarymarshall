"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Mark from "@/components/Mark";
import { NAV, SITE } from "@/lib/site";

/**
 * The header. Eight nav items from 1024px up, the Give button always, the
 * phone only where there is room. The mobile menu renders CLOSED in the
 * server HTML and opens on tap, so there is no layout shift on hydration
 * (glaze.md). With JavaScript off every link is still in the footer.
 *
 * Measured, not guessed: at 1024 the wordmark drops "Catholic Church" so
 * the eight items and the button fit on one line; at 1280 it comes back;
 * at 1536 the phone number joins. Below 1024 it is the menu button.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on navigation, during render against the last
  // seen path, so the closed menu never paints one frame open.
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-navy-line bg-navy/95 backdrop-blur supports-[backdrop-filter]:bg-navy/85">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3 text-cream" aria-label={`${SITE.name} home`}>
          <Mark size={34} className="text-gold" />
          <span className="display text-xl leading-none whitespace-nowrap sm:text-2xl">
            St. Mary <span className="hidden text-dim sm:inline lg:hidden xl:inline">Catholic Church</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-5" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap text-[14px] font-semibold tracking-wide transition-colors xl:text-[15px] ${
                  active ? "text-gold" : "text-dim hover:text-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a href={SITE.phoneHref} className="hidden min-h-11 items-center whitespace-nowrap text-sm text-dim transition-colors hover:text-cream md:flex lg:hidden 2xl:flex">
            {SITE.phone}
          </a>
          <Link
            href="/give"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm bg-gold px-4 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
          >
            Give
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-navy-line text-cream lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-navy-line bg-navy-soft lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="block border-b border-navy-line py-3.5 text-lg font-semibold text-cream"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 grid gap-3 pb-2">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-gold px-5 font-semibold text-gold-light">
                Register with the parish
              </Link>
              <a href={SITE.phoneHref} className="inline-flex min-h-12 items-center justify-center rounded-sm border border-navy-line px-5 font-semibold text-cream">
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
