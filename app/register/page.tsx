import type { Metadata } from "next";
import { A, Band, PageHero } from "@/components/ui";
import { strings, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { getParish } from "@/lib/parish";
import { ADULT, CHILD, FAMILY, groups, INTERESTS, tr, type Field } from "@/lib/register";
import { noDot } from "@/lib/sentences";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang);
  return pageMetadata(p, { title: s.register.title, description: s.meta.register(p.name, p.church.city), path: "/register" });
}

/**
 * A plain HTML form, POSTed to /api/register. No JavaScript is needed to
 * submit it. Every field is optional except the family name, because a
 * half-filled form the office can follow up on beats one abandoned at the
 * required-fields wall. The office form on paper asks the same.
 */
export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.register;
  const g = groups();
  const mail = p.office ?? p.church;
  return (
    <>
      <PageHero title={t.title} lede={t.lede} photo={p.photos.hero} priority />
      <Band tone="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <form method="post" action="/api/register" className="space-y-12">
            {error === "name" && (
              <p role="alert" className="border-l-4 border-marian bg-paper-dim px-4 py-3 text-[15px] text-ink">
                {t.errorName}
              </p>
            )}
            <Fieldset title={t.family} fields={FAMILY} lang={p.lang} />
            {g.adults.map((a) => (
              <Fieldset key={a.prefix} title={a.n === 0 ? t.adult : t.spouse} fields={ADULT} prefix={a.prefix} lang={p.lang} />
            ))}
            {g.children.map((c) => (
              <Fieldset key={c.prefix} title={t.child(c.n)} fields={CHILD} prefix={c.prefix} lang={p.lang} fold />
            ))}
            <fieldset>
              <legend className="display rule text-3xl text-ink">{t.participation}</legend>
              <p className="mt-5 text-[15px] text-ink-soft">{t.checkAny}</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {INTERESTS.map((it, i) => (
                  <li key={it}>
                    <label className="flex min-h-11 items-center gap-3 text-[17px] text-ink">
                      <input type="checkbox" name={`interest_${i}`} value={it} className="h-6 w-6 accent-marian" />
                      {tr(it, p.lang)}
                    </label>
                  </li>
                ))}
              </ul>
              <label className="lbl mt-6" htmlFor="notes">
                {t.notes}
              </label>
              <textarea id="notes" name="notes" rows={4} className="field" />
            </fieldset>
            {/* A field no person fills in. The API drops any submission that
                carries a value here. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">{t.website}</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-marian px-8 font-semibold text-paper transition-colors hover:bg-navy">
                {t.send}
              </button>
              <p className="mt-3 text-sm text-ink-soft">{t.private}</p>
            </div>
          </form>
          <aside className="space-y-8 text-[15px] leading-relaxed text-ink lg:sticky lg:top-24 lg:self-start">
            {p.registrationForm && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.paper}</h2>
                <p className="mt-2">
                  <A href={p.registrationForm}>{t.print}</A>
                  {t.mail}
                </p>
                <p className="mt-2">
                  {p.parishName}
                  <br />
                  {noDot(mail.street)}
                  <br />
                  {mail.city}, {mail.state} {mail.zip}
                </p>
              </div>
            )}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.questions}</h2>
              <p className="mt-2">
                {t.callOffice}
                <a href={p.phoneHref} className="font-semibold text-marian underline underline-offset-4">
                  {p.phone}
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

function Fieldset({ title, fields, prefix = "", fold, lang }: { title: string; fields: Field[]; prefix?: string; fold?: boolean; lang: Lang }) {
  const body = (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <Input key={f.name} f={f} prefix={prefix} lang={lang} />
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

function Input({ f, prefix, lang }: { f: Field; prefix: string; lang: Lang }) {
  const t = strings(lang).register;
  const id = prefix + f.name;
  const wide = f.wide ? "sm:col-span-2" : "";
  if (f.type === "yesno" || f.type === "select") {
    const opts = f.type === "yesno" ? ["", "Yes", "No"] : (f.options ?? []);
    return (
      <div className={wide}>
        <label className="lbl" htmlFor={id}>
          {tr(f.label, lang)}
        </label>
        <select id={id} name={id} className="field">
          {opts.map((o) => (
            <option key={o} value={o}>
              {o === "" ? t.choose : o === "Yes" ? t.yes : o === "No" ? t.no : tr(o, lang)}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className={wide}>
      <label className="lbl" htmlFor={id}>
        {tr(f.label, lang)}
        {f.required ? t.required : ""}
      </label>
      <input id={id} name={id} type={f.type ?? "text"} required={f.required} className="field" autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined} />
    </div>
  );
}
