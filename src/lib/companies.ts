// Companies tracker: one row per company, with the job application and the Mitacs outreach side by side.
// Lives in app_state.settings.companies (merged by id like tasks), never in the code.
import type { Company, CompanyJobStatus, MitacsStatus, Pull } from './types'
import { localDate } from './time'
import { canadaOfficeOf, type CanadaOffice } from '../data/canadaOffices'

export const JOB_STATUS: [CompanyJobStatus, string][] = [
  ['to_apply', 'To apply'], ['applied', 'Applied'], ['interview', 'Interview'], ['offer', 'Offer'], ['no', 'No'],
]
export const MITACS_STATUS: [MitacsStatus, string][] = [
  ['to_contact', 'To reach out'], ['linkedin', 'LinkedIn sent'], ['emailed', 'Emailed'], ['replied', 'Replied'], ['meeting', 'Meeting'], ['project', 'Project'], ['no', 'No'],
]
/** How a company felt to him: the one-line "pull" notes behind picking Mitacs industries. */
export const PULLS: [Pull, string][] = [['pulled', 'Pulled'], ['neutral', 'Neutral'], ['pushed', 'Pushed away']]

export const labelOf = <K extends string>(list: [K, string][], k: K | null | undefined) => list.find(([x]) => x === k)?.[1] ?? ''

export const NO_INDUSTRY = 'No industry yet'

/** A step is due when its date is today or past. */
export const dueSteps = (cs: Company[], today = localDate()) =>
  cs.filter((c) => c.next && c.next_on && c.next_on <= today).sort((a, b) => a.next_on!.localeCompare(b.next_on!))

/** Still to apply to. */
export const toApply = (c: Company) => c.job?.status === 'to_apply'

/** Still to apply to, but the posting's deadline is past: only Mitacs is left. */
export const deadlinePassed = (c: Company, today = localDate()) => toApply(c) && !!c.job?.deadline && c.job.deadline < today

export const officeOf = (c: Company): CanadaOffice => c.canada_office ?? canadaOfficeOf(c.name)

/** Mitacs needs a Canadian office; "not sure" still allows it. */
export const mitacsPossible = (c: Company) => officeOf(c) !== 'no'

/**
 * Nothing left to do here: no Canadian office (so no Mitacs) and no internship to apply to (none, closed, or a
 * passed deadline). Never a company he applied to.
 */
export const isDeadEnd = (c: Company, today = localDate()) =>
  !mitacsPossible(c) && (!c.job || c.job.status === 'no' || deadlinePassed(c, today))

/** What to apply to next: open deadlines (closest first), then no deadline, then passed deadlines (Mitacs only),
 *  then everything already applied or done. */
export function sortCompanies(cs: Company[], today = localDate()): Company[] {
  const group = (c: Company) => (!toApply(c) ? 3 : !c.job?.deadline ? 1 : c.job.deadline < today ? 2 : 0)
  const when = (c: Company) => c.job?.deadline ?? c.next_on ?? '9999'
  return [...cs].sort((a, b) => group(a) - group(b) || when(a).localeCompare(when(b)) || a.name.localeCompare(b.name))
}

export interface IndustryGroup { industry: string; companies: Company[]; pulled: number; neutral: number; pushed: number }

/** Industries with how their companies felt, strongest pull first. */
export function byIndustry(cs: Company[]): IndustryGroup[] {
  const map = new Map<string, IndustryGroup>()
  for (const c of cs) {
    const key = c.industry?.trim() || NO_INDUSTRY
    const g = map.get(key.toLowerCase()) ?? { industry: key, companies: [], pulled: 0, neutral: 0, pushed: 0 }
    g.companies.push(c)
    if (c.pull) g[c.pull]++
    map.set(key.toLowerCase(), g)
  }
  return [...map.values()].sort((a, b) =>
    Number(a.industry === NO_INDUSTRY) - Number(b.industry === NO_INDUSTRY)
    || (b.pulled - b.pushed) - (a.pulled - a.pushed) || b.companies.length - a.companies.length || a.industry.localeCompare(b.industry))
}

/** The Monday LinkedIn round covers only this industry (his choice, 18 Nov 2026). */
export const RACING_INDUSTRY = 'Racing & exotic cars'
export const isRacing = (c: Company) => c.industry?.trim().toLowerCase() === RACING_INDUSTRY.toLowerCase()

export const blankCompany = (id: string, now: string): Company => ({
  id, name: '', industry: null, city: null, pull: null, pull_note: null,
  job: { role: null, link: null, deadline: null, referral: false, status: 'to_apply' }, mitacs: null,
  next: null, next_on: null, priority: null, notes: null, created_at: now,
})
