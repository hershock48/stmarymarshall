import { strings, type Lang } from "@/lib/i18n";
import type { Field } from "@/lib/register";
import { trRequest } from "@/lib/requests";

/**
 * One plain POST form for the short requests. Shared field renderer with
 * the registration page's shape; kept small on purpose. No JavaScript.
 */
export default function RequestForm({ kind, fields, error, lang }: { kind: string; fields: Field[]; error?: string; lang: Lang }) {
  const s = strings(lang);
  return (
    <form method="post" action="/api/request" className="space-y-6">
      <input type="hidden" name="kind" value={kind} />
      {error === "required" && (
        <p role="alert" className="border-l-4 border-marian bg-paper-dim px-4 py-3 text-[15px] text-ink">
          {s.requests.errorRequired}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Input key={f.name} f={f} lang={lang} />
        ))}
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${kind}-website`}>{s.register.website}</label>
        <input id={`${kind}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-marian px-8 font-semibold text-paper transition-colors hover:bg-navy">
          {s.requests.send}
        </button>
        <p className="mt-3 text-sm text-ink-soft">{s.requests.private}</p>
      </div>
    </form>
  );
}

function Input({ f, lang }: { f: Field; lang: Lang }) {
  const s = strings(lang).register;
  const wide = f.wide ? "sm:col-span-2" : "";
  const label = (
    <label className="lbl" htmlFor={f.name}>
      {trRequest(f.label, lang)}
      {f.required ? s.required : ""}
    </label>
  );
  if (f.type === "yesno" || f.type === "select") {
    const opts = f.type === "yesno" ? ["", "Yes", "No"] : (f.options ?? []);
    return (
      <div className={wide}>
        {label}
        <select id={f.name} name={f.name} className="field">
          {opts.map((o) => (
            <option key={o} value={o}>
              {o === "" ? s.choose : o === "Yes" ? s.yes : o === "No" ? s.no : trRequest(o, lang)}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (f.name === "notes") {
    return (
      <div className={wide}>
        {label}
        <textarea id={f.name} name={f.name} rows={3} className="field" />
      </div>
    );
  }
  return (
    <div className={wide}>
      {label}
      <input id={f.name} name={f.name} type={f.type ?? "text"} required={f.required} className="field" autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined} />
    </div>
  );
}
