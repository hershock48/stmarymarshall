import { NextResponse, type NextRequest } from "next/server";
import { knowsPath, parishForHost } from "@/lib/paths";

/**
 * Unknown one-segment paths are steered around the catch-all route.
 *
 * app/[page]/page.tsx matches every one-segment path so a parish's own
 * pages can live at /<slug>. For a path the parish does not have it calls
 * notFound(), and in Next 16 a notFound() thrown from a matched dynamic
 * segment answers with an empty, client-rendered body (vercel/next.js
 * issues 98954, 99793, 100596; fix pending in PR 100648): a 404 with no
 * h1, no nav and no lang, blank with scripts off. A path that matches no
 * route at all renders not-found.tsx on the server as it should. So the
 * request is rewritten to a two-segment path nothing matches, and the
 * proper 404 page comes back, with the visitor's URL unchanged.
 *
 * The same goes for the data-dependent pages a parish lacks (San Felipe
 * has no /give); the pages keep their notFound() as a safety net.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const m = /^\/([^/.]+)\/?$/.exec(pathname);
  if (!m) return NextResponse.next();
  const parish = parishForHost(req.headers.get("host"));
  if (knowsPath(parish, m[1])) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/__404${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip the paths Next and the public folder serve on their own.
  matcher: ["/((?!_next/|api/|parishes/|pitch/|diocese/|favicon\\.ico).*)"],
};
