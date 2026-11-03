import Link from "next/link";
import { strings } from "@/lib/i18n";
import { localNow } from "@/lib/schedule";
import type { Parish } from "@/lib/types";
import { liveNotices } from "@/parishes/diocese/notices";

/**
 * The line from the chancery at the top of a parish home page: a title, a
 * sentence and a link, in the parish's language where the notice has one.
 * Renders nothing when there is nothing live or the parish has opted out.
 */
export default function DiocesanNotice({ parish: p }: { parish: Parish }) {
  if (p.diocesanNotices === false) return null;
  const live = liveNotices(localNow(p.timeZone).iso);
  if (!live.length) return null;
  const s = strings(p.lang).diocese.notices;
  return (
    <aside aria-label={s.label} className="border-b border-navy-line bg-navy-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-baseline sm:gap-4 sm:px-6 lg:px-8">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{s.label}</span>
        {live.map((n) => {
          const t = p.lang === "es" && n.es ? n.es : n;
          return (
            <p key={n.id} className="text-dim">
              <span className="font-semibold text-cream">{t.title}.</span> {t.body}
              {n.href ? (
                <>
                  {" "}
                  <Link href={n.href} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                    {t.label ?? n.label ?? n.href}
                  </Link>
                </>
              ) : null}
            </p>
          );
        })}
      </div>
    </aside>
  );
}
