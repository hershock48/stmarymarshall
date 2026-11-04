import { dioceseEvents, dioceseFileEvent } from "@/lib/diocese";
import { getDiocese } from "@/lib/parish";
import { dioceseFeed, type FeedEvent } from "@/lib/ics";

export const dynamic = "force-dynamic";

/**
 * /diocese/events.ics        every event across the diocese for ninety days, for subscribing
 * /diocese/events.ics?e=<id> one event from the diocese file, for "add to calendar"
 *
 * A platform parish's events are in its own /calendar.ics as well; here they
 * sit beside the chancery's dates so one subscription is the whole diocese.
 */
function toFeed(o: ReturnType<typeof dioceseEvents>[number], host: string): FeedEvent {
  const place = o.parish ? `${o.parish.name}, ${o.parish.church.street}, ${o.parish.church.city}, ${o.parish.church.state}` : `${o.where ? `${o.where}, ` : ""}${o.host}, ${o.town}, MI`;
  const url = o.parish ? `https://${o.parish.hosts[0]}/events` : o.href ?? `https://${host}/diocese/events`;
  return { ...o, location: o.where && o.parish ? `${o.where}, ${place}` : place, url };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = url.host;
  const id = url.searchParams.get("e");
  const d = await getDiocese();
  let body: string | null;
  if (id) {
    const o = dioceseFileEvent(d, id);
    body = o ? dioceseFeed(host, d.timeZone, o.title, [toFeed(o, host)]) : null;
  } else {
    body = dioceseFeed(host, d.timeZone, d.name, dioceseEvents(d, 90).map((o) => toFeed(o, host)));
  }
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `${id ? "attachment" : "inline"}; filename="${id ?? "diocese"}.ics"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
