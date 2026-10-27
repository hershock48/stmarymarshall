import { NextResponse } from "next/server";
import { configured, send } from "@/lib/mail";
import { summarize } from "@/lib/register";

/**
 * Accepts the registration form (a plain POST, form-encoded) and sends it
 * to the office by SMTP. Three honest outcomes (glaze.md):
 *
 *   sent          the email went
 *   unconfigured  SMTP is not set up yet; the full payload is in the log
 *   failed        SMTP is set up and the send threw; payload in the log
 *
 * The visitor is told which. The form never pretends. A submission with the
 * hidden "website" field filled is a bot and is dropped with a 303 to the
 * same thanks page so nothing learns from the response.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const data: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") data[k] = v.slice(0, 2000);

  const thanks = (state: string) => NextResponse.redirect(new URL(`/register/thanks?state=${state}`, req.url), 303);

  if (data.website) return thanks("sent");
  if (!data.family_name?.trim()) {
    return NextResponse.redirect(new URL("/register?error=name", req.url), 303);
  }

  const text = summarize(data);
  const subject = `Parish registration: ${data.family_name.trim()}`;
  // The log is the record until mail is configured, and the backup after.
  console.log(`[register] ${subject}\n${text}`);

  if (!configured()) return thanks("unconfigured");
  try {
    await send(subject, text, data.email?.trim() || undefined);
    return thanks("sent");
  } catch (err) {
    console.error("[register] send failed", err);
    return thanks("failed");
  }
}
