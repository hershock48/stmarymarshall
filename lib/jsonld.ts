import { DAY_NAMES } from "@/lib/schedule";
import type { Parish } from "@/lib/types";

/** Serialize for a <script type="application/ld+json">, with </script> made safe. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * schema.org Church, so a search engine or an answer engine can quote the
 * address and the Mass times from the source. Mass times are events on the
 * church rather than opening hours, because the building is not a shop.
 */
export function churchSchema(p: Parish) {
  const url = `https://${p.hosts[0]}`;
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${url}/#church`,
    name: p.name,
    alternateName: p.parishName,
    url,
    telephone: p.phoneHref.replace("tel:", ""),
    ...(p.email ? { email: p.email } : {}),
    image: [`${url}${p.photos.hero.src}`],
    ...(p.founded ? { foundingDate: String(p.founded) } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: p.church.street,
      addressLocality: p.church.city,
      addressRegion: p.church.state,
      postalCode: p.church.zip,
      addressCountry: "US",
    },
    ...(p.geo ? { geo: { "@type": "GeoCoordinates", latitude: p.geo.lat, longitude: p.geo.lng } } : {}),
    hasMap: p.mapUrl,
    sameAs: [p.facebook, p.youtube].filter(Boolean),
    parentOrganization: { "@type": "Organization", name: p.diocese.name, url: p.diocese.url },
    event: p.masses.map((m) => ({
      "@type": "Event",
      name: `${m.label ?? DAY_NAMES[m.day]} Mass${m.lang ? ` (${m.lang})` : ""}`,
      eventSchedule: { "@type": "Schedule", byDay: `https://schema.org/${DAY_NAMES[m.day]}`, startTime: m.start, repeatFrequency: "P1W", scheduleTimezone: p.timeZone },
      location: { "@id": `${url}/#church` },
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: { "@id": `${url}/#church` },
    })),
  };
}
