import Image from "next/image";
import type { Mark as MarkData } from "@/lib/types";

/**
 * The parish mark: letters inside a ring, or the parish's own logo.
 *
 * The ring-and-letter form came from St. Mary's own favicon (a blue ring
 * with an M whose outer legs run to the ring), redrawn as geometry so it
 * scales; the M keeps that drawing. Any other letters are set in the
 * display face. The colour is currentColor so the header paints it gold
 * and the icon tool paints it on navy.
 *
 * width and height are stated (glaze.md): a viewBox alone has no intrinsic
 * size and Safari falls back to 150px.
 */
export default function Mark({ mark, size = 36, className = "" }: { mark: MarkData; size?: number; className?: string }) {
  if (mark.type === "image") {
    const h = size;
    const w = Math.round((mark.width / mark.height) * size);
    return <Image src={mark.src} alt="" width={w} height={h} className={className} priority />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinejoin="miter" strokeLinecap="butt" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45" strokeWidth="7" />
      {mark.letters === "M" ? (
        <path d="M22 79V21L50 60L78 21V79" strokeWidth="8" />
      ) : (
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="currentColor" stroke="none" fontFamily="var(--font-display)" fontWeight="600" fontSize={mark.letters.length > 1 ? 44 : 60}>
          {mark.letters}
        </text>
      )}
    </svg>
  );
}
