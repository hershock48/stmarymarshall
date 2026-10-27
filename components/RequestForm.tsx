import type { Field } from "@/lib/register";

/**
 * One plain POST form for the short requests. Shared field renderer with
 * the registration page's shape; kept small on purpose. No JavaScript.
 */
export default function RequestForm({ kind, fields, error, button }: { kind: string; fields: Field[]; error?: string; button: string }) {
  return (
    <form method="post" action="/api/request" className="space-y-6">
      <input type="hidden" name="kind" value={kind} />
      {error === "required" && (
        <p role="alert" className="border-l-4 border-marian bg-paper-dim px-4 py-3 text-[15px] text-ink">
          Please fill in the required lines so the office knows what you are asking.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Input key={f.name} f={f} />
        ))}
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${kind}-website`}>Website</label>
        <input id={`${kind}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-sm bg-marian px-8 font-semibold text-paper transition-colors hover:bg-navy">
          {button}
        </button>
        <p className="mt-3 text-sm text-ink-soft">Goes to the parish office only.</p>
      </div>
    </form>
  );
}

function Input({ f }: { f: Field }) {
  const wide = f.wide ? "sm:col-span-2" : "";
  const label = (
    <label className="lbl" htmlFor={f.name}>
      {f.label}
      {f.required ? " (required)" : ""}
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
              {o || "Choose"}
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
