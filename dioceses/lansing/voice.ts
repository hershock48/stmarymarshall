import type { VoiceEntry } from "@/lib/types";

/**
 * The bishop's voice, Diocese of Lansing. The diocese runs a podcast
 * ("Made for Mission", on Buzzsprout, feeds.buzzsprout.com/938890.rss), so
 * its entries carry audio files, which is what makes /diocese/voice.xml a
 * podcast feed here rather than a list of links. Read 2026-11-04; the
 * bishop's words are his.
 */
export const VOICE: VoiceEntry[] = [
  {
    id: "made-for-mission-1",
    date: "2026-10-07",
    title: "Made for Mission, episode 1: Bishop Earl Boyea",
    lede: "The first episode of the diocese’s Made for Mission podcast, a conversation with Bishop Boyea. About twenty-four minutes.",
    lang: "en",
    kind: "audio",
    audio: { url: "https://www.buzzsprout.com/938890/episodes/19924315-episode-1-bishop-earl-boyea.mp3", type: "audio/mpeg", bytes: 17518128 },
  },
];
