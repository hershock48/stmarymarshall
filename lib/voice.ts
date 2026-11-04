import type { Lang } from "@/lib/i18n";
import { CHANNEL_ID, VOICE, type VoiceEntry } from "@/parishes/diocese/voice";

/**
 * The bishop's voice, read two ways: the diocese's own curated list
 * (parishes/diocese/voice.ts) and, for the page's tail, the newest uploads
 * on the diocese's YouTube channel through YouTube's public RSS feed, cached
 * an hour. The feed read never blocks a page: on any failure the list is
 * empty and the page says nothing about it.
 */
export function voiceEntries(lang: Lang): VoiceEntry[] {
  // The parish's language first, the other language after, newest first in each.
  return [...VOICE].sort((a, b) => (a.lang === lang ? 0 : 1) - (b.lang === lang ? 0 : 1) || b.date.localeCompare(a.date));
}

/** The newest entry in the parish's language, or the newest at all. */
export function latestVoice(lang: Lang): VoiceEntry | null {
  const mine = VOICE.filter((v) => v.lang === lang).sort((a, b) => b.date.localeCompare(a.date));
  return mine[0] ?? [...VOICE].sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

export function pairOf(v: VoiceEntry): VoiceEntry | undefined {
  return v.pair ? VOICE.find((x) => x.id === v.pair) : undefined;
}

export const thumb = (youtube: string) => `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`;
export const watchUrl = (youtube: string) => `https://www.youtube.com/watch?v=${youtube}`;
export const embedUrl = (youtube: string) => `https://www.youtube-nocookie.com/embed/${youtube}`;

export type ChannelVideo = { id: string; title: string; published: string };

export async function channelVideos(limit = 8): Promise<ChannelVideo[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, { next: { revalidate: 3600 }, headers: { "user-agent": "Mozilla/5.0 (Narthex; +https://www.glazedweb.com)" } });
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
