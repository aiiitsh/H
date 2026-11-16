// Do companies take employee referrals for internships? Only what a source supports (searched 16 Nov 2026).
// Most companies publish nothing official, so anything not listed here is "unknown" and shows no flag.

export type ReferralPolicy = 'yes' | 'personal' | 'unclear' | 'no'

export const REFERRAL_LABEL: Record<ReferralPolicy, string> = {
  yes: 'Takes referrals',
  personal: 'Referral only if they know you',
  unclear: 'Referrals unclear',
  no: 'No referrals · try Mitacs',
}

export const REFERRALS: Record<string, { policy: ReferralPolicy; why: string }> = {
  microsoft: { policy: 'yes', why: 'Student FAQ: referred candidates get equal consideration; the referral sends you an apply link.' },
  tiktok: { policy: 'yes', why: 'Intern roles take employee referral codes at application.' },
  bytedance: { policy: 'yes', why: 'Intern roles take employee referral codes at application.' },
  workday: { policy: 'yes', why: 'Postings point applicants to the Employee Referral process; many referred interviews reported.' },
  atlassian: { policy: 'yes', why: 'Employee referral program; referred intern applicants reported.' },
  coinbase: { policy: 'yes', why: 'Referred applicants reported (anecdotal).' },
  tesla: { policy: 'yes', why: 'Referred applicants reported (anecdotal).' },
  stripe: { policy: 'personal', why: 'Recruiters weigh "strong referrals" from people who know you well; cold referrals add little.' },
  salesforce: { policy: 'unclear', why: 'Forum claim: employees can only refer outside the new-grad (Futureforce) programs. Unverified.' },
}

/** The tag on every company: is a referral worth chasing here? */
export type ReferralNeed = 'needs' | 'no' | 'unsure'
export const NEED_LABEL: [ReferralNeed, string][] = [['needs', 'Needs referral'], ['no', "Doesn't need referral"], ['unsure', 'Not sure referral']]

/** From the research: takes referrals = needs one; refuses, or only counts if they know you = doesn't; else not sure. */
export function referralNeed(company: string): ReferralNeed {
  const p = referralOf(company)?.policy
  return p === 'yes' ? 'needs' : p === 'no' || p === 'personal' ? 'no' : 'unsure'
}

/** Policy for a company name (case and punctuation ignored), or null if unknown. */
export function referralOf(company: string) {
  const key = company.toLowerCase().replace(/[^a-z0-9]/g, '')
  return REFERRALS[key] ?? null
}
