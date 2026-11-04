import type { Notice } from "@/lib/types";

/**
 * Notices from the chancery of the Diocese of Kalamazoo, shown on every
 * parish home page that has not turned them off (Parish.diocesanNotices).
 * The diocese writes one here, once, and every site carries it between
 * `from` and `until`. This is the reverse of eCatholic's Diocesan Sharing,
 * in a file the diocese holds.
 *
 * Keep them short: a sentence and a link. A parish site is the parish's;
 * the band is a line at the top, not a takeover. A notice with an `es`
 * block shows in Spanish on a Spanish parish; without one it shows in
 * English there too.
 */
export const NOTICES: Notice[] = [
  {
    id: "2026-advent-confessions",
    from: "2026-11-29",
    until: "2026-12-24",
    title: "Advent confessions across the diocese",
    body: "Every parish's Confession times for Advent, on one page, nearest you first.",
    href: "/diocese/near",
    label: "Find a Confession time",
    es: { title: "Confesiones de Adviento en toda la diócesis", body: "Los horarios de confesión de Adviento de cada parroquia, en una sola página, empezando por la más cercana.", label: "Busca un horario de confesión" },
  },
];
