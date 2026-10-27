"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";

/**
 * A link to the site's home that stays inside the demo on the pitch host.
 *
 * On stmarymarshall.glazedweb.com the root is the proposal letter and the
 * site lives at /demo (next.config.ts). A logo pointing at "/" would throw
 * the pastor out of his own site and back into the sales document
 * (glaze.md). The server snapshot is "/"; the client reads the hostname
 * once it has one, through useSyncExternalStore so nothing sets state in
 * an effect. On the parish's own domain nothing changes. Delete with the
 * pitch rewrites once the parish says yes.
 */
const PITCH_HOST = "stmarymarshall.glazedweb.com";
const noop = () => () => {};
const onClient = () => (window.location.hostname === PITCH_HOST ? "/demo" : "/");
const onServer = () => "/";

export default function HomeLink({ className, children, ...rest }: { className?: string; children: ReactNode; "aria-label"?: string }) {
  const href = useSyncExternalStore(noop, onClient, onServer);
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
