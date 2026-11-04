import type { EventKind } from "@/lib/types";

/**
 * Events across the diocese that do not come from a platform parish's own
 * calendar: the bishop's Masses and gatherings, chancery and Catholic
 * Charities dates, and the fairs and missions at parishes still on their
 * old sites. They join the platform parishes' calendars on
 * /diocese/events, so "this week across the diocese" means the diocese.
 *
 * Where the rows come from: the diocese's own weekly email, The Insider
 * (Office of Communications, Tuesdays, deadline the Thursday before). Each
 * row names its issue. In phase two the Insider's items are typed once
 * into the announcements inbox and this file goes away; until then it is
 * the inbox, kept by hand, and the diff is the news. A date the email got
 * wrong is corrected here and the correction noted.
 */
export type DioceseEvent = {
  id: string;
  date: string;
  /** A second date for a two-day event; it shows on both days. */
  through?: string;
  start?: string;
  end?: string;
  title: string;
  /** Who is holding it: a parish, the bishop, an office. */
  host: string;
  where?: string;
  town: string;
  kind: EventKind;
  note?: string;
  href?: string;
  source: string;
};

const INSIDER = "The Insider, 2026-11-03";

export const DIOCESE_EVENTS: DioceseEvent[] = [
  { id: "ya-conversations-2026-11-04", date: "2026-11-04", start: "18:30", title: "Catholic Conversations, young adults", host: "Third Place, St. Monica Parish", where: "St. Monica School Library", town: "Kalamazoo", kind: "formation", note: "This month’s topic is death. RSVP online.", source: INSIDER },
  { id: "gethsemane-2026-11-05", date: "2026-11-05", start: "18:30", end: "21:00", title: "Young Adult Gethsemane Night with Bishop Lohse", host: "Office of Mission and Ministry", where: "St. Augustine Cathedral", town: "Kalamazoo", kind: "worship", note: "Adoration with Bishop Lohse 6:30 to 7:30, then a social until 9. Ages 18 to 35 and out of high school. A different parish each month.", source: INSIDER },
  { id: "gethsemane-2026-12-10", date: "2026-12-10", start: "18:30", end: "21:00", title: "Young Adult Gethsemane Night with Bishop Lohse", host: "Office of Mission and Ministry", where: "St. Joseph Parish", town: "St. Joseph", kind: "worship", note: "Adoration with Bishop Lohse, then a social. Ages 18 to 35 and out of high school.", source: INSIDER },
  { id: "gethsemane-2027-01-07", date: "2027-01-07", start: "18:30", end: "21:00", title: "Young Adult Gethsemane Night with Bishop Lohse", host: "Office of Mission and Ministry", where: "St. Joseph Parish", town: "Battle Creek", kind: "worship", note: "Adoration with Bishop Lohse, then a social. Ages 18 to 35 and out of high school. (The Insider printed January 7, 2026; the Thursday is in 2027.)", source: INSIDER },
  { id: "stmary-kzoo-gala-2026-11-07", date: "2026-11-07", start: "17:00", end: "22:00", title: "Autumn Gala", host: "St. Mary Parish", town: "Kalamazoo", kind: "family", note: "Dinner, dessert, raffles, auctions and cocktails. Reserve a spot online.", source: INSIDER },
  { id: "oll-bazaar-2026-11-07", date: "2026-11-07", start: "08:00", end: "14:00", title: "Holiday Bazaar and Arts and Crafts Show", host: "Our Lady of the Lake Parish", town: "Edwardsburg", kind: "family", note: "Over 75 artisans and crafters; a door prize drawing for the first 250 visitors; food for sale.", source: INSIDER },
  { id: "svdp-100-mass-2026-11-08", date: "2026-11-08", start: "11:30", title: "Mass for the 100th anniversary of the St. Vincent de Paul Society, St. Augustine Conference", host: "Bishop Edward M. Lohse", where: "St. Augustine Cathedral", town: "Kalamazoo", kind: "worship", note: "A light reception follows at the Crowley Center. Past and current volunteers especially welcome.", source: INSIDER },
  { id: "deceased-clergy-mass-2026-11-10", date: "2026-11-10", start: "16:00", title: "Diocesan Mass for Deceased Clergy and Religious", host: "Bishop Edward M. Lohse", where: "St. Augustine Cathedral", town: "Kalamazoo", kind: "worship", source: INSIDER },
  { id: "stm-craft-fair-2026-11-14", date: "2026-11-14", start: "09:00", end: "15:00", title: "Christmas Craft Fair", host: "St. Thomas More Parish", town: "Kalamazoo", kind: "family", note: "Part of the proceeds goes to St. Tom’s Toilet Paper Ministry.", source: INSIDER },
  { id: "stedward-bazaar-2026-11-14", date: "2026-11-14", start: "08:00", end: "14:00", title: "Holiday Bazaar", host: "St. Edward Parish", town: "Mendon", kind: "family", note: "Crafts, baked goods, luncheon specials and a raffle drawing at 2 p.m. Call 269-365-2250.", source: INSIDER },
  { id: "stjoseph-kzoo-bazaar-2026-11-14", date: "2026-11-14", start: "08:00", end: "16:00", title: "79th Annual Bazaar", host: "St. Joseph Parish", town: "Kalamazoo", kind: "family", note: "Bake sale, artisan crafts, white elephant gifts and raffle baskets. Sunday hours 9 to 1.", source: INSIDER },
  { id: "stjoseph-kzoo-bazaar-2026-11-15", date: "2026-11-15", start: "09:00", end: "13:00", title: "79th Annual Bazaar, day two", host: "St. Joseph Parish", town: "Kalamazoo", kind: "family", source: INSIDER },
  { id: "public-rosary-2026-11-14", date: "2026-11-14", start: "09:30", title: "Public Square Rosary", host: "Kalamazoo and Portage Knights of Columbus", where: "The front steps of St. Augustine Cathedral", town: "Kalamazoo", kind: "worship", note: "Bring a rosary. The Rosary and the Litany of the Blessed Virgin Mary.", source: INSIDER },
  { id: "svdp-open-house-2026-11-14", date: "2026-11-14", start: "10:00", end: "14:00", title: "Christmas Open House", host: "St. Vincent de Paul Thrift Store", town: "Kalamazoo", kind: "service", note: "Treats while you shop, free Christmas cards and a toy for children.", source: INSIDER },
  { id: "stjoseph-bc-mission-2026-11-16", date: "2026-11-16", through: "2026-11-19", start: "18:00", title: "Parish Mission: Go to Joseph!", host: "St. Joseph Parish", town: "Battle Creek", kind: "formation", note: "Father Ricardo Pineda, CPM. Confession at 6, Adoration and the conference at 7, Monday through Thursday.", source: INSIDER },
  { id: "ccdok-st-nicholas-2026-12-04", date: "2026-12-04", title: "5th Annual St. Nicholas Fundraiser", host: "Catholic Charities Diocese of Kalamazoo", where: "Kalamazoo Country Club", town: "Kalamazoo", kind: "service", note: "Dinner, drinks, music, an auction and a raffle. Tickets on sale now.", source: INSIDER },
];
