// New PM internships from APM List, published by the deploy workflow as /apm.json (see scripts/apmlist-sync.mjs).
import { create } from 'zustand'
import type { Company } from './types'
import { daysBetween } from './time'

export interface ApmJob {
  id: string
  company: string
  title: string
  url: string
  locations: string[]
  /** date the posting went up (YYYY-MM-DD) */
  posted: string | null
  closes: string | null
  /** first day the feed saw it */
  first_seen: string
  /** the posting asks for an MBA */
  mba?: boolean
}

export const useApmFeed = create<{ jobs: ApmJob[]; updated_at: string | null; loaded: boolean }>(() => ({ jobs: [], updated_at: null, loaded: false }))

let last = 0
/** Fetch the feed (at most every 10 minutes unless forced). */
export async function loadApmFeed(force = false) {
  if (!force && Date.now() - last < 10 * 60000) return
  last = Date.now()
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}apm.json`, { cache: 'no-store' })
    const d = r.ok ? await r.json() : null
    useApmFeed.setState({ jobs: Array.isArray(d?.jobs) ? d.jobs : [], updated_at: d?.updated_at ?? null, loaded: true })
  } catch {
    useApmFeed.setState({ loaded: true })
  }
}

export const postedOn = (j: ApmJob) => j.posted ?? j.first_seen
/** Posted today (or later, if APM List dates it ahead): the fire. */
export const isFresh = (j: ApmJob, today: string) => postedOn(j) >= today
export const daysOld = (j: ApmJob, today: string) => Math.max(0, daysBetween(postedOn(j), today))

/** Jobs not yet added to the tracker or hidden, newest first. */
export function openJobs(jobs: ApmJob[], companies: Company[], hidden: string[] | undefined): ApmJob[] {
  const added = new Set(companies.map((c) => c.apm_id).filter(Boolean))
  const gone = new Set(hidden ?? [])
  return jobs.filter((j) => !added.has(j.id) && !gone.has(j.id))
}

/** A tracker company from a posting: job track "to apply", next step "Apply" today. Posted today = P1. */
export function companyFromJob(j: ApmJob, id: string, now: string, today: string): Company {
  return {
    id, name: j.company, industry: null, city: j.locations[0]?.split(',')[0]?.trim() || null, pull: null, pull_note: null,
    job: { role: j.title, link: j.url, deadline: j.closes, referral: false, status: 'to_apply' }, mitacs: null,
    next: 'Apply', next_on: today, priority: isFresh(j, today) ? 1 : null, notes: null, apm_id: j.id, created_at: now,
  }
}
