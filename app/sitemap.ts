import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["/", ...NAV.map((n) => n.href), "/register", "/mass-intentions", "/prayer-request"].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/events" || path === "/bulletin" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/mass-times" ? 0.9 : 0.6,
  }));
}
