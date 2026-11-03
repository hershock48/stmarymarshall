import { NextResponse } from "next/server";
import { COOKIE, configured, matches, token } from "@/lib/office";

/** The passcode form posts here; a match sets the cookie and goes to the view. */
export async function POST(req: Request) {
  const back = (q: string) => NextResponse.redirect(new URL(`/diocese/office${q}`, req.url), 303);
  if (!configured()) return back("");
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back("?no=1");
  }
  const code = String(form.get("code") ?? "");
  if (!matches(code)) return back("?no=1");
  const res = back("");
  // Secure only where there is HTTPS; on a plain `next start` the cookie would otherwise never come back and the form would loop.
  res.cookies.set(COOKIE, token(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && !/^(localhost|127\.0\.0\.1)(:|$)/.test(new URL(req.url).host), path: "/diocese/office", maxAge: 60 * 60 * 12 });
  return res;
}
