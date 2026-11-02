import { calendarFeed, singleEvent } from "@/lib/ics";
import { getParish } from "@/lib/parish";

export const dynamic = "force-dynamic";

/**
 * /calendar.ics        the whole parish calendar, for subscribing
 * /calendar.ics?e=<id> one event, for "add to calendar" (id from lib/ics.ts)
 */
export async function GET(req: Request) {
  const p = await getParish();
  const id = new URL(req.url).searchParams.get("e");
  const body = id ? singleEvent(p, id) : calendarFeed(p);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `${id ? "attachment" : "inline"}; filename="${id ? id : p.slug}.ics"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
