import { A, Contact, Fold, Prose } from "@/components/ui";
import type { Section } from "@/lib/content";

/**
 * Faith formation and ministries share one shape: a list of sections, each
 * a native <details>, the first open. An in-page index above lets a visitor
 * jump straight to one; the anchor opens it (components/OpenOnHash).
 */
export default function SectionList({ sections, label }: { sections: readonly Section[]; label: string }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
      <nav aria-label={label} className="lg:sticky lg:top-24 lg:self-start">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold lg:block lg:space-y-2">
          {sections.map((s) => (
            <li key={s.slug}>
              <a href={`#${s.slug}`} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-paper-dim">
        {sections.map((s, i) => (
          <div key={s.slug} className="scroll-mt-24" id={s.slug}>
            <Fold id={`fold-${s.slug}`} title={s.title} open={i === 0}>
              <Prose paragraphs={s.body} />
              {s.links && (
                <ul className="mt-4 space-y-1.5">
                  {s.links.map((l) => (
                    <li key={l.href}>
                      <A href={l.href} external={l.external}>
                        {l.label}
                        {l.href.endsWith(".pdf") ? " (PDF)" : ""}
                      </A>
                    </li>
                  ))}
                </ul>
              )}
              {s.contact && (
                <div className="mt-4">
                  <Contact text={`Contact: ${s.contact}`} />
                </div>
              )}
            </Fold>
          </div>
        ))}
      </div>
    </div>
  );
}
