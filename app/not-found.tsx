import type { Metadata } from "next";
import Link from "next/link";
import HomeLink from "@/components/HomeLink";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page is not here. Mass times, the calendar and the rest of the parish site are.",
  robots: { index: false },
};
import { Band, LineButton, PageHero } from "@/components/ui";
import { NAV } from "@/lib/site";

export default function NotFound() {
  return (
    <>
      <PageHero title="Page not found" lede="Dear St. Anthony, please come around. This page is lost and cannot be found." />
      <Band tone="paper">
        <div className="flex flex-wrap gap-3">
          <HomeLink className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold px-6 font-semibold text-navy transition-colors hover:bg-gold-light">Home</HomeLink>
          <LineButton href="/mass-times" onPaper>
            Mass times
          </LineButton>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="inline-block min-h-6 text-marian underline underline-offset-4">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
