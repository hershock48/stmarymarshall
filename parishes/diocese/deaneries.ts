/**
 * The five deaneries of the Diocese of Kalamazoo and the collaboratives
 * inside them (parishes that share a pastor), as the diocese prints them
 * in its own directory (Diocesan Directory, updated December 2025, pages
 * 20, 35, 47, 60 and 70). Fifty-nine parishes and missions; the Parish
 * Finder's sixtieth row is a mission counted with its parish here.
 *
 * Each collaborative is a list of "Name, Town" strings in the directory's
 * own words. `deaneryOf` matches a finder row to its deanery and
 * collaborative by town and the parish's name; the test in
 * tools/diocese-tests.mjs fails if any finder row is left unmatched, so a
 * renamed parish shows up as a failing test, not a silent gap.
 */
export type Deanery = { name: string; collaboratives: string[][] };

export const DEANERIES: Deanery[] = [
  {
    name: "Central Deanery",
    collaboratives: [
      ["St. Ambrose Parish, Parchment"],
      ["St. Ann Parish, Augusta"],
      ["St. Augustine Cathedral Parish, Kalamazoo"],
      ["St. Catherine of Siena Parish, Portage"],
      ["St. Edward Parish, Mendon", "St. Martin of Tours Parish, Vicksburg"],
      ["St. Joseph Parish, Kalamazoo"],
      ["St. Mary Parish, Kalamazoo"],
      ["St. Margaret Mary Parish, Marcellus", "St. John Bosco Parish, Mattawan"],
      ["St. Mary Parish, Paw Paw", "St. Jude Mission Parish, Gobles"],
      ["St. Monica Parish, Kalamazoo"],
      ["St. Thomas More Student Parish, Kalamazoo"],
    ],
  },
  {
    name: "Eastern Deanery",
    collaboratives: [
      ["St. Jerome Parish, Battle Creek", "St. Joseph Parish, Battle Creek"],
      ["Our Lady of Great Oak Mission Parish, Bellevue", "St. Ambrose Parish, Delton", "St. Philip Parish, Battle Creek"],
      ["St. John the Evangelist Parish, Albion", "St. Mary Parish, Marshall"],
      ["Our Lady of Fatima Parish, Union City", "St. Barbara Parish, Colon", "St. Charles Borromeo Parish, Coldwater", "St. Mary’s Assumption Parish, Bronson"],
    ],
  },
  {
    name: "Northern Deanery",
    collaboratives: [
      ["Blessed Sacrament Parish, Allegan", "St. Margaret Parish, Otsego"],
      ["Sacred Heart Parish, Allegan", "St. Mary’s Visitation Parish, Byron Center", "St. Stanislaus Parish, Dorr"],
      ["St. Basil Parish, South Haven", "St. Peter Parish, Douglas", "San Felipe de Jesus Mission Parish, Fennville"],
      ["St. Cyril Parish, Nashville", "St. Rose of Lima Parish, Hastings"],
      ["St. Therese of Lisieux Parish, Wayland", "SS. Cyril and Methodius Parish, Wayland"],
    ],
  },
  {
    name: "Southern Deanery",
    collaboratives: [
      ["Holy Family Parish, Decatur", "Holy Maternity of Mary Parish, Dowagiac", "Sacred Heart of Mary Parish, Dowagiac"],
      ["St. Ann Parish, Cassopolis", "Our Lady of the Lake Parish, Edwardsburg"],
      ["St. Clare Parish, Centreville", "Immaculate Conception Parish, Three Rivers"],
      ["Holy Angels Parish, Sturgis", "St. Joseph Parish, White Pigeon"],
    ],
  },
  {
    name: "Western Deanery",
    collaboratives: [
      ["Sacred Heart Parish, Bangor", "Immaculate Conception Parish, Hartford"],
      // St. Joseph, St. Joseph keeps a second church in Stevensville, which the finder lists as its own row.
      ["SS. John & Bernard Parish, Benton Harbor", "St. Joseph Parish, St. Joseph", "St. Joseph Parish, Stevensville", "St. Joseph Parish, Watervliet"],
      ["Our Lady Queen of Peace Parish, Bridgman"],
      ["St. Agnes Parish, Sawyer", "St. Mary of the Assumption, Three Oaks", "St. Mary of the Lake Parish, New Buffalo"],
      ["St. Gabriel Parish, Berrien Springs", "St. Anthony Parish, Buchanan", "St. Mary Parish, Niles", "St. Mark Parish, Niles"],
    ],
  },
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'.]/g, "")
    .replace(/\b(parish|mission|student|cathedral|church|the|of)\b/g, " ")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();

/**
 * The deanery and collaborative of a parish, by its town and name. The
 * finder's towns sometimes carry the post office (Watson, Silver Creek,
 * Gull Lake) rather than the directory's town, so a town matches when
 * either contains the other, and the name matches on its distinctive words.
 */
export function deaneryOf(name: string, town: string): { deanery: string; collaborative: string[] } | null {
  const n = norm(name);
  const t = norm(town);
  let best: { deanery: string; collaborative: string[]; score: number } | null = null;
  for (const d of DEANERIES) {
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
export function deaneryOfTown(town: string): string | null {
  const t = norm(town);
  for (const d of DEANERIES) for (const c of d.collaboratives) for (const entry of c) {
    const tt = norm(entry.split(",")[1] ?? "");
    if (tt && (tt === t || tt.includes(t) || t.includes(tt))) return d.name;
  }
  return null;
}
