/**
 * An RFC 822 date for an RSS item from a "YYYY-MM-DD" in a time zone: noon
 * local that day, with the zone's real offset on that day (EDT or EST), so
 * the feed is never an hour off. An item dated in the future (an event two
 * weeks out) is stamped now instead, because some readers hide items whose
 * pubDate has not arrived.
 */
export function rssDate(iso: string, timeZone: string, clampToNow = true): string {
  const guess = new Date(`${iso}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(guess);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  // What the zone showed for 12:00 UTC tells us its offset; shift the guess so local noon lands on noon.
  const shownMinutes = (get("hour") % 24) * 60 + get("minute");
  const offset = shownMinutes - 12 * 60;
  const local = new Date(guess.getTime() - offset * 60000);
  const now = new Date();
  return (clampToNow && local > now ? now : local).toUTCString();
}
