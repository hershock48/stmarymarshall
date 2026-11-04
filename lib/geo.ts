import zips from "@/dioceses/zips-mi.json";

/**
 * Distance and place lookup for the diocese finder. Everything here is
 * offline: the zip table is GeoNames' Michigan postal codes shipped with
 * the build, so a search never calls out to anyone.
 */
export type Point = { lat: number; lng: number };

/** Great-circle distance in miles. */
export function miles(a: Point, b: Point): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type Row = [zip: string, town: string, lat: number, lng: number];
const ROWS = zips.rows as Row[];
const BY_ZIP = new Map(ROWS.map((r) => [r[0], r]));

export type Place = { label: string; point: Point; kind: "zip" | "town" | "point" };

/** A zip, a town name, or "lat,lng" from the finder's own location button. */
export function resolvePlace(q: string): Place | null {
  const s = q.trim();
  if (!s) return null;
  const pt = /^(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)$/.exec(s);
  if (pt) return { label: "", point: { lat: Number(pt[1]), lng: Number(pt[2]) }, kind: "point" };
  const zip = /^\d{5}$/.exec(s);
  if (zip) {
    const r = BY_ZIP.get(zip[0]);
    return r ? { label: `${r[1]}, MI ${r[0]}`, point: { lat: r[2], lng: r[3] }, kind: "zip" } : null;
  }
  // A town: the first zip whose town matches, case and punctuation aside.
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z]/g, "");
  const want = norm(s.replace(/,?\s*(mi|michigan)$/i, ""));
  if (!want) return null;
  const hit = ROWS.find((r) => norm(r[1]) === want) ?? ROWS.find((r) => norm(r[1]).startsWith(want));
  return hit ? { label: `${hit[1]}, MI`, point: { lat: hit[2], lng: hit[3] }, kind: "town" } : null;
}

/** A point rounded to about seven miles, for counting where searches come from without keeping where anyone is. */
export function coarse(p: Point): string {
  return `${p.lat.toFixed(1)},${p.lng.toFixed(1)}`;
}
