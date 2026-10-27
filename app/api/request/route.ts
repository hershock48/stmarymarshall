import { NextResponse } from "next/server";
import { configured, send } from "@/lib/mail";
import { isRequestKind, REQUESTS, summarizeRequest } from "@/lib/requests";

/**
 * Mass intention and prayer request forms. Same three honest states as the
 * registration route: sent, unconfigured, failed. The visitor is told which.
 */
export async function POST(req: Request) {
  const back = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back("/");
  }
  const data: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") data[k] = v.slice(0, 2000);

  const kind = data.kind;
  if (!isRequestKind(kind)) return back("/");
  const page = `/${kind}`;
  const thanks = (state: string) => back(`/register/thanks?state=${state}&kind=${kind}`);

  if (data.website) return thanks("sent");
  const spec = REQUESTS[kind];
  if (spec.fields.some((f) => f.required && !data[f.name]?.trim())) return back(`${page}?error=required`);

  const text = summarizeRequest(kind, data);
  const subject = `${spec.subject}: ${(data.intention_for ?? data.pray_for ?? "").trim().slice(0, 80)}`;
  console.log(`[${kind}] ${subject}\n${text}`);

  if (!configured()) return thanks("unconfigured");
  try {
    await send(subject, text, data.email);
    return thanks("sent");
  } catch (err) {
    console.error(`[${kind}] send failed`, err);
    return thanks("failed");
  }
}

export function GET(req: Request) {
  return NextResponse.redirect(new URL("/", req.url), 303);
}
