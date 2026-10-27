import { fmtLongDate, fmtRange, KIND_LABEL, type Occurrence } from "@/lib/events";
import { occurrenceId } from "@/lib/ics";

/** Occurrences grouped by day. `onPaper` flips the palette. */
export default function EventList({ items, onPaper = true, showKind = false, addLinks = false }: { items: Occurrence[]; onPaper?: boolean; showKind?: boolean; addLinks?: boolean }) {
  const days = new Map<string, Occurrence[]>();
  for (const o of items) {
    if (!days.has(o.date)) days.set(o.date, []);
    days.get(o.date)!.push(o);
  }
  if (days.size === 0) {
    return <p className={onPaper ? "text-ink-soft" : "text-dim"}>Nothing scheduled in this window.</p>;
  }
  const head = onPaper ? "text-marian" : "text-gold";
  const title = onPaper ? "text-ink" : "text-cream";
  const meta = onPaper ? "text-ink-soft" : "text-dim";
  const line = onPaper ? "border-paper-dim" : "border-navy-line";
  const link = onPaper ? "text-marian" : "text-gold";
  return (
    <div className="space-y-8">
      {[...days.entries()].map(([date, list]) => (
        <section key={date} aria-labelledby={`d-${date}`}>
          <h3 id={`d-${date}`} className={`text-xs font-semibold uppercase tracking-[0.18em] ${head}`}>
            {fmtLongDate(date)}
          </h3>
          <ul className={`mt-2 divide-y ${line} border-y ${line}`}>
            {list.map((o, i) => (
              <li key={i} className="grid gap-1 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <p className={`font-semibold tabular-nums ${title}`}>{fmtRange(o)}</p>
                <div>
                  <p className={`font-semibold ${title}`}>{o.title}</p>
                  {(o.where || showKind) && (
                    <p className={`text-sm ${meta}`}>
                      {[o.where, showKind ? KIND_LABEL[o.kind] : null].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {o.note && <p className={`mt-1 text-sm leading-relaxed ${meta}`}>{o.note}</p>}
                  {addLinks && (
                    <p className="mt-1 text-sm">
                      <a href={`/calendar.ics?e=${occurrenceId(o)}`} className={`inline-block min-h-6 font-semibold underline underline-offset-4 ${link}`}>
                        Add to my calendar
                      </a>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
