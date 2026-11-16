import { describe, expect, it } from 'vitest'
import { postingsFrom, toFeed } from './apmlist-lib.mjs'

const posting = (id, extra = {}) => ({
  '@type': 'JobPosting', title: 'Product Manager Intern', url: `https://apmlist.org/job/${id}`,
  datePosted: '2026-11-16T00:00:00+00:00', validThrough: '2026-12-16T00:00:00+00:00',
  hiringOrganization: { name: 'Acme' }, jobLocation: [{ address: { addressLocality: 'Toronto, ON, Canada' } }], description: 'Build things.', ...extra,
})
const page = (items) => `<html><script type="application/ld+json">${JSON.stringify({ '@type': 'ItemList', itemListElement: items.map((item) => ({ item })) })}</script></html>`

describe('APM List feed', () => {
  it('reads the JobPostings from the page', () => {
    expect(postingsFrom(page([posting('a'), posting('b')])).length).toBe(2)
    expect(postingsFrom('<html>nothing</html>')).toEqual([])
  })
  it('keeps MBA roles (tagged), skips US-citizen-only roles and duplicates', () => {
    const jobs = toFeed([posting('a'), posting('a'), posting('m', { description: 'Currently enrolled in an MBA program' }), posting('c', { description: 'Must be a U.S. citizen' })], [], '2026-11-16')
    expect(jobs.map((j) => [j.id, j.mba])).toEqual([['a', false], ['m', true]])
    expect(jobs[0]).toMatchObject({ company: 'Acme', posted: '2026-11-16', closes: '2026-12-16', locations: ['Toronto, ON, Canada'], first_seen: '2026-11-16' })
  })
  it('keeps the first day a job was seen', () => {
    const jobs = toFeed([posting('a')], [{ id: 'a', first_seen: '2026-11-10' }], '2026-11-16')
    expect(jobs[0].first_seen).toBe('2026-11-10')
  })
})
