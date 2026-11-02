/**
 * The weekly bulletin list, read from DiscoverMass.
 *
 * Diocesan Publications prints most of the diocese's bulletins and hosts the
 * PDFs on discovermass.com; parishes hold no copy of their own. The page is
 * fetched server side and the dated download links are pulled out of the
 * markup, cached six hours. If the fetch fails or the markup changes, the
 * page shows the plain link, which is what the old sites did.
 *
 * A REMOTE SOURCE: verify on the deployment, not just locally (glaze.md).
 * DiscoverMass single-quotes its attributes; the regex accepts both.
 */
export type Bulletin = { label: string; href: string };

export async function bulletins(url: string | undefined): Promise<Bulletin[]> {
  if (!url || !/discovermass\.com/.test(url)) return [];
  try {
    const res = await fetch(url, { next: { revalidate: 21600 }, headers: { "user-agent": "parish bulletin page (+https://glazedweb.com)" } });
    if (!res.ok) return [];
    const html = await res.text();
    const out: Bulletin[] = [];
    const seen = new Set<string>();
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
