import type { Metadata } from "next";
import { A, Band, PageHero } from "@/components/ui";
import { ADULT, CHILD, FAMILY, groups, INTERESTS, type Field } from "@/lib/register";
import { DOCS, SITE } from "@/lib/site";
import photo from "@/public/img/nave-easter.jpg";

export const metadata: Metadata = {
  title: "Register with the Parish",
  description: "Register your family with St. Mary Catholic Church, Marshall, Michigan, online or by printing the form and mailing it to the office.",
  alternates: { canonical: "/register" },
};

/**
 * A plain HTML form, POSTed to /api/register. No JavaScript is needed to
 * submit it. Every field is optional except the family name and one way to
 * reach you, because a half-filled form the office can call about beats one
 * that was abandoned at the required-fields wall.
 */
export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const g = groups();
  return (
    <>
      <PageHero title="Register with the Parish" lede="Welcome. Fill in what you can; the office will follow up with a welcome packet." photo={photo} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <form method="post" action="/api/register" className="space-y-12">
            {error === "name" && (
              <p role="alert" className="border-l-4 border-marian bg-paper-dim px-4 py-3 text-[15px] text-ink">
                Please give a family name so the office knows who is registering.
              </p>
            )}
            <Fieldset title="Family" fields={FAMILY} />
            {g.adults.map((a) => (
              <Fieldset key={a.prefix} title={a.title} fields={ADULT} prefix={a.prefix} />
            ))}
            {g.children.map((c) => (
              <Fieldset key={c.prefix} title={c.title} fields={CHILD} prefix={c.prefix} fold />
            ))}
            <fieldset>
              <legend className="display rule text-3xl text-ink">Parish participation</legend>
              <p className="mt-5 text-[15px] text-ink-soft">Check anything you might be interested in.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {INTERESTS.map((it, i) => (
                  <li key={it}>
                    <label className="flex min-h-11 items-center gap-3 text-[17px] text-ink">
                      <input type="checkbox" name={`interest_${i}`} value={it} className="h-6 w-6 accent-marian" />
                      {it}
                    </label>
                  </li>
                ))}
              </ul>
              <label className="lbl mt-6" htmlFor="notes">
                Anything else the office should know
              </label>
              <textarea id="notes" name="notes" rows={4} className="field" />
            </fieldset>
            {/* A field no person fills in. The API drops any submission that
                carries a value here. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-marian px-8 font-semibold text-paper transition-colors hover:bg-navy">
                Send to the parish office
              </button>
              <p className="mt-3 text-sm text-ink-soft">Your information goes to the parish office only.</p>
            </div>
          </form>
          <aside className="space-y-8 text-[15px] leading-relaxed text-ink lg:sticky lg:top-24 lg:self-start">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Prefer paper?</h2>
              <p className="mt-2">
                <A href={DOCS.registrationForm}>Print the registration form (PDF)</A> and mail it to:
              </p>
              <p className="mt-2">
                {SITE.parish}
                <br />
                {SITE.office.street}
                <br />
                {SITE.office.city}, {SITE.office.state} {SITE.office.zip}
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">Questions</h2>
              <p className="mt-2">
                Call the office at{" "}
                <a href={SITE.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {SITE.phone}
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </Band>
    </>
  );
}

function Fieldset({ title, fields, prefix = "", fold }: { title: string; fields: Field[]; prefix?: string; fold?: boolean }) {
  const body = (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <Input key={f.name} f={f} prefix={prefix} />
      ))}
    </div>
  );
  if (fold) {
    return (
      <details className="fold border-t border-paper-dim pt-2">
        <summary className="flex min-h-12 items-center justify-between gap-4">
          <span className="display text-3xl text-ink">{title}</span>
          <svg className="chev h-5 w-5 shrink-0 text-marian" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </summary>
        <fieldset>
          <legend className="sr-only">{title}</legend>
          {body}
        </fieldset>
      </details>
    );
  }
  return (
    <fieldset>
      <legend className="display rule text-3xl text-ink">{title}</legend>
      {body}
    </fieldset>
  );
}

function Input({ f, prefix }: { f: Field; prefix: string }) {
  const id = prefix + f.name;
  const wide = f.wide ? "sm:col-span-2" : "";
  if (f.type === "yesno" || f.type === "select") {
    const opts = f.type === "yesno" ? ["", "Yes", "No"] : f.options ?? [];
    return (
      <div className={wide}>
        <label className="lbl" htmlFor={id}>
          {f.label}
        </label>
        <select id={id} name={id} className="field">
          {opts.map((o) => (
            <option key={o} value={o}>
              {o || "Choose"}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className={wide}>
      <label className="lbl" htmlFor={id}>
        {f.label}
        {f.required ? " (required)" : ""}
      </label>
      <input id={id} name={id} type={f.type ?? "text"} required={f.required} className="field" autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined} />
    </div>
  );
}
