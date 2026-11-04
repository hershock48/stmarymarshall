import type { Parish } from "@/lib/types";

/**
 * Where a parish's Mass can be watched, in order of preference:
 *
 *   "hosted"    Cloudflare Stream, when the parish has a live input and the
 *               account's customer code is set (STREAM_CUSTOMER_CODE). The
 *               player is Cloudflare's iframe; ingest is RTMP from the
 *               parish's own encoder; recordings are automatic. This is the
 *               priced add-on in docs/narthex-plan.md.
 *   "youtube"   The parish's YouTube channel: the live embed by channel id,
 *               which plays whatever the channel has live.
 *   "facebook"  A Facebook page: no embed (it would need Facebook's script
 *               on the page), so a link that opens the stream there.
 *   "link"      Any other livestream URL, as a link.
 *
 * A parish with none of these has no /watch page (lib/paths.ts hasWatch).
 */
export type WatchSource = { kind: "hosted"; iframe: string } | { kind: "youtube"; iframe: string; channel: string } | { kind: "facebook"; url: string } | { kind: "link"; url: string };

export function watchSource(p: Parish): WatchSource | null {
  const code = process.env.STREAM_CUSTOMER_CODE;
  if (p.stream?.provider === "cloudflare" && code) return { kind: "hosted", iframe: `https://customer-${code}.cloudflarestream.com/${p.stream.liveInputId}/iframe` };
  if (p.youtubeChannelId) return { kind: "youtube", iframe: `https://www.youtube-nocookie.com/embed/live_stream?channel=${p.youtubeChannelId}`, channel: p.youtube ?? `https://www.youtube.com/channel/${p.youtubeChannelId}` };
  if (p.livestream && /facebook\.com/.test(p.livestream)) return { kind: "facebook", url: p.livestream };
  if (p.livestream) return { kind: "link", url: p.livestream };
  return null;
}
