"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";

/**
 * A link to the site's home that stays inside the demo on a pitch host.
 *
 * On a parish's pitch host the root is the proposal letter and the site
 * lives at /demo (next.config.ts). A logo pointing at "/" would throw the
 * pastor out of his own site and back into the sales document (glaze.md).
 * The server snapshot is "/"; the client reads the hostname once it has
 * one, through useSyncExternalStore so nothing sets state in an effect.
 */
const noop = () => () => {};
const onServer = () => "/";

export default function HomeLink({ pitchHost, className, children, ...rest }: { pitchHost?: string; className?: string; children: ReactNode; "aria-label"?: string }) {
  const onClient = () => (pitchHost && window.location.hostname === pitchHost ? "/demo" : "/");
  const href = useSyncExternalStore(noop, onClient, onServer);
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
