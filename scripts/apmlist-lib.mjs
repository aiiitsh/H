// APM List feed: the PM internships on apmlist.org, from the page's schema.org JobPosting data.
// Keeps MBA roles (tagged mba); skips US-citizen-only ones. Remembers when each job was first seen.

const MBA = /\bMBA\b|Master of Business Administration/i
const CITIZEN = /U\.?S\.? citizen|citizenship is required|security clearance|must be a U\.?S\.? person/i

const day = (iso) => (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : null)

/** Every JobPosting inside the page's JSON-LD ItemLists. */
export function postingsFrom(html) {
  const out = []
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let d
    try { d = JSON.parse(m[1]) } catch { continue }
    if (d?.['@type'] !== 'ItemList' || !Array.isArray(d.itemListElement)) continue
    for (const el of d.itemListElement) if (el?.item?.['@type'] === 'JobPosting') out.push(el.item)
  }
  return out
}

/** Postings → feed jobs, filtered, de-duplicated, newest first. `prev` keeps first_seen dates; `today` is YYYY-MM-DD. */
export function toFeed(postings, prev = [], today) {
  const seen = new Map(prev.map((j) => [j.id, j.first_seen]))
  const jobs = new Map()
  for (const p of postings) {
    const text = `${p.title ?? ''} ${p.name ?? ''} ${p.description ?? ''}`
    if (CITIZEN.test(p.description ?? '')) continue
    const url = typeof p.url === 'string' ? p.url : ''
    const id = /\/job\/([\w-]+)/.exec(url)?.[1] ?? url
    if (!id || jobs.has(id)) continue
    jobs.set(id, {
      id,
      company: p.hiringOrganization?.name ?? 'Unknown',
      title: p.title ?? p.name ?? 'PM intern',
      url,
      locations: (Array.isArray(p.jobLocation) ? p.jobLocation : [p.jobLocation]).map((l) => l?.address?.addressLocality).filter(Boolean),
      posted: day(p.datePosted),
      closes: day(p.validThrough),
      first_seen: seen.get(id) ?? today,
      mba: MBA.test(text),
    })
  }
  return [...jobs.values()].sort((a, b) => (b.posted ?? '').localeCompare(a.posted ?? '') || a.company.localeCompare(b.company))
}
