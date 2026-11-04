import type { Diocese, Finder } from "@/lib/types";
import { DEANERIES } from "./deaneries";
import { DIOCESE_EVENTS } from "./events";
import finder from "./finder.json";
import { NOTICES } from "./notices";
import { VOICE } from "./voice";

/**
 * The Diocese of Lansing: ten counties of central and southeast Michigan,
 * 73 parishes in six vicariates, its own Drupal site with a parish directory
 * (read by tools/lansing-import.mjs) and no Mass times of its own, so finder
 * rows carry the parish, its address, phone and site, and a parish on the
 * platform answers with its own schedule. The second diocese; not yet
 * pitched.
 */
const lansing: Diocese = {
  slug: "lansing",
  name: "Diocese of Lansing",
  nameEs: "Diócesis de Lansing",
  shortName: "Lansing",
  site: "https://www.dioceseoflansing.org/",
  siteHost: "dioceseoflansing.org",
  timeZone: "America/Detroit",
  pitchHost: "lansing.glazedweb.com",
  host: "finder.lansing.glazedweb.com",
  bishop: "Bishop Earl Boyea",
  finder: finder as Finder,
  events: DIOCESE_EVENTS,
  notices: NOTICES,
  voice: VOICE,
  deaneries: DEANERIES,
};

export default lansing;
