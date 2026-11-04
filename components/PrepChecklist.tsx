import type { Section } from "@/lib/types";

/**
 * The sacramental checklist: the steps the parish itself publishes, in
 * order, each with an empty box, and what to have ready. A family sees
 * the whole path before the first phone call, and the office stops
 * answering the same five questions. Prints as it reads.
 */
export default function PrepChecklist({ prep, words }: { prep: NonNullable<Section["prep"]>; words: { title: string; bring: string } }) {
  return (
    <div className="mt-6 rounded-sm border border-paper-dim bg-paper-dim/40 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{words.title}</p>
      <ol className="mt-3 space-y-2.5">
        {prep.steps.map((step, n) => (
          <li key={n} className="grid grid-cols-[1.5rem_1fr] gap-3 text-[16px] leading-relaxed text-ink">
            <span aria-hidden="true" className="mt-1 inline-block h-5 w-5 rounded-sm border-2 border-marian" />
            <span>
              <span className="sr-only">{n + 1}. </span>
              {step}
            </span>
          </li>
        ))}
      </ol>
      {prep.bring?.length ? (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-marian">{words.bring}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[16px] leading-relaxed text-ink">
            {prep.bring.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
