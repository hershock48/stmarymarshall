import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Counting without tracking. One row per day, host, kind and key, each a
 * number. No cookies, no visitor ids, no IP addresses, no contents of any
 * form. What gets counted:
 *
 *   view     key = path                     a page served
 *   search   key = "lat,lng:n"              a finder search, the point
 *                                           rounded to about seven miles,
 *                                           n = parishes found
 *   give     key = parish slug              a tap on the parish's Give link
 *   form     key = "<kind>:<slug>"          a form sent (register,
 *                                           mass-intentions, prayer-request)
 *
 * Needs DATABASE_URL (a Neon Postgres) and db/tally.sql applied once.
 * Without it every call is a no-op and the chancery page says counting
 * has not started, which is the honest state on a preview.
 */
const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;

export const counting = Boolean(sql);

export async function bump(host: string, kind: string, key: string): Promise<void> {
  if (!sql) return;
  try {
    await sql`insert into tally (day, host, kind, key, n) values (current_date, ${host.slice(0, 120)}, ${kind}, ${key.slice(0, 200)}, 1)
              on conflict (day, host, kind, key) do update set n = tally.n + 1`;
  } catch (err) {
    console.error("[tally]", kind, err);
  }
}

export type Count = { host: string; kind: string; key: string; n: number };

/** Totals by host, kind and key over the last `days` days. */
export async function totals(days: number): Promise<Count[]> {
  if (!sql) return [];
  const rows = await sql`select host, kind, key, sum(n)::int as n from tally where day >= current_date - ${days}::int group by host, kind, key order by n desc`;
  return rows as Count[];
}

/** Per-day totals of one kind, oldest first, for a small chart. */
export async function byDay(kind: string, days: number): Promise<{ day: string; n: number }[]> {
  if (!sql) return [];
  const rows = await sql`select to_char(day, 'YYYY-MM-DD') as day, sum(n)::int as n from tally where kind = ${kind} and day >= current_date - ${days}::int group by day order by day`;
  return rows as { day: string; n: number }[];
}
