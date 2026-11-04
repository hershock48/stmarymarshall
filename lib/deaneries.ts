import type { Deanery } from "@/lib/types";

/**
 * Matching a parish to its deanery and collaborative by town and name,
 * against a diocese's roster (dioceses/<slug>/deaneries.ts). The finder's
 * towns sometimes carry the post office (Watson, Silver Creek, Gull Lake)
 * rather than the directory's town, so a town matches when either contains
 * the other, and the name matches on its distinctive words. The tests fail
 * if any finder row is left unmatched, so a renamed parish shows up as a
 * failing test, not a silent gap.
 */
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'.]/g, "")
    .replace(/\b(parish|mission|student|cathedral|church|the|of)\b/g, " ")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();

export function deaneryOf(deaneries: readonly Deanery[], name: string, town: string): { deanery: string; collaborative: string[] } | null {
  const n = norm(name);
  const t = norm(town);
  let best: { deanery: string; collaborative: string[]; score: number } | null = null;
  for (const d of deaneries) {
    for (const c of d.collaboratives) {
      for (const entry of c) {
        const [en, et] = entry.split(",").map((x) => x.trim());
        const nn = norm(en);
        const tt = norm(et ?? "");
        const townOk = tt === t || tt.includes(t) || t.includes(tt);
        if (!townOk) continue;
        const words = nn.split(" ").filter(Boolean);
        const hits = words.filter((w) => n.split(" ").includes(w)).length;
        const score = hits / words.length + (nn === n ? 1 : 0);
        if (hits >= Math.min(2, words.length) && (!best || score > best.score)) best = { deanery: d.name, collaborative: c, score };
      }
    }
  }
  return best ? { deanery: best.deanery, collaborative: best.collaborative } : null;
}

/** Deanery by town alone, for the events filter; the first deanery a town appears in. */
export function deaneryOfTown(deaneries: readonly Deanery[], town: string): string | null {
  const t = norm(town);
  for (const d of deaneries) for (const c of d.collaboratives) for (const entry of c) {
    const tt = norm(entry.split(",")[1] ?? "");
    if (tt && (tt === t || tt.includes(t) || t.includes(tt))) return d.name;
  }
  return null;
}
