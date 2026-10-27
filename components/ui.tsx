import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

/**
 * The small set of page bones every route shares. Kept in one file so the
 * rhythm (band padding, heading rule, link style) is set once.
 */

export function PageHero({
  title,
  lede,
  photo,
  alt,
  priority,
}: {
  title: string;
  lede?: string;
  photo?: StaticImageData | string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      {photo && (
        <>
          <Image src={photo} alt={alt ?? ""} fill priority={priority} sizes="100vw" className="object-cover object-center opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/30" aria-hidden="true" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
        <h1 className="display max-w-3xl text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">{title}</h1>
        {lede && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-dim">{lede}</p>}
      </div>
    </section>
  );
}

export function Band({ children, tone = "paper", id, className = "" }: { children: ReactNode; tone?: "paper" | "navy" | "soft"; id?: string; className?: string }) {
  const ground = tone === "paper" ? "paper" : tone === "soft" ? "bg-navy-soft text-cream" : "bg-navy text-cream";
  return (
    <section id={id} className={`${ground} ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">{children}</div>
    </section>
  );
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`display rule text-3xl leading-tight sm:text-4xl ${className}`}>{children}</h2>;
}

/** A link on paper. */
export function A({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      className="inline-block min-h-6 font-semibold text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/** A phone or email string turned into the right link, on paper. */
export function Contact({ text }: { text: string }) {
  // Split on commas and "or" so each phone or email becomes its own link.
  const parts = text.split(/(\(\d{3}\) \d{3}-\d{4}(?: ext\. \d+)?|[\w.+-]+@[\w-]+\.[\w.]+)/g);
  return (
    <p className="text-[15px] leading-relaxed text-ink-soft">
      {parts.map((p, i) => {
        if (/^\(\d{3}\)/.test(p)) {
          const digits = p.replace(/\D/g, "").slice(0, 10);
          const ext = p.match(/ext\. (\d+)/)?.[1];
          return (
            <a key={i} href={`tel:+1${digits}${ext ? `;ext=${ext}` : ""}`} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian">
              {p}
            </a>
          );
        }
        if (/@/.test(p)) {
          return (
            <a key={i} href={`mailto:${p}`} className="font-semibold text-marian underline decoration-marian/40 underline-offset-4 hover:decoration-marian">
              {p}
            </a>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </p>
  );
}

export function Prose({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="space-y-4 text-[17px] leading-relaxed text-ink">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/** A native-details accordion row on paper. Open without JavaScript. */
export function Fold({ id, title, children, open }: { id: string; title: string; children: ReactNode; open?: boolean }) {
  return (
    <details id={id} className="fold border-b border-paper-dim" open={open}>
      <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-left">
        <span className="display text-2xl leading-tight text-ink">{title}</span>
        <svg className="chev h-5 w-5 shrink-0 text-marian" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

export function GoldButton({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-sm bg-gold px-6 font-semibold text-navy transition-colors hover:bg-gold-light"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function LineButton({ href, children, external, onPaper }: { href: string; children: ReactNode; external?: boolean; onPaper?: boolean }) {
  const look = onPaper ? "border-marian text-marian hover:bg-marian hover:text-paper" : "border-gold text-gold-light hover:bg-gold hover:text-navy";
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-sm border px-6 font-semibold transition-colors ${look}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
