import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The chancery view's door. One passcode in DIOCESE_PASSCODE, typed once;
 * the cookie that follows is an HMAC of it, so a cookie cannot be guessed
 * and changing the passcode logs everyone out. No passcode set means the
 * page is closed, which is the state on every preview.
 */
export const COOKIE = "chancery";

export function configured(): boolean {
  return Boolean(process.env.DIOCESE_PASSCODE);
}

export function token(): string {
  return createHmac("sha256", process.env.DIOCESE_PASSCODE ?? "").update("chancery-view").digest("hex");
}

export function matches(passcode: string): boolean {
  const want = Buffer.from(process.env.DIOCESE_PASSCODE ?? "");
  const got = Buffer.from(passcode);
  return want.length > 0 && want.length === got.length && timingSafeEqual(want, got);
}

export async function admitted(): Promise<boolean> {
  if (!configured()) return false;
  const c = (await cookies()).get(COOKIE)?.value ?? "";
  const t = token();
  return c.length === t.length && timingSafeEqual(Buffer.from(c), Buffer.from(t));
}
