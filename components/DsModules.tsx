import Link from "next/link";
import type { SiteLink, SiteModule, SitePerson } from "@/lib/dsite";

/**
 * A diocese page's modules, in the order the diocese stacked them. Rich
 * text was rebuilt by the reader against a short list of allowed tags
 * (tools/diocese-site-import.mjs, checked by lib/dsite.ts safeFragment in
 * the tests), so it is set as markup; everything else is plain data.
 */
const isOwn = (href: string) => href.startsWith("/") || href.startsWith("#");
const linkClass = "font-semibold text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian";

export function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (isOwn(href))
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  const web = /^https?:/i.test(href);
  return (
    <a href={href} className={className} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

function Title({ children }: { children: string }) {
  return children ? <h2 className="display rule text-2xl leading-tight text-ink sm:text-3xl">{children}</h2> : null;
}

export function PersonCard({ p }: { p: SitePerson }) {
  const tel = p.phone ? `tel:+1${p.phone.replace(/x.*$/i, "").replace(/\D/g, "").slice(-10)}${/x\s*(\d+)/i.test(p.phone) ? `;ext=${/x\s*(\d+)/i.exec(p.phone)![1]}` : ""}` : null;
  return (
    <li className="border-b border-paper-dim py-3 last:border-0">
      <p className="font-semibold text-ink">{p.name}</p>
      {p.role ? <p className="text-[15px] leading-snug text-ink-soft">{p.role}</p> : null}
      <p className="mt-1 flex flex-wrap gap-x-5 text-[15px]">
        {tel ? (
          <a href={tel} className={linkClass}>
            {p.phone}
          </a>
        ) : null}
        {p.email ? (
          <a href={`mailto:${p.email}`} className={`${linkClass} break-all`}>
            {p.email}
          </a>
        ) : null}
      </p>
    </li>
  );
}

function LinkList({ items, documents }: { items: SiteLink[]; documents?: boolean }) {
  return (
    <ul className="mt-3 space-y-2 text-[16px]">
      {items.map((i, n) => (
        <li key={n} className="flex gap-2">
          <span aria-hidden="true" className="mt-[2px] text-ink-soft">
            {documents ? "▤" : "→"}
          </span>
          <SmartLink href={i.href} className={linkClass}>
            {i.label}
            {documents && /\.pdf(\?|$)/i.test(i.href) ? <span className="font-normal text-ink-soft"> (PDF)</span> : null}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

export default function DsModules({ modules, source }: { modules: SiteModule[]; source: string }) {
  // Buttons the diocese set side by side stay side by side.
  const groups: (SiteModule | { kind: "buttons"; items: Extract<SiteModule, { kind: "button" }>[] })[] = [];
  for (const m of modules) {
    const last = groups[groups.length - 1];
    if (m.kind === "button") {
      if (last && last.kind === "buttons") last.items.push(m);
      else groups.push({ kind: "buttons", items: [m] });
    } else groups.push(m);
  }
  return (
    <div className="space-y-10">
      {groups.map((m, i) => {
        if (m.kind === "text" || m.kind === "other")
          return m.html ? (
            <section key={i}>
              <Title>{m.title}</Title>
              <div className={`ds-prose ${m.title ? "mt-4" : ""}`} dangerouslySetInnerHTML={{ __html: m.html }} />
            </section>
          ) : null;
        if (m.kind === "people")
          return (
            <section key={i}>
              <Title>{m.title || "Contact"}</Title>
              <ul className="mt-2">
                {m.people.map((p) => (
                  <PersonCard key={p.name + p.role} p={p} />
                ))}
              </ul>
            </section>
          );
        if (m.kind === "documents" || m.kind === "links")
          return (
            <section key={i}>
              <Title>{m.title || (m.kind === "documents" ? "Documents" : "Links")}</Title>
              <LinkList items={m.items} documents={m.kind === "documents"} />
            </section>
          );
        if (m.kind === "buttons")
          return (
            <ul key={i} className="flex flex-wrap gap-3">
              {m.items.map((b, n) => (
                <li key={n}>
                  <SmartLink href={b.href} className="inline-flex min-h-12 items-center justify-center rounded-sm border border-marian px-5 text-center font-semibold text-marian transition-colors hover:bg-marian hover:text-paper">
                    {b.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          );
        if (m.kind === "image") {
          const im = m.images[0];
          const pic = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={im.src} alt={im.alt} width={im.w ?? undefined} height={im.h ?? undefined} loading="lazy" decoding="async" className="h-auto max-h-[640px] w-auto max-w-full rounded-sm" />
          );
          return (
            <figure key={i}>
              {m.href ? (
                <SmartLink href={m.href} className="inline-block">
                  {pic}
                  {im.alt ? null : <span className="sr-only">{m.title || "Open the linked page"}</span>}
                </SmartLink>
              ) : (
                pic
              )}
              {m.title ? <figcaption className="mt-2 text-sm text-ink-soft">{m.title}</figcaption> : null}
            </figure>
          );
        }
        if (m.kind === "gallery")
          return (
            <section key={i}>
              <Title>{m.title}</Title>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {m.images.slice(0, 12).map((im, n) => (
                  <li key={n}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.src} alt={im.alt} width={im.w ?? undefined} height={im.h ?? undefined} loading="lazy" decoding="async" className="h-auto w-full rounded-sm" />
                  </li>
                ))}
              </ul>
            </section>
          );
        if (m.kind === "video")
          return (
            <section key={i}>
              <Title>{m.title}</Title>
              <a href={`https://www.youtube.com/watch?v=${m.youtube}`} target="_blank" rel="noopener noreferrer" className={`group relative block max-w-xl overflow-hidden rounded-sm ${m.title ? "mt-3" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${m.youtube}/hqdefault.jpg`} alt="" width={480} height={360} loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-navy/85 px-4 py-2 text-sm font-semibold text-cream group-hover:bg-navy">Play {m.title ? `“${m.title}”` : "the video"} on YouTube</span>
              </a>
            </section>
          );
        if (m.kind === "form")
          return (
            <section key={i} className="rounded-sm border border-paper-dim bg-paper-dim/40 p-5">
              <Title>{m.title}</Title>
              <p className={`text-[16px] leading-relaxed text-ink ${m.title ? "mt-3" : ""}`}>
                {m.what === "signup" ? "The sign-up for this is on the diocese’s current site." : "This form is on the diocese’s current site."}{" "}
                <a href={m.source} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {m.what === "signup" ? "Sign up there" : "Open the form there"}
                </a>
                . On the platform it would be a form of the diocese’s own that reaches the right office.
              </p>
            </section>
          );
        return null;
      })}
      <p className="border-t border-paper-dim pt-4 text-sm text-ink-soft">
        Read from{" "}
        <a href={source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          the diocese’s own page
        </a>
        .
      </p>
    </div>
  );
}
