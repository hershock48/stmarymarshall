import type { Lang } from "@/lib/i18n";
import type { Diocese, VoiceEntry } from "@/lib/types";

/**
 * The bishop's voice, read two ways: the diocese's own curated list
 * (dioceses/<slug>/voice.ts) and, for the page's tail, the newest uploads
 * on the diocese's YouTube channel through YouTube's public RSS feed, cached
 * an hour. The feed read never blocks a page: on any failure the list is
 * empty and the page says nothing about it.
 */
export function voiceEntries(d: Diocese, lang: Lang): VoiceEntry[] {
  // The parish's language first, the other language after, newest first in each.
  return [...d.voice].sort((a, b) => (a.lang === lang ? 0 : 1) - (b.lang === lang ? 0 : 1) || b.date.localeCompare(a.date));
}

/** The newest entry in the parish's language, or the newest at all. */
export function latestVoice(d: Diocese, lang: Lang): VoiceEntry | null {
  const mine = d.voice.filter((v) => v.lang === lang).sort((a, b) => b.date.localeCompare(a.date));
  return mine[0] ?? [...d.voice].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

export function pairOf(d: Diocese, v: VoiceEntry): VoiceEntry | undefined {
  return v.pair ? d.voice.find((x) => x.id === v.pair) : undefined;
}

export const thumb = (youtube: string) => `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`;
export const watchUrl = (youtube: string) => `https://www.youtube.com/watch?v=${youtube}`;
export const embedUrl = (youtube: string) => `https://www.youtube-nocookie.com/embed/${youtube}`;

export type ChannelVideo = { id: string; title: string; published: string };

export async function channelVideos(d: Diocese, limit = 8): Promise<ChannelVideo[]> {
  if (!d.youtubeChannelId) return [];
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${d.youtubeChannelId}`, { next: { revalidate: 3600 }, headers: { "user-agent": "Mozilla/5.0 (Narthex; +https://www.glazedweb.com)" } });
    if (!res.ok) return [];
    const xml = await res.text();
    const out: ChannelVideo[] = [];
    const entries = xml.split("<entry>").slice(1);
    for (const e of entries) {
      const id = /<yt:videoId>([^<]+)</.exec(e)?.[1];
      const title = /<title>([^<]*)</.exec(e)?.[1];
      const published = /<published>([^<]+)</.exec(e)?.[1];
      if (id && title && published) out.push({ id, title: decode(title), published: published.slice(0, 10) });
      if (out.length >= limit) break;
    }
    return out;
  } catch {
    return [];
  }
}

function decode(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "’");
}
