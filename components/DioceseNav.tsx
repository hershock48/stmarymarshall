import Link from "next/link";
import { strings, type Lang } from "@/lib/i18n";

/** The four diocese pages, as a row under each one's hero. */
export default function DioceseNav({ lang, current }: { lang: Lang; current: "parishes" | "near" | "events" | "groups" }) {
  const s = strings(lang).diocese.nav;
  const items: { key: typeof current; href: string; label: string }[] = [
    { key: "near", href: "/diocese/near", label: s.near },
    { key: "events", href: "/diocese/events", label: s.events },
    { key: "groups", href: "/diocese/groups", label: s.groups },
    { key: "parishes", href: "/diocese", label: s.parishes },
  ];
  return (
    <nav aria-label="Diocese" className="border-b border-navy-line bg-navy-soft">
      <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-1 px-4 sm:px-6 lg:px-8">
        {items.map((i) => (
          <li key={i.key}>
            <Link href={i.href} aria-current={i.key === current ? "page" : undefined} className={`inline-block min-h-11 py-3 text-sm font-semibold ${i.key === current ? "border-b-2 border-gold text-cream" : "text-dim hover:text-cream"}`}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
