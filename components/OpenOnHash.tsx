"use client";

import { useEffect } from "react";

/**
 * When the URL hash names a section that holds a closed <details>, open it,
 * so an index link or a shared link lands on the content and not a closed
 * row. Without JavaScript the row is one tap away, which is fine.
 */
export default function OpenOnHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      const details = el?.querySelector<HTMLDetailsElement>("details") ?? el?.closest("details");
      if (details) details.open = true;
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
