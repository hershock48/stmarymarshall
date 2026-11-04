import Link from "next/link";
import { strings } from "@/lib/i18n";
import { localNow, weekNotices, type Weekday } from "@/lib/schedule";
import type { Parish } from "@/lib/types";

/**
 * The line at the top of every parish page in the week before a holy day
 * or a special Mass: "Tuesday is the Immaculate Conception. Mass at 8:30
 * AM and 7:00 PM." Read from the same holyDays and specialMasses the Mass
 * times page and the finder use, so it is never typed a second time. The
 * one eCatholic feature the St. Mary office said it liked, without the
 * popup: a line, not a modal, and it says the times.
 */
export default function HolyDayNotice({ parish: p }: { parish: Parish }) {
  const now = localNow(p.timeZone);
  const items = weekNotices(p, now, 7);
  if (!items.length) return null;
  const s = strings(p.lang);
  const t = s.massTimes.notice;
  const dayWord = (n: (typeof items)[number]) => {
    if (n.daysAhead === 0) return s.schedule.today;
    if (n.daysAhead === 1) return s.schedule.tomorrow;
    const name = s.days[(((now.weekday + n.daysAhead) % 7) + 7) % 7 as Weekday];
    // A week out is the same weekday as today: say "Next Tuesday", not "Tuesday".
    return n.daysAhead >= 7 ? s.schedule.next(name) : name;
  };
  const list = (times: string[]) => (times.length > 1 ? `${times.slice(0, -1).join(", ")} ${s.schedule.and} ${times[times.length - 1]}` : times[0]);
  return (
    <aside aria-label={t.label} className="border-b border-navy-line bg-navy-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-baseline sm:gap-4 sm:px-6 lg:px-8">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{t.label}</span>
        <p className="text-dim">
          {items.slice(0, 2).map((n) => (
            <span key={`${n.date}-${n.label}`} className="mr-2">
              <span className="font-semibold text-cream">{n.kind === "holyDay" ? t.holyDay(dayWord(n), n.label) : t.special(dayWord(n), n.label, n.times![0])}</span>{" "}
              {n.kind === "holyDay" ? (n.times ? t.masses(list(n.times)) : t.inBulletin) : ""}
              {n.note ? ` ${n.note}` : ""}
            </span>
          ))}
          <Link href="/mass-times#holy-days" className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
            {t.more}
          </Link>
        </p>
      </div>
    </aside>
  );
}
