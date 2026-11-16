// Does the company have an office in Canada? Mitacs needs a Canadian partner organization.
// From general knowledge (16 Nov 2026), not checked one by one: "no" only where confident, since "no" lets the
// tracker delete a closed posting. Anything not listed is "unsure". He can override it per company.

export type CanadaOffice = 'yes' | 'no' | 'unsure'

export const OFFICE_LABEL: [CanadaOffice, string][] = [['yes', 'Office in Canada'], ['no', 'No office in Canada'], ['unsure', 'Canada office: not sure']]

const YES = [
  'microsoft', 'amazon', 'adobe', 'americanexpress', 'amex', 'salesforce', 'stripe', 'tiktok', 'intuit', 'oracle',
  'hewlettpackardenterprise', 'hpe', 'electronicarts', 'ea', 'warnerbros', 'warnerbrosdiscovery', 'wbgames', 'invesco', 'workday',
  'nvidia', 'gevernova', 'autodesk', 'proctergamble', 'pg', 'visa', 'redhat', 'tesla', 'walmart', 'disney', 'disneyespn',
  'snap', 'qualcomm', 'cisco', 'nike', 'experian', 'thetradedesk', 'tradedesk', 'shopify', 'wealthsimple', 'cohere', 'google',
  'meta', 'apple', 'ibm', 'sap', 'uber', 'spotify', 'mastercard', 'paypal', 'lenovo', 'samsung',
]
const NO = ['janestreet', 'roblox', 'duolingo', 'tmobile']

const key = (name: string) => name.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]/g, '')

export function canadaOfficeOf(company: string): CanadaOffice {
  const k = key(company)
  if (YES.includes(k)) return 'yes'
  if (NO.includes(k)) return 'no'
  return 'unsure'
}
