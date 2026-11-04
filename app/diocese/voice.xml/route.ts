import { rssDate } from "@/lib/rss";
import { getDiocese } from "@/lib/parish";
import { watchUrl } from "@/lib/voice";

export const dynamic = "force-dynamic";

/**
 * The bishop's voice as RSS 2.0: every listed message, newest first, with
 * a link to the recording. An entry with an `audio` file carries it as an
 * enclosure, which is what makes an item an episode in a podcast app; the
 * video entries are links until hosted video gives them a file.
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(req: Request) {
  const d = await getDiocese();
  const base = `https://${new URL(req.url).host}`;
  const items = [...d.voice]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((v) => {
      const link = v.youtube ? watchUrl(v.youtube) : `${base}/diocese/voice`;
      const enclosure = v.audio ? `<enclosure url="${esc(v.audio.url)}" type="${esc(v.audio.type)}"${v.audio.bytes ? ` length="${v.audio.bytes}"` : ""} />` : "";
      return `<item><title>${esc(v.title)}</title><link>${esc(link)}</link><guid isPermaLink="false">${esc(v.id)}</guid><pubDate>${rssDate(v.date, d.timeZone, false)}</pubDate><description>${esc(v.lede)}</description>${enclosure}</item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(`The bishop’s voice · ${d.name}`)}</title><link>${base}/diocese/voice</link><atom:link href="${base}/diocese/voice.xml" rel="self" type="application/rss+xml" /><description>${esc(`Messages, homilies and talks from ${d.bishop} to the ${d.name}, newest first.`)}</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
