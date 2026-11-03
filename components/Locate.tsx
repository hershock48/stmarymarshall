"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * "Use my location": asks the browser once, then opens the finder at that
 * point. The point never leaves the URL bar except rounded to about seven
 * miles for the count of where searches come from (lib/tally.ts). Without
 * JavaScript the button is simply absent and the zip box does the job.
 */
export default function Locate({ label, busy, radius }: { label: string; busy: string; radius: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "denied">("idle");
  // Rendered the same on the server and the client (Node has a global
  // navigator too, without geolocation, so a render-time check here made
  // the server print nothing and the client print a button). A browser
  // without geolocation, or a refusal, simply takes the button away.
  if (state === "denied") return null;
  return (
    <button
      type="button"
      disabled={state === "busy"}
      onClick={() => {
        if (!("geolocation" in navigator)) return setState("denied");
        setState("busy");
        navigator.geolocation.getCurrentPosition(
          (pos) => router.push(`/diocese/near?q=${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}&r=${radius}`),
          () => setState("denied"),
          { maximumAge: 300000, timeout: 10000 },
        );
      }}
      className="inline-flex min-h-11 items-center rounded-sm border border-gold px-5 text-sm font-semibold text-gold-light transition-colors hover:bg-navy-soft disabled:opacity-60"
    >
      {state === "busy" ? busy : label}
    </button>
  );
}
