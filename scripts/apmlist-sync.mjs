#!/usr/bin/env node
// Runs in the deploy workflow (every 3 hours): writes public/apm.json from apmlist.org for the Companies tab.
// If apmlist.org can't be read, the last published feed is kept so the site still has one.
import { mkdirSync, writeFileSync } from 'node:fs'
import { postingsFrom, toFeed } from './apmlist-lib.mjs'

const SITE = process.env.SITE_FEED_URL ?? 'https://aiiitsh.github.io/H/apm.json'
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto' }).format(new Date())

async function previous() {
  try {
    const r = await fetch(`${SITE}?t=${Date.now()}`)
    return r.ok ? await r.json() : null
  } catch { return null }
}

const prev = await previous()
let feed
try {
  const r = await fetch('https://apmlist.org/', { headers: { 'User-Agent': 'H-feed/1.0 (personal job tracker; daily)' } })
  if (!r.ok) throw new Error(`apmlist.org ${r.status}`)
  const postings = postingsFrom(await r.text())
  if (!postings.length) throw new Error('no job postings found on the page')
  feed = { updated_at: new Date().toISOString(), source: 'https://apmlist.org/', jobs: toFeed(postings, prev?.jobs ?? [], today) }
  console.log(`apm.json: ${feed.jobs.length} jobs (${postings.length} on the page)`)
} catch (e) {
  console.warn(`apmlist sync failed: ${e.message}. Keeping the last feed.`)
  feed = prev ?? { updated_at: null, source: 'https://apmlist.org/', jobs: [], error: String(e.message) }
}
mkdirSync('public', { recursive: true })
writeFileSync('public/apm.json', JSON.stringify(feed))
