/**
 * The weekly bulletin list, read from DiscoverMass.
 *
 * Diocesan Publications prints the parish bulletin and hosts the PDFs on
 * discovermass.com; the parish has no copy of its own. The page is fetched
 * server side and the dated download links are pulled out of the markup.
 * Cached for six hours. If the fetch fails or the markup changes, the page
 * shows the plain link to DiscoverMass, which is what the old site did.
 *
 * A REMOTE SOURCE: verify on the deployment, not just locally (glaze.md).
 * The regex is deliberately loose: a link whose text is a date and whose
 * href is the bulletins download endpoint.
 */
import { LINKS } from "@/lib/site";

export type Bulletin = { label: string; href: string };

export async function bulletins(): Promise<Bulletin[]> {
  try {
    const res = await fetch(LINKS.bulletins, {
      next: { revalidate: 21600 },
      headers: { "user-agent": "stmarymarshall.org bulletin page (+https://stmarymarshall.org)" },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const out: Bulletin[] = [];
    const seen = new Set<string>();
    // DiscoverMass single-quotes its attributes; the first version of this
    // regex only accepted double quotes and matched nothing.
    const re = /<a[^>]+href=['"](https:\/\/bulletins\.discovermass\.com\/download\.php\?bulletin=[^'"]+)['"][^>]*>\s*([A-Z][a-z]{2} \d{1,2}, \d{4})\s*<\/a>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const href = m[1].replace(/&amp;/g, "&");
      if (seen.has(href)) continue;
      seen.add(href);
      out.push({ label: m[2], href });
    }
    return out;
  } catch {
    return [];
  }
}
