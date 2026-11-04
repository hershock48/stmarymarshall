import Image from "next/image";
import Link from "next/link";
import { strings } from "@/lib/i18n";
import { fmtDate } from "@/lib/schedule";
import type { Parish } from "@/lib/types";
import { latestVoice, thumb, watchUrl } from "@/lib/voice";
import { dioceseOfParish } from "@/dioceses";

/**
 * The bishop's newest message on a parish home page: one card between the
 * hero and the parish's own words, in the parish's language where the
 * message exists in it. The diocese writes the entry once
 * (dioceses/kalamazoo/voice.ts) and every site carries it; a parish turns it
 * off with bishopsVoice: false.
 */
export default function BishopsVoice({ parish: p }: { parish: Parish }) {
  if (p.bishopsVoice === false) return null;
  const v = latestVoice(dioceseOfParish(p), p.lang);
  if (!v) return null;
  const t = strings(p.lang).diocese.voice;
  return (
    <section aria-labelledby="bishop" className="border-b border-paper-dim bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        {v.youtube ? (
          <a href={watchUrl(v.youtube)} target="_blank" rel="noopener noreferrer" className="block shrink-0 overflow-hidden rounded-sm" aria-hidden="true" tabIndex={-1}>
            <Image src={thumb(v.youtube)} alt="" width={192} height={108} className="h-[108px] w-[192px] object-cover" />
          </a>
        ) : null}
        <div className="min-w-0">
          <p id="bishop" className="text-xs font-semibold uppercase tracking-[0.18em] text-marian">{t.card}</p>
          <p className="mt-1 text-lg font-semibold leading-snug text-ink">{v.title}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {v.lede} {fmtDate(v.date, true, p.lang)}.
          </p>
          <p className="mt-2 flex flex-wrap gap-x-5 text-sm font-semibold">
            {v.youtube ? (
              <a href={watchUrl(v.youtube)} target="_blank" rel="noopener noreferrer" className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                {t.watch}
              </a>
            ) : v.audio ? (
              <a href={v.audio.url} className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
                {t.listen}
              </a>
            ) : null}
            <Link href="/diocese/voice" className="inline-block min-h-6 text-marian underline decoration-marian/40 underline-offset-4">
              {t.all}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
