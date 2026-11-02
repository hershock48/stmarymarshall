"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HomeLink from "@/components/HomeLink";
import Mark from "@/components/Mark";
import type { Mark as MarkData } from "@/lib/types";

/**
 * The header. Eight nav items from 1024px up, the Give button always, the
 * phone only where there is room. The mobile menu renders CLOSED in the
 * server HTML and opens on tap, so there is no layout shift on hydration.
 * With JavaScript off every link is still in the footer.
 *
 * Measured, not guessed: at 1024 the wordmark drops its second word so the
 * items and the button fit on one line; at 1280 it comes back; at 1536 the
 * phone joins. Below 1024 it is the menu button.
 *
 * Every word comes in as a prop (lib/i18n.ts) because this is a client
 * component and the parish is resolved on the server.
 */
export type HeaderProps = {
  shortName: string;
  nameRest: string;
  phone: string;
  phoneHref: string;
  nav: { href: string; label: string }[];
  mark: MarkData;
  pitchHost?: string;
  give: boolean;
  words: { home: string; main: string; mobile: string; openMenu: string; closeMenu: string; register: string; call: string; give: string };
};

export default function Header({ shortName, nameRest, phone, phoneHref, nav, mark, pitchHost, give, words }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu on navigation, during render against the last
  // seen path, so the closed menu never paints one frame open.
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  // Escape closes the open menu, as a keyboard user expects of a disclosure.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-navy-line bg-navy/95 backdrop-blur supports-[backdrop-filter]:bg-navy/85">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <HomeLink pitchHost={pitchHost} className="flex min-h-11 shrink-0 items-center gap-3 text-cream" aria-label={words.home}>
          <Mark mark={mark} size={34} className="text-gold" />
          <span className="display text-xl leading-none whitespace-nowrap sm:text-2xl">
            {shortName} {nameRest && <span className="hidden text-dim sm:inline lg:hidden xl:inline">{nameRest}</span>}
          </span>
        </HomeLink>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-5" aria-label={words.main}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center whitespace-nowrap text-[14px] font-semibold tracking-wide transition-colors xl:text-[15px] ${
                active(item.href) ? "text-gold" : "text-dim hover:text-cream"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={phoneHref} className="hidden min-h-11 items-center whitespace-nowrap text-sm text-dim transition-colors hover:text-cream md:flex lg:hidden 2xl:flex">
            {phone}
          </a>
          {give && (
            <Link href="/give" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm bg-gold px-4 text-sm font-semibold text-navy transition-colors hover:bg-gold-light">
              {words.give}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-navy-line text-cream lg:hidden"
          >
            <span className="sr-only">{open ? words.closeMenu : words.openMenu}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label={words.mobile} className="border-t border-navy-line bg-navy-soft lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className="block border-b border-navy-line py-3.5 text-lg font-semibold text-cream">
                {item.label}
              </Link>
            ))}
            <div className="mt-4 grid gap-3 pb-2">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-gold px-5 font-semibold text-gold-light">
                {words.register}
              </Link>
              <a href={phoneHref} className="inline-flex min-h-12 items-center justify-center rounded-sm border border-navy-line px-5 font-semibold text-cream">
                {words.call}
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
