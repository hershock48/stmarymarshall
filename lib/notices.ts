import type { Notice } from "@/lib/types";

/** The notices live today, by the parish's clock. */
export function liveNotices(list: readonly Notice[], iso: string): Notice[] {
  return list.filter((n) => n.from <= iso && iso <= n.until);
}
