import Link from "next/link";
import { strings } from "@/lib/i18n";
import { liveAnnouncements } from "@/lib/news";
import { localNow } from "@/lib/schedule";
import type { Parish } from "@/lib/types";

/**
 * What the office typed, on the home page, while it runs. Nothing else is
 * here: the dated things live in the This week band from the calendar.
 * Renders nothing when nothing is live, which is most weeks.
 */
export default function Announcements({ parish: p }: { parish: Parish }) {
  const items = liveAnnouncements(p.announcements, localNow(p.timeZone).iso, p.lang);
  if (!items.length) return null;
  const t = strings(p.lang).diocese.news;
  return (
    <section aria-labelledby="announcements" className="border-b border-paper-dim bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 id="announcements" className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">
          {t.announcements}
        </h2>
        <ul className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((a) => (
            <li key={a.id}>
              <p className="text-lg font-semibold leading-snug text-ink">{a.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-soft">{a.body}</p>
              {a.href ? (
                <a href={a.href} className="mt-1 inline-block min-h-6 text-sm font-semibold text-marian underline decoration-marian/40 underline-offset-4">
                  {a.label ?? a.href}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/news" className="inline-block min-h-6 font-semibold text-marian underline decoration-marian/40 underline-offset-4">
            {t.title}
          </Link>
        </p>
      </div>
    </section>
  );
}
