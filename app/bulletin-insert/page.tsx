import type { Metadata } from "next";
import { fmtRange } from "@/lib/events";
import { strings } from "@/lib/i18n";
import { pageMetadata } from "@/lib/meta";
import { parishWeek } from "@/lib/news";
import { getParish } from "@/lib/parish";
import { fmtDate, localNow, DAY_NAMES } from "@/lib/schedule";

/**
 * The printable bulletin insert: this week's rows laid out for a half
 * sheet, from the same data as /news. The office opens it on the day the
 * bulletin goes to the printer, prints to PDF, and sends that; nothing is
 * retyped. On screen it is a plain page; in print the site's header and
 * footer drop away and the sheet is letter size, half inch margins.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getParish();
  const s = strings(p.lang).diocese.news;
  return pageMetadata(p, { title: s.insertTitle(p.shortName), description: s.lede(p.shortName), path: "/bulletin-insert", noindex: true });
}

export default async function BulletinInsert() {
  const p = await getParish();
  const s = strings(p.lang);
  const t = s.diocese.news;
  const now = localNow(p.timeZone);
  const w = parishWeek(p, now, 7);
  const h = "text-[11px] font-semibold uppercase tracking-[0.16em] text-marian";
  return (
    <div className="bg-paper">
      <style>{`@page { size: letter; margin: 0.5in } @media print { header, footer, aside, .no-print { display: none !important } body { background: #fff } .sheet { padding: 0 !important; max-width: none !important } }`}</style>
      <section className="sheet mx-auto max-w-3xl bg-paper px-4 py-10 text-ink sm:px-6">
        <p className="no-print mb-6 text-sm text-ink-soft">{t.insert}: Ctrl+P / ⌘P.</p>
        <h1 className="display text-3xl leading-tight">{t.insertTitle(p.parishName)}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {t.weekOf(fmtDate(now.iso, true, p.lang))} · {p.phone} · {p.hosts[0]}
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div className="space-y-6">
            {w.announcements.length ? (
              <section>
                <p className={h}>{t.announcements}</p>
                {w.announcements.map((a) => (
                  <p key={a.id} className="mt-2 text-[13px] leading-snug">
                    <strong>{a.title}.</strong> {a.body}
                  </p>
                ))}
              </section>
            ) : null}
            {w.masses.length ? (
              <section>
                <p className={h}>{t.masses}</p>
                {w.masses.map((m) => (
                  <p key={m.id} className="mt-2 text-[13px] leading-snug">
                    <strong>
                      {fmtDate(m.date, false, p.lang)}, {m.title}.
                    </strong>{" "}
                    {m.when ?? s.massTimes.inBulletin}
                    {m.body ? ` ${m.body}` : ""}
                  </p>
                ))}
              </section>
            ) : null}
            {w.diocese.length || w.bishop ? (
              <section>
                <p className={h}>{t.diocese}</p>
                {w.diocese.map((d) => (
                  <p key={d.id} className="mt-2 text-[13px] leading-snug">
                    <strong>{d.title}.</strong> {d.body}
                  </p>
                ))}
                {w.bishop ? (
                  <p className="mt-2 text-[13px] leading-snug">
                    <strong>{t.bishop}:</strong> {w.bishop.title}. {w.bishop.body} {p.hosts[0]}/diocese/voice
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>
          <div>
            <section>
              <p className={h}>{s.footer.mass}</p>
              <p className="mt-2 text-[13px] leading-snug">
                {p.masses.map((m) => `${s.days[m.day]} ${fmtRange({ date: "", start: m.start, end: m.end, title: "", kind: "worship" }, p.lang)}${m.lang ? ` (${m.lang})` : ""}`).join("; ")}.
              </p>
              {p.confession.length ? (
                <p className="mt-1 text-[13px] leading-snug">
                  {s.footer.confession}: {p.confession.map((c) => `${s.days[c.day]} ${fmtRange({ date: "", start: c.start, end: c.end, title: "", kind: "worship" }, p.lang)}`).join("; ")}.
                </p>
              ) : null}
            </section>
            {w.events.length ? (
              <section className="mt-6">
                <p className={h}>{t.events}</p>
                {w.events.map((o, i) => (
                  <p key={i} className="mt-2 text-[13px] leading-snug">
                    <strong>
                      {DAY_NAMES[new Date(`${o.date}T12:00:00Z`).getUTCDay()]} {fmtDate(o.date, false, p.lang)}, {fmtRange(o, p.lang)}.
                    </strong>{" "}
                    {o.title}
                    {o.where ? `, ${o.where}` : ""}
                    {o.note ? `. ${o.note}` : ""}
                  </p>
                ))}
              </section>
            ) : null}
          </div>
        </div>
        <p className="mt-8 text-[11px] text-ink-soft">{t.printed(fmtDate(now.iso, true, p.lang))}</p>
      </section>
    </div>
  );
}
