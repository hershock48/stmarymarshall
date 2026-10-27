/**
 * The parish mark: an M inside a ring.
 *
 * Lifted from the parish's own favicon (files.ecatholic.com/6225/favicon.ico,
 * a 48px blue ring with an M whose outer legs run to the ring), redrawn as
 * geometry so it scales. Nothing added. The colour is currentColor so the
 * header paints it gold and the icon tool paints it on navy.
 *
 * width and height are stated (glaze.md): a viewBox alone has no intrinsic
 * size and Safari falls back to 150px.
 */
export default function Mark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="miter"
      strokeLinecap="butt"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="45" strokeWidth="7" />
      <path d="M22 79V21L50 60L78 21V79" strokeWidth="8" />
    </svg>
  );
}
