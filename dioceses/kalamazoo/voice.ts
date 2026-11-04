import type { VoiceEntry } from "@/lib/types";

/**
 * The bishop's voice, Diocese of Kalamazoo: what Bishop Edward M. Lohse
 * has said to the diocese, as a list the diocese keeps. Each entry points
 * at a recording the diocese already published (today, its YouTube
 * channel), with a date and a line saying what it is. The page at
 * /diocese/voice shows them newest first, every parish home page carries
 * the newest one unless the parish opts out (Parish.bishopsVoice: false),
 * and /diocese/voice.xml is the same list as a feed anyone can subscribe to
 * without a social network.
 *
 * With hosted video (docs/narthex-plan.md, Watch) an entry gains an `audio`
 * or a stream id and the feed becomes a podcast; the shape already allows it.
 *
 * Read from youtube.com/user/DioceseofKalamazoo1 on 2026-11-04. The ledes
 * say what the recording is and no more; the bishop's words are his.
 */
export const VOICE: VoiceEntry[] = [
  { id: "easter-2026-en", date: "2026-04-05", title: "He is Risen! Alleluia! Easter greeting from Bishop Edward M. Lohse", lede: "The bishop’s Easter message to the diocese, 2026.", lang: "en", kind: "video", youtube: "NFC94w6MHqg", pair: "easter-2026-es" },
  { id: "easter-2026-es", date: "2026-04-05", title: "Mensaje de Pascua del obispo Edward M. Lohse", lede: "El mensaje de Pascua del obispo a la diócesis, 2026, en español.", lang: "es", kind: "video", youtube: "WTgphMUgRhY", pair: "easter-2026-en" },
  { id: "chrism-mass-2025", date: "2025-04-16", title: "Chrism Mass with Bishop Lohse", lede: "The Chrism Mass of Holy Week 2025 at St. Augustine Cathedral, with the bishop’s homily.", lang: "en", kind: "video", youtube: "8JBIYh1y4SU" },
  { id: "christmas-2024-en", date: "2024-12-24", title: "Christmas message to the faithful of the Diocese of Kalamazoo", lede: "The bishop’s Christmas message, 2024.", lang: "en", kind: "video", youtube: "KDwHDkj_QlA", pair: "christmas-2024-es" },
  { id: "christmas-2024-es", date: "2024-12-24", title: "Mensaje de Navidad del obispo Edward M. Lohse", lede: "El mensaje de Navidad del obispo, 2024, en español.", lang: "es", kind: "video", youtube: "P8Hbi6fiZIw", pair: "christmas-2024-en" },
  { id: "connecting-2024", date: "2024-11-19", title: "Bishop Lohse at Connecting with our Parishes", lede: "The bishop’s talk to parish staff at the diocese’s annual gathering, November 19, 2024.", lang: "en", kind: "video", youtube: "s41df-KL280" },
  { id: "reparation-2024", date: "2024-08-05", title: "Homily for the Mass of Reparation and Atonement", lede: "The bishop’s homily at the Mass of Reparation and Atonement, August 2024.", lang: "en", kind: "video", youtube: "WtegmZ9pLFE" },
];
