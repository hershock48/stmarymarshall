import type { Diocese, Finder } from "@/lib/types";
import { DEANERIES } from "./deaneries";
import { DIOCESE_EVENTS } from "./events";
import finder from "./finder.json";
import { NOTICES } from "./notices";
import { VOICE } from "./voice";

/**
 * The Diocese of Kalamazoo: nine counties of southwest Michigan, 59
 * parishes and missions in five deaneries, its own site on eCatholic with
 * the Parish Finder the platform reads weekly. The pilot diocese.
 */
const kalamazoo: Diocese = {
  slug: "kalamazoo",
  name: "Diocese of Kalamazoo",
  nameEs: "Diócesis de Kalamazoo",
  shortName: "Kalamazoo",
  site: "https://www.diokzoo.org/",
  siteHost: "diokzoo.org",
  timeZone: "America/Detroit",
  pitchHost: "kalamazoo.glazedweb.com",
  host: "finder.kalamazoo.glazedweb.com",
  bishop: "Bishop Edward M. Lohse",
  youtubeChannelId: "UCXU9wzoyj5a3ezOzJIErelg",
  finder: finder as Finder,
  events: DIOCESE_EVENTS,
  notices: NOTICES,
  voice: VOICE,
  deaneries: DEANERIES,
};

export default kalamazoo;
