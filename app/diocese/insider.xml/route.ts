import { dioceseEvents } from "@/lib/diocese";
import { getDiocese } from "@/lib/parish";
import { fmtRange } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { liveAnnouncements } from "@/lib/news";
import { ALL } from "@/lib/paths";
import { fmtDate, localNow } from "@/lib/schedule";
import { latestVoice, watchUrl } from "@/lib/voice";
import { liveNotices } from "@/lib/notices";

export const dynamic = "force-dynamic";

/**
 * This week in the diocese as RSS 2.0, the same rows as /diocese/insider:
 * notices, the bishop's newest message, what the parishes offered, and the
 * next two weeks of dates. Paste it into Flocknote, Mailchimp or any email
 * tool that reads a feed and the weekly email writes itself.
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(req: Request) {
  const d = await getDiocese();
  const base = `https://${new URL(req.url).host}`;
  const lang = "en" as const;
  const t = strings(lang).diocese.news;
  const now = localNow(d.timeZone);
  const item = (id: string, title: string, link: string, date: string, desc: string, cat: string) => `<item><title>${esc(title)}</title><link>${esc(link)}</link><guid isPermaLink="false">${esc(id)}</guid><pubDate>${new Date(`${date}T12:00:00-05:00`).toUTCString()}</pubDate><description>${esc(desc)}</description><category>${cat}</category></item>`;
  const items: string[] = [];
  for (const n of liveNotices(d.notices, now.iso)) items.push(item(`notice-${n.id}`, n.title, n.href ? (n.href.startsWith("http") ? n.href : `${base}${n.href}`) : `${base}/diocese/insider`, n.from, n.body, "diocese"));
  const b = latestVoice(d, lang);
  if (b) items.push(item(`bishop-${b.id}`, b.title, b.youtube ? watchUrl(b.youtube) : `${base}/diocese/voice`, b.date, b.lede, "bishop"));
  for (const q of ALL) for (const a of liveAnnouncements(q.announcements?.filter((x) => x.diocesan), now.iso, lang)) items.push(item(`${q.slug}-${a.id}`, `${a.title} (${q.shortName})`, a.href ?? `https://${q.hosts[0]}/news`, a.date, a.body ?? "", "parish"));
  for (const o of dioceseEvents(d, 14, now)) items.push(item(`event-${o.id}`, `${o.title}, ${o.host}, ${o.town}`, o.parish ? `https://${o.parish.hosts[0]}/events` : o.href ?? `${base}/diocese/events`, o.date, `${fmtDate(o.date, true, lang)}, ${fmtRange(o, lang)}${o.where ? `, ${o.where}` : ""}.${o.note ? ` ${o.note}` : ""}`, "event"));
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(`${t.digestTitle} · ${d.name}`)}</title><link>${base}/diocese/insider</link><atom:link href="${base}/diocese/insider.xml" rel="self" type="application/rss+xml" /><description>${esc(t.digestLede)}</description><language>en-us</language>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=900" } });
}
