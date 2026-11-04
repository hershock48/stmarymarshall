import { NextResponse } from "next/server";
import { after } from "next/server";
import { dioceseParishes } from "@/lib/diocese";
import { configured, send } from "@/lib/mail";
import { getDiocese } from "@/lib/parish";
import { bump } from "@/lib/tally";

/**
 * A wrong-time report from the finder. Same three honest states as the
 * parish forms: sent, unconfigured, failed, and the page says which. The
 * recipient is DIOCESE_MAIL_TO (the chancery or whoever keeps the finder),
 * falling back to MAIL_TO; the full report always goes to the log.
 */
export async function POST(req: Request) {
  const back = (state: string) => NextResponse.redirect(new URL(`/diocese/report?state=${state}`, req.url), 303);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back("failed");
  }
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim().slice(0, 2000) : "";
  };
  if (get("website")) return back("sent");
  const what = get("what");
  if (!what) return back("required");
  const id = get("parish");
  const parish = dioceseParishes(await getDiocese()).find((p) => p.id === id);
  const who = parish ? `${parish.name}, ${parish.town} (${parish.source}, ${parish.id})` : "parish not chosen";
  const text = `Parish: ${who}\n\nWhat is wrong:\n${what}\n\nFrom: ${get("email") || "no address given"}\nHost: ${new URL(req.url).host}`;
  const subject = `[finder] wrong time: ${parish ? parish.name : "unknown parish"}`;
  console.log(`[report] ${subject}\n${text}`);
  const to = process.env.DIOCESE_MAIL_TO || undefined;
  if (!configured(to)) return back("unconfigured");
  try {
    await send(subject, text, get("email") || undefined, to);
    after(() => bump(new URL(req.url).host, "form", "report"));
    return back("sent");
  } catch (err) {
    console.error("[report] send failed", err);
    return back("failed");
  }
}

export function GET(req: Request) {
  return NextResponse.redirect(new URL("/diocese/report", req.url), 303);
}
