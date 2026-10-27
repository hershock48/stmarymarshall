import { NextResponse } from "next/server";
import { configured, send } from "@/lib/mail";
import { isRequestKind, REQUESTS, summarizeRequest } from "@/lib/requests";

/**
 * Mass intention and prayer request forms. Same three honest states as the
 * registration route: sent, unconfigured, failed. The visitor is told which.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const data: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") data[k] = v.slice(0, 2000);

  const kind = data.kind;
  if (!isRequestKind(kind)) return NextResponse.redirect(new URL("/", req.url), 303);
  const page = `/${kind}`;
  const thanks = (state: string) => NextResponse.redirect(new URL(`/register/thanks?state=${state}&kind=${kind}`, req.url), 303);

  if (data.website) return thanks("sent");
  const spec = REQUESTS[kind];
  if (spec.fields.some((f) => f.required && !data[f.name]?.trim())) {
    return NextResponse.redirect(new URL(`${page}?error=required`, req.url), 303);
  }

  const text = summarizeRequest(kind, data);
  const subject = `${spec.subject}: ${(data.intention_for ?? data.pray_for ?? "").trim().slice(0, 80)}`;
  console.log(`[${kind}] ${subject}\n${text}`);

  if (!configured()) return thanks("unconfigured");
  try {
    await send(subject, text, data.email?.trim() || undefined);
    return thanks("sent");
  } catch (err) {
    console.error(`[${kind}] send failed`, err);
    return thanks("failed");
  }
}
