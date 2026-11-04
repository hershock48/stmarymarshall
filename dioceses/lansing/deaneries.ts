import type { Deanery } from "@/lib/types";
import vicariates from "./vicariates.json";

/**
 * The Diocese of Lansing groups its parishes in six vicariates, by county,
 * which is what a deanery is called there. The roster is read from the
 * diocese's own parish list by tools/lansing-import.mjs (vicariates.json);
 * the directory does not say which parishes share a pastor, so each parish
 * stands alone in its "collaborative" until the diocese tells us otherwise.
 * The empty "Public Associations of the Faithful" group is left out.
 */
export const DEANERIES: Deanery[] = (vicariates as Deanery[]).filter((v) => v.collaboratives.length > 0);
