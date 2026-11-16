import { useEffect, useState } from 'react'
import { useStore, newId } from '../lib/store'
import { addFeedJobs, deleteCompany, markApplied, saveCompany, toggleApplied } from '../lib/actions'
import { JOB_STATUS, MITACS_STATUS, NO_INDUSTRY, PULLS, blankCompany, byIndustry, dueSteps, labelOf, sortCompanies, toApply } from '../lib/companies'
import { freshCompany, loadApmFeed, useApmFeed } from '../lib/apmfeed'
import { NEED_LABEL, REFERRAL_LABEL, referralNeed, referralOf, type ReferralNeed } from '../data/referrals'
import { dueLabel } from '../lib/tasks'
import { addDays, localDate } from '../lib/time'
import type { Company, Priority } from '../lib/types'
import { Segmented } from '../components/QuickLog'
import { Label, Sheet, Toggle } from '../components/ui'
import { Icon } from '../components/Icon'

type View = 'all' | 'jobs' | 'mitacs' | 'industries'

const useCompanies = () => useStore((s) => s.appState?.settings?.companies) ?? []

/** One place for every company: the job application and the Mitacs outreach side by side. */
export function Companies() {
  const companies = useCompanies()
  const [view, setView] = useState<View>('all')
  const [edit, setEdit] = useState<{ c: Company; isNew: boolean } | null>(null)
  const list = sortCompanies(companies).filter((c) => (view === 'jobs' ? !!c.job : view === 'mitacs' ? !!c.mitacs : true))
  const applied = companies.filter((c) => c.job && c.job.status !== 'to_apply').length
  const reached = companies.filter((c) => c.mitacs && c.mitacs.status !== 'to_contact').length

  return (
    <div className="page">
      <div className="hero-light" />
      <header className="page-head">
        <h1 className="hero-word" style={{ fontSize: 34 }}>COMPANIES</h1>
        <Label>{companies.length} companies · {applied} applied · {reached} reached for Mitacs</Label>
      </header>

      <button className="btn btn-filled btn-block btn-caps" onClick={() => setEdit({ c: blankCompany(newId(), new Date().toISOString()), isNew: true })}>
        <Icon name="plus" size={18} glow={false} /> Add company
      </button>

      <Segmented value={view} options={[['all', 'All'], ['jobs', 'Jobs'], ['mitacs', 'Mitacs'], ['industries', 'Industries']]} onChange={setView} />

      {view === 'industries' ? <Industries companies={companies} onOpen={(c) => setEdit({ c, isNew: false })} /> : (
        <section className="panel">
          {list.length === 0 ? <div className="empty">{view === 'mitacs' ? 'No Mitacs outreach yet.' : 'No companies yet.'}</div> : (
            <div className="list">{list.map((c) => <CompanyRow key={c.id} c={c} onOpen={() => setEdit({ c, isNew: false })} />)}</div>
          )}
        </section>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? 'Add company' : edit?.c.name}>
        {edit && <CompanyEditor key={edit.c.id} initial={edit.c} isNew={edit.isNew} industries={byIndustry(companies).map((g) => g.industry).filter((i) => i !== NO_INDUSTRY)} onClose={() => setEdit(null)} />}
      </Sheet>
    </div>
  )
}

const needOf = (c: Company): ReferralNeed => c.referral_need ?? referralNeed(c.name)

/** Every company's referral tag: needs one, doesn't, or not sure. */
function ReferralTag({ c }: { c: Company }) {
  const n = needOf(c)
  return <span className={`chip sm${n === 'needs' ? ' on' : n === 'unsure' ? ' dashed' : ''}`} title={referralOf(c.name)?.why}>{labelOf(NEED_LABEL, n)}</span>
}

/** Keeps the APM List feed loaded and adds its new jobs to the tracker. Mounted once in the app shell. */
export function FeedSync() {
  const jobs = useApmFeed((s) => s.jobs)
  const ready = useStore((s) => s.loaded && !!s.appState)
  useEffect(() => {
    void loadApmFeed()
    const vis = () => document.visibilityState === 'visible' && void loadApmFeed()
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])
  useEffect(() => { if (ready) addFeedJobs(jobs) }, [ready, jobs])
  return null
}

const pullCls = (p: Company['pull']) => (p === 'pulled' ? 'chip sm on' : p === 'pushed' ? 'chip sm dashed' : 'chip sm')

function CompanyRow({ c, onOpen }: { c: Company; onOpen: () => void }) {
  const today = localDate()
  const late = !!c.next_on && c.next_on <= today
  return (
    <div className="li" style={{ alignItems: 'flex-start', gap: 8, opacity: c.job && !toApply(c) && !c.mitacs ? 0.6 : 1 }}>
    {c.job ? (
      <button className="btn btn-ghost btn-sq" style={{ minHeight: 40, width: 40, flex: 'none' }} onClick={() => toggleApplied(c.id)}
        aria-label={toApply(c) ? `Mark ${c.name} applied` : `Mark ${c.name} not applied`} aria-pressed={!toApply(c)}>
        <Icon name={toApply(c) ? 'circle' : 'circlecheck'} size={24} glow={toApply(c)} />
      </button>
    ) : <span style={{ width: 40, flex: 'none' }} />}
    <div className="stack grow" style={{ gap: 10, minWidth: 0 }}>
    <button style={{ display: 'flex', width: '100%', textAlign: 'left', alignItems: 'flex-start', gap: 10, background: 'none', border: 0, padding: '8px 0 0', color: 'inherit', font: 'inherit' }} onClick={onOpen}>
      <span className="stack grow" style={{ gap: 5, minWidth: 0 }}>
        <span className="row wrap" style={{ gap: 8 }}>
          {freshCompany(c, today) && <span className="fire" role="img" aria-label="Posted today">🔥</span>}
          {c.priority && <span className={`prio p${c.priority}`}>P{c.priority}</span>}
          <span className="strong" style={{ overflowWrap: 'anywhere' }}>{c.name}</span>
          {c.pull && <span className={pullCls(c.pull)}>{labelOf(PULLS, c.pull)}</span>}
        </span>
        {(c.industry || c.city || c.job?.role) && (
          <span className="small muted" style={{ overflowWrap: 'anywhere' }}>{[c.job?.role, c.industry, c.city].filter(Boolean).join(' · ')}</span>
        )}
        <span className="row wrap" style={{ gap: 6 }}>
          {c.job && <span className="chip sm">Job · {labelOf(JOB_STATUS, c.job.status)}{c.job.referral ? ' · referral' : ''}</span>}
          {c.mitacs && <span className="chip sm">Mitacs · {labelOf(MITACS_STATUS, c.mitacs.status)}</span>}
          {c.job?.deadline && c.job.status === 'to_apply' && (c.job.deadline < today ? <span className="chip sm dashed">Deadline passed?</span> : <span className={`chip sm${c.job.deadline === today ? ' warn' : ''}`}>{dueLabel(c.job.deadline)}</span>)}
          {c.mba && <span className="chip sm dashed">MBA</span>}
          <ReferralTag c={c} />
        </span>
        {c.next && (
          <span className="small" style={{ overflowWrap: 'anywhere' }}>
            → {c.next}{c.next_on && <span className={`chip sm${late ? ' warn' : ''}`} style={{ marginLeft: 8 }}>{dueLabel(c.next_on)}</span>}
          </span>
        )}
      </span>
      <Icon name="chevron" size={16} glow={false} />
    </button>
    {toApply(c) && (
      <div className="row wrap" style={{ gap: 8 }}>
        <button className="chip" onClick={() => markApplied(c.id, true)}>✓ Applied + Mitacs</button>
      </div>
    )}
    </div>
    </div>
  )
}

/** Industries with how their companies felt: the pattern for choosing where to hunt for Mitacs. */
function Industries({ companies, onOpen }: { companies: Company[]; onOpen: (c: Company) => void }) {
  const groups = byIndustry(companies)
  if (!groups.length) return <section className="panel"><div className="empty">Add companies and an industry to see the pattern.</div></section>
  return (
    <>
      {groups.map((g) => (
        <section key={g.industry} className="panel stack" style={{ gap: 10 }}>
          <div className="row between" style={{ gap: 8 }}>
            <span className={g.industry === NO_INDUSTRY ? 'dim' : 'strong'}>{g.industry}</span>
            <span className="label">{g.pulled} pulled · {g.neutral} neutral · {g.pushed} pushed</span>
          </div>
          <div className="list">
            {g.companies.map((c) => (
              <button key={c.id} className="li" style={{ width: '100%', textAlign: 'left', gap: 8, alignItems: 'flex-start' }} onClick={() => onOpen(c)}>
                <span className="stack grow" style={{ gap: 3, minWidth: 0 }}>
                  <span>{c.name}</span>
                  {c.pull_note && <span className="small muted" style={{ overflowWrap: 'anywhere' }}>{c.pull_note}</span>}
                </span>
                {c.pull && <span className={pullCls(c.pull)}>{labelOf(PULLS, c.pull)}</span>}
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function Chips<K extends string>({ list, value, onChange }: { list: [K, string][]; value: K | null | undefined; onChange: (k: K | null) => void }) {
  return (
    <div className="row wrap" style={{ gap: 8 }}>
      {list.map(([k, label]) => (
        <button key={k} type="button" className={`chip${value === k ? ' on' : ''}`} onClick={() => onChange(value === k ? null : k)}>{label}</button>
      ))}
    </div>
  )
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <div className="row between" style={{ gap: 12 }}><span className="strong">{label}</span><Toggle on={on} onChange={onChange} label={label} /></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="stack" style={{ gap: 6 }}><span className="label">{label}</span>{children}</label>
}

const NEXT_STEPS: [string, string][] = [['Apply', 'Apply'], ['Ask for a referral', 'Ask for a referral'], ['Email about Mitacs', 'Email about Mitacs'], ['Follow up', 'Follow up']]
const WHEN: [number, string][] = [[0, 'Today'], [1, 'Tomorrow'], [3, 'In 3 days'], [7, 'Next week']]

/** Quick by default: name and a few taps. Everything else sits under "More details". */
function CompanyEditor({ initial, isNew, industries, onClose }: { initial: Company; isNew: boolean; industries: string[]; onClose: () => void }) {
  const [c, setC] = useState<Company>(initial)
  const [more, setMore] = useState(false)
  const today = localDate()
  const set = (p: Partial<Company>) => setC((x) => ({ ...x, ...p }))
  const job = c.job ?? null
  const mitacs = c.mitacs ?? null
  const setJob = (p: Partial<NonNullable<Company['job']>>) => set({ job: { status: 'to_apply', ...job, ...p } })
  const setMitacs = (p: Partial<NonNullable<Company['mitacs']>>) => set({ mitacs: { status: 'to_contact', ...mitacs, ...p } })
  const text = (v: string) => (v.trim() ? v : null)
  const ref = c.name.trim() ? referralOf(c.name) : null
  const save = () => {
    if (!c.name.trim()) return
    saveCompany({ ...c, name: c.name.trim() })
    onClose()
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <input className="field" value={c.name} placeholder="Company name" autoFocus={isNew} onChange={(e) => set({ name: e.target.value })} />
      {ref && <span className="small muted">{REFERRAL_LABEL[ref.policy]}: {ref.why}</span>}

      <div className="row wrap" style={{ gap: 8 }}>
        <button type="button" className={`chip${job ? ' on' : ''}`} onClick={() => set({ job: job ? null : { status: 'to_apply', role: null, link: null, deadline: null, referral: false } })}>Job</button>
        <button type="button" className={`chip${mitacs ? ' on' : ''}`} onClick={() => set({ mitacs: mitacs ? null : { status: 'to_contact', contact: null, last_contact: null } })}>Mitacs</button>
      </div>
      {job && <><Label>Job</Label><Chips list={JOB_STATUS} value={job.status} onChange={(s) => s && setJob({ status: s })} /></>}
      {mitacs && <><Label>Mitacs</Label><Chips list={MITACS_STATUS} value={mitacs.status} onChange={(s) => s && setMitacs({ status: s })} /></>}

      <Label>How it feels</Label>
      <Chips list={PULLS} value={c.pull} onChange={(pull) => set({ pull })} />

      <Label>Referral</Label>
      <Chips list={NEED_LABEL} value={needOf(c)} onChange={(n) => set({ referral_need: n ?? null })} />

      <Label>Next step</Label>
      <Chips list={NEXT_STEPS} value={c.next} onChange={(next) => set({ next, next_on: next ? c.next_on ?? today : null })} />
      {c.next && (
        <div className="row wrap" style={{ gap: 8 }}>
          {WHEN.map(([n, label]) => {
            const d = addDays(today, n)
            return <button key={n} type="button" className={`chip sm${c.next_on === d ? ' on' : ''}`} onClick={() => set({ next_on: d })}>{label}</button>
          })}
        </div>
      )}

      <button type="button" className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setMore((m) => !m)}>{more ? 'Fewer details' : 'More details'}</button>
      {more && (
        <div className="stack" style={{ gap: 14 }}>
          <div className="grid2">
            <Field label="Industry">
              <input className="field" list="company-industries" value={c.industry ?? ''} placeholder="e.g. Automotive" onChange={(e) => set({ industry: text(e.target.value) })} />
              <datalist id="company-industries">{industries.map((i) => <option key={i} value={i} />)}</datalist>
            </Field>
            <Field label="City"><input className="field" value={c.city ?? ''} placeholder="e.g. Toronto" onChange={(e) => set({ city: text(e.target.value) })} /></Field>
          </div>
          <Field label="Why it feels that way"><input className="field" value={c.pull_note ?? ''} placeholder="One line" onChange={(e) => set({ pull_note: text(e.target.value) })} /></Field>
          {job && (
            <>
              <Field label="Role"><input className="field" value={job.role ?? ''} placeholder="e.g. PM intern, Summer 2027" onChange={(e) => setJob({ role: text(e.target.value) })} /></Field>
              <Field label="Link">
                <div className="row" style={{ gap: 8 }}>
                  <input className="field grow" type="url" value={job.link ?? ''} placeholder="https://…" onChange={(e) => setJob({ link: text(e.target.value) })} />
                  {job.link && <a className="btn btn-sq" href={job.link} target="_blank" rel="noreferrer" aria-label="Open posting"><Icon name="chevron" size={18} glow={false} /></a>}
                </div>
              </Field>
              <Field label="Deadline"><input className="field" type="date" value={job.deadline ?? ''} onChange={(e) => setJob({ deadline: e.target.value || null })} /></Field>
              <Switch on={!!job.referral} onChange={(referral) => setJob({ referral })} label="Referral" />
            </>
          )}
          {mitacs && (
            <>
              <Field label="Mitacs contact"><input className="field" value={mitacs.contact ?? ''} placeholder="Name, role or email" onChange={(e) => setMitacs({ contact: text(e.target.value) })} /></Field>
              <Field label="Last contact"><input className="field" type="date" value={mitacs.last_contact ?? ''} onChange={(e) => setMitacs({ last_contact: e.target.value || null })} /></Field>
            </>
          )}
          <Field label="Next step (your own words)"><input className="field" value={c.next ?? ''} placeholder="e.g. Send the email" onChange={(e) => set({ next: text(e.target.value) })} /></Field>
          <Field label="By"><input className="field" type="date" value={c.next_on ?? ''} onChange={(e) => set({ next_on: e.target.value || null })} /></Field>
          <Label>Priority</Label>
          <Chips list={[['1', 'P1'], ['2', 'P2'], ['3', 'P3']] as [string, string][]} value={c.priority ? String(c.priority) : null}
            onChange={(p) => set({ priority: p ? (Number(p) as Priority) : null })} />
          <Field label="Notes"><textarea className="field" value={c.notes ?? ''} onChange={(e) => set({ notes: text(e.target.value) })} /></Field>
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        {!isNew && <button className="btn grow" onClick={() => { deleteCompany(c.id); onClose() }}>Delete</button>}
        <button className="btn btn-filled grow" disabled={!c.name.trim()} onClick={save}>Save</button>
      </div>
    </div>
  )
}

/** Today's plan: jobs posted today (apply on day 1) and company steps due today or late. */
export function TodayCompanies() {
  const companies = useCompanies()
  const today = localDate()
  const fresh = companies.filter((c) => freshCompany(c, today))
  const list = dueSteps(companies, today).filter((c) => !freshCompany(c, today))
  if (!list.length && !fresh.length) return null
  return (
    <>
      <div className="label" style={{ margin: '14px 0 4px' }}>Companies · next steps</div>
      <div className="list">
        {fresh.length > 0 && (
          <a className="li" href="#/companies" style={{ gap: 10, textDecoration: 'none', color: 'inherit', alignItems: 'center' }}>
            <span className="fire" role="img" aria-label="Posted today">🔥</span>
            <span className="stack grow" style={{ gap: 4, minWidth: 0 }}>
              <span className="strong">{fresh.length} new PM internship{fresh.length === 1 ? '' : 's'} posted today</span>
              <span className="small">{fresh.map((c) => c.name).slice(0, 3).join(', ')}{fresh.length > 3 ? '…' : ''} · Apply today: early applications get seen first.</span>
            </span>
            <Icon name="chevron" size={16} glow={false} />
          </a>
        )}
        {list.map((c) => (
          <a key={c.id} className="li" href="#/companies" style={{ gap: 8, textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
            <span className="stack grow" style={{ gap: 4, minWidth: 0 }}>
              <span className="strong" style={{ overflowWrap: 'anywhere' }}>{c.name}</span>
              <span className="small" style={{ overflowWrap: 'anywhere' }}>{c.next}</span>
            </span>
            <span className={`chip sm${c.next_on! < today ? ' warn' : ''}`} style={{ flex: 'none' }}>{dueLabel(c.next_on!)}</span>
          </a>
        ))}
      </div>
    </>
  )
}
