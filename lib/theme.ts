import type { CSSProperties } from "react";
import type { Parish, Theme } from "@/lib/types";

/**
 * A parish's palette as the CSS variables Tailwind's utilities read.
 *
 * app/globals.css declares the tokens once, in St. Mary's navy and gold,
 * and every utility (bg-navy, text-gold) compiles to var(--color-navy) and
 * so on. Setting the same variables on <html> re-colors the whole site
 * for one parish without a second stylesheet, and a parish with no theme
 * gets the defaults untouched.
 */
const VAR: Record<keyof Theme, string> = {
  navy: "--color-navy",
  navySoft: "--color-navy-soft",
  navyLine: "--color-navy-line",
  marian: "--color-marian",
  gold: "--color-gold",
  goldLight: "--color-gold-light",
  goldDeep: "--color-gold-deep",
  cream: "--color-cream",
  dim: "--color-dim",
  paper: "--color-paper",
  paperDim: "--color-paper-dim",
  ink: "--color-ink",
  inkSoft: "--color-ink-soft",
};

export function themeStyle(p: Pick<Parish, "theme">): CSSProperties | undefined {
  if (!p.theme) return undefined;
  const style: Record<string, string> = {};
  for (const [key, name] of Object.entries(VAR) as [keyof Theme, string][]) style[name] = p.theme[key];
  return style as CSSProperties;
}

/** The dark ground, for the theme-color meta and the manifest. */
export function groundColor(p: Pick<Parish, "theme">): string {
  return p.theme?.navy ?? "#0e1a2b";
}
