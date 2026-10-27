/**
 * Every parish fact, once. A correction is one edit here (glaze.md).
 *
 * Every value below was read off the parish's own site, stmarymarshall.org,
 * on 2026-10-27, with the parish's permission to reuse its photos and text
 * (Kevin, 2026-10-27). Nothing is guessed. Where the old site contradicted
 * itself the README says which value won and why.
 */
export const SITE = {
  name: "St. Mary Catholic Church",
  shortName: "St. Mary",
  parish: "St. Mary Parish",
  tagline: "A Catholic parish in Marshall, Michigan, since 1852",
  // The parish already owns this domain; it is the canonical host. Preview
  // hosts are noindex in next.config.ts.
  url: "https://stmarymarshall.org",
  phone: "(269) 781-3949",
  phoneHref: "tel:+12697813949",
  email: "stmarymarshall@aol.com",
  // The church and the office are two addresses. The church is on the corner
  // of Eagle and Green; the office and all mail go to Hanover Street. The old
  // site's directions link used 214 S. Eagle St. for the church door.
  church: {
    street: "214 S. Eagle St.",
    corner: "corner of Eagle and Green Streets",
    city: "Marshall",
    state: "MI",
    zip: "49068",
  },
  office: {
    street: "212 W. Hanover St.",
    city: "Marshall",
    state: "MI",
    zip: "49068",
  },
  // Same coordinates the old site's map link carried.
  geo: { lat: 42.2709048, lng: -84.9615026 },
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=214+S.+Eagle+Street%2C+Marshall%2C+MI+49068",
  facebook: "https://www.facebook.com/St-Mary-Marshall-101547054894575",
  diocese: { name: "Diocese of Kalamazoo", url: "https://www.diokzoo.org/" },
  founded: 1852,
  churchDedicated: 1889,
  timeZone: "America/Detroit",
} as const;

/**
 * Eight items, and Give is the header's button rather than a ninth. Nine
 * only fit at 1280px and up, so every laptop got the hamburger; eight fit
 * from 1024. Give as the button follows what the strongest parish sites do
 * (Nativity, St. Monica) and keeps the one money action visible everywhere.
 */
export const NAV = [
  { href: "/new", label: "New Here?" },
  { href: "/mass-times", label: "Mass Times" },
  { href: "/about", label: "About" },
  { href: "/sacraments", label: "Sacraments" },
  { href: "/faith-formation", label: "Faith Formation" },
  { href: "/ministries", label: "Ministries" },
  { href: "/events", label: "Calendar" },
  { href: "/bulletin", label: "Bulletin" },
] as const;

/** Links that leave the site. Kept here so a dead one is one edit. */
export const LINKS = {
  bulletins: "https://discovermass.com/church/st-mary-marshall-mi/",
  // Vanco online giving, the parish's existing processor. Not ours to replace.
  giveOnline: "https://secure.myvanco.com/L-ZG5R/home",
  endowment: "https://www.osvhub.com/catholic-foundation-of-southwestern-michigan/giving/funds/st-mary-parish-endowment-fund",
  catholicFoundation: "https://cfswm.org/",
  swmCatholic: "https://www.diokzoo.org/southwest-michigan-catholic",
  frCraigBio: "https://swmcatholic.org/news/from-music-man-to-holy-man",
  renovationVideo: "https://www.youtube.com/watch?v=-PcS1tCIoe0",
  // The old site's deep link (collections/building.php?id=208-792-34) now
  // redirects to the census home page, so that is what is linked.
  stainedGlassCensus: "https://michiganstainedglass.org/",
  // Closed for 2026 to 27 when checked on 2026-10-27; kept for next year.
  reRegistration: "https://forms.gle/GijYeCqsrgJTZrJT6",
  childrensChoirRegistration:
    "https://docs.google.com/forms/d/e/1FAIpQLSfcI9TdW_n3Od9Xxz4e4G_EwdgIr3VdiQOp8b_MBlS2BbDwNQ/viewform",
  lifeTeen: "https://lifeteen.com/",
  diocesanSchools: "https://catholicschools.diokzoo.org/",
  battleCreekSchools: "https://bcacs.org/",
  findAMass: "https://findamass.org/",
  usccbReadings: "https://bible.usccb.org/bible/readings/",
  usccbReadingsEs: "https://bible.usccb.org/es/bible/lecturas/",
} as const;

/**
 * Documents the old site hosted on files.ecatholic.com. Copied into
 * public/docs so they survive leaving eCatholic. When the parish updates one,
 * the new file replaces the old at the same path.
 */
export const DOCS = {
  registrationForm: "/docs/registration-form.pdf",
  cemeteryMap: "/docs/cemetery-map.pdf",
  cemeteryRegulations: "/docs/cemetery-regulations.pdf",
  cemeteryFees: "/docs/cemetery-fees.pdf",
  reSundayCalendar: "/docs/re-sunday-calendar-2026-27.pdf",
  reTuesdayCalendar: "/docs/re-tuesday-calendar-2026-27.pdf",
  directoryPriceList: "/docs/directory-price-list.pdf",
  frCraigMidsummer2025: "/docs/fr-craig-midsummer-update-2025.pdf",
  frCraigChristmas2025: "/docs/fr-craig-christmas-letter-2025.pdf",
} as const;
