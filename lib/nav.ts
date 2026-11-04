import { strings } from "@/lib/i18n";
import { hasWatch } from "@/lib/paths";
import type { Parish } from "@/lib/types";

/**
 * The header nav for a parish: the core pages every parish has, then the
 * parish's own extra pages. Eight items fit from 1024px; a parish with many
 * extra pages gets them in the footer and on the home page instead.
 */
export function navFor(p: Parish): { href: string; label: string }[] {
  const s = strings(p.lang).nav;
  const core = [
    { href: "/new", label: s.newHere },
    { href: "/mass-times", label: s.massTimes },
    { href: "/about", label: s.about },
    { href: "/sacraments", label: s.sacraments },
    ...(p.formation.length ? [{ href: "/faith-formation", label: s.formation }] : []),
    ...(p.ministries.length ? [{ href: "/ministries", label: s.ministries }] : []),
    ...(p.events.length ? [{ href: "/events", label: s.calendar }] : []),
    ...(p.bulletins ? [{ href: "/bulletin", label: s.bulletin }] : []),
  ];
  return [...core, ...p.nav].slice(0, 8);
}

/** The pages under the nav: give, the forms, and the parish's own section pages. */
export function morePages(p: Parish): { href: string; label: string }[] {
  const s = strings(p.lang).nav;
  const nav = navFor(p);
  return [
    ...(p.give.url || p.give.extras?.length ? [{ href: "/give", label: s.give }] : []),
    ...(hasWatch(p) ? [{ href: "/watch", label: strings(p.lang).massTimes.watch }] : []),
    { href: "/news", label: strings(p.lang).diocese.news.nav },
    { href: "/register", label: s.register },
    { href: "/mass-intentions", label: s.massIntentions },
    { href: "/prayer-request", label: s.prayerRequest },
    ...p.pages.filter((pg) => !nav.some((n) => n.href === `/${pg.slug}`)).map((pg) => ({ href: `/${pg.slug}`, label: pg.title })),
  ];
}

/** Every path a parish answers on, for the sitemap. */
export function allPaths(p: Parish): string[] {
  return ["/", ...navFor(p).map((n) => n.href), ...morePages(p).map((n) => n.href)].filter((v, i, a) => a.indexOf(v) === i);
}
