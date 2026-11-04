import { rssDate } from "@/lib/rss";
import { strings } from "@/lib/i18n";
import { parishWeek, weekFeed } from "@/lib/news";
import { getParish } from "@/lib/parish";
import { fmtDate, localNow } from "@/lib/schedule";

export const dynamic = "force-dynamic";

/**
 * The parish's week as RSS 2.0: the same rows as /news, for Flocknote,
 * Mailchimp or any tool that turns a feed into an email, and for anyone's
 * reader. Items are keyed so a re-fetch updates rather than duplicates.
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(req: Request) {
  const p = await getParish();
  const base = `https://${new URL(req.url).host}`;
  const t = strings(p.lang).diocese.news;
  const items = weekFeed(parishWeek(p, localNow(p.timeZone), 7))
    .map((i) => {
      const link = i.href ? (i.href.startsWith("http") ? i.href : `${base}${i.href}`) : `${base}/news`;
      const desc = [i.when ? `${fmtDate(i.date, true, p.lang)}, ${i.when}.` : i.kind === "event" || i.kind === "mass" || i.kind === "holyDay" ? `${fmtDate(i.date, true, p.lang)}.` : "", i.body ?? ""].filter(Boolean).join(" ");
      return `<item><title>${esc(i.title)}</title><link>${esc(link)}</link><guid isPermaLink="false">${esc(`${p.slug}:${i.id}`)}</guid><pubDate>${rssDate(i.date, p.timeZone)}</pubDate><description>${esc(desc)}</description><category>${esc(i.kind)}</category></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(`${p.name}: ${t.title}`)}</title><link>${base}/news</link><atom:link href="${base}/news.xml" rel="self" type="application/rss+xml" /><description>${esc(t.lede(p.shortName))}</description><language>${p.lang === "es" ? "es-us" : "en-us"}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=900" } });
}
