import { SITE } from "@/lib/site";
import { MASSES, DAY_NAMES } from "@/lib/schedule";

/** Serialize for a <script type="application/ld+json">, with </script> made safe. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * schema.org Church, so a search engine or an answer engine can quote the
 * address and the Mass times from the source. Mass times are listed as
 * events on the church rather than opening hours, because the building is
 * not a shop. Phone in E.164.
 */
export const churchSchema = {
  "@context": "https://schema.org",
  "@type": "Church",
  "@id": `${SITE.url}/#church`,
  name: SITE.name,
  alternateName: SITE.parish,
  url: SITE.url,
  telephone: "+12697813949",
  email: SITE.email,
  image: [`${SITE.url}/img/nave-easter.jpg`],
  foundingDate: String(SITE.founded),
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.church.street,
    addressLocality: SITE.church.city,
    addressRegion: SITE.church.state,
    postalCode: SITE.church.zip,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  hasMap: SITE.mapUrl,
  sameAs: [SITE.facebook],
  parentOrganization: { "@type": "Organization", name: SITE.diocese.name, url: SITE.diocese.url },
  event: MASSES.map((m) => ({
    "@type": "Event",
    name: `${m.label ?? DAY_NAMES[m.day]} Mass`,
    eventSchedule: {
      "@type": "Schedule",
      byDay: `https://schema.org/${DAY_NAMES[m.day]}`,
      startTime: m.start,
      repeatFrequency: "P1W",
      scheduleTimezone: SITE.timeZone,
    },
    location: { "@id": `${SITE.url}/#church` },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@id": `${SITE.url}/#church` },
  })),
};
