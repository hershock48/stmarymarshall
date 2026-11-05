import { NextResponse, type NextRequest } from "next/server";
import { dioceseSiteSlug, isDioceseHost, knowsPath, knowsSitePath, letterHost, letterSlugForHost, parishForHost } from "@/lib/paths";

/**
 * Two kinds of request are steered to a path nothing matches, so the
 * real not-found page renders on the server with a 404 status and the
 * visitor's URL unchanged.
 *
 * 1. Unknown one-segment paths. app/[page]/page.tsx matches every
 *    one-segment path so a parish's own pages can live at /<slug>. For a
 *    path the parish does not have it calls notFound(), and in Next 16 a
 *    notFound() thrown from a matched dynamic segment answers with an
 *    empty, client-rendered body (vercel/next.js issues 98954, 99793,
 *    100596; fix pending in PR 100648): no h1, no nav, no lang, blank with
 *    scripts off. A path that matches no route at all renders
 *    not-found.tsx properly. The same goes for the data-dependent pages a
 *    parish lacks (San Felipe has no /give); the pages keep their
 *    notFound() as a safety net.
 *
 * 2. A letter asked for on a host that is not its own. The letters live
 *    in public/pitch/<slug>/, so without this every letter would be a
 *    second URL on every other host. (A next.config rewrite to /_not-found
 *    did this before, but on Vercel that answered 200.)
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const letter = /^\/pitch\/([^/]+)(\/|$)/.exec(pathname);
  if (letter) {
    return letterHost(letter[1]) === host ? NextResponse.next() : gone(req);
  }
  // 2b. A diocese letter's two companion pages, on the letter's own host
  //     only: /terms (the agreement's text, written by tools/terms-page.mjs)
  //     and /brief (one page to print). They are files beside the letter;
  //     a diocese without one falls through to the 404.
  const companion = /^\/(terms|brief)\/?$/.exec(pathname);
  const letterSlug = companion ? letterSlugForHost(host) : null;
  if (companion && letterSlug) {
    const url = req.nextUrl.clone();
    url.pathname = `/pitch/${letterSlug}/${companion[1]}.html`;
    return NextResponse.rewrite(url);
  }
  // 2c. A diocese's own website on the platform. Its pages live under
  //     /ds in the app (app/ds), out of the way of every parish's paths,
  //     and are served at the root of the site's host: / is the diocese's
  //     home, /about its About page. The diocese pages under /diocese are
  //     served as they are. Nobody else's host may reach /ds.
  const siteSlug = dioceseSiteSlug(host);
  if (/^\/ds(\/|$)/.test(pathname)) return gone(req);
  if (siteSlug) {
    const h = new Headers(req.headers);
    h.delete("x-path");
    h.set("x-path", pathname);
    // The sitemap and the manifest the platform serves are a parish's, so on the diocese's site they are nobody's until it has its own.
    if (/^\/(diocese(\/|$)|robots\.txt$|__404\/)/.test(pathname)) return NextResponse.next({ request: { headers: h } });
    // An address the diocese never had is nobody's page (see 1. above for why this is decided here).
    const seg = /^\/([^/.]+)\/?$/.exec(pathname);
    if (pathname !== "/" && !(seg && knowsSitePath(siteSlug, seg[1]))) return gone(req);
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/ds" : `/ds/${seg![1]}`;
    return NextResponse.rewrite(url, { request: { headers: h } });
  }
  // 3. The diocese host answers the finder at / and the diocese pages only;
  //    a parish path asked for there is nobody's page. The rewrite of / is
  //    done here rather than in next.config so DIOCESE_DEFAULT (lib/paths.ts)
  //    works on a local server too.
  if (isDioceseHost(host)) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/diocese/near";
      const h = new Headers(req.headers);
      h.delete("x-path");
      h.set("x-path", "/");
      return NextResponse.rewrite(url, { request: { headers: h } });
    }
    if (!/^\/(diocese(\/|$)|robots\.txt$|sitemap\.xml$|manifest\.webmanifest$|__404\/)/.test(pathname)) return gone(req);
  }
  const one = /^\/([^/.]+)\/?$/.exec(pathname);
  if (one && !knowsPath(parishForHost(host), one[1])) return gone(req);
  // The layout counts pages served, by path (lib/tally.ts), and cannot see
  // the URL on its own, so the path rides along as a request header.
  const h = new Headers(req.headers);
  h.delete("x-path");
  h.set("x-path", pathname);
  return NextResponse.next({ request: { headers: h } });
}

function gone(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = `/__404${req.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip the paths Next and the public folder serve on their own.
  matcher: ["/((?!_next/|api/|parishes/|dioceses/|favicon\\.ico).*)"],
};
