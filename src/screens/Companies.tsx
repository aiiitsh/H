import { useState } from 'react'
import { useStore, newId } from '../lib/store'
import { deleteCompany, saveCompany } from '../lib/actions'
import { JOB_STATUS, MITACS_STATUS, NO_INDUSTRY, PULLS, blankCompany, byIndustry, dueSteps, labelOf, sortCompanies } from '../lib/companies'
import { dueLabel } from '../lib/tasks'
import { localDate } from '../lib/time'
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

const pullCls = (p: Company['pull']) => (p === 'pulled' ? 'chip sm on' : p === 'pushed' ? 'chip sm dashed' : 'chip sm')

function CompanyRow({ c, onOpen }: { c: Company; onOpen: () => void }) {
  const today = localDate()
  const late = !!c.next_on && c.next_on <= today
  return (
    <button className="li" style={{ width: '100%', textAlign: 'left', alignItems: 'flex-start', gap: 10 }} onClick={onOpen}>
      <span className="stack grow" style={{ gap: 5, minWidth: 0 }}>
        <span className="row wrap" style={{ gap: 8 }}>
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
          {c.job?.deadline && c.job.status === 'to_apply' && <span className={`chip sm${c.job.deadline <= today ? ' warn' : ''}`}>{dueLabel(c.job.deadline)}</span>}
        </span>
        {c.next && (
          <span className="small" style={{ overflowWrap: 'anywhere' }}>
            → {c.next}{c.next_on && <span className={`chip sm${late ? ' warn' : ''}`} style={{ marginLeft: 8 }}>{dueLabel(c.next_on)}</span>}
          </span>
        )}
      </span>
      <Icon name="chevron" size={16} glow={false} />
    </button>
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

function CompanyEditor({ initial, isNew, industries, onClose }: { initial: Company; isNew: boolean; industries: string[]; onClose: () => void }) {
  const [c, setC] = useState<Company>(initial)
  const set = (p: Partial<Company>) => setC((x) => ({ ...x, ...p }))
  const job = c.job ?? null
  const mitacs = c.mitacs ?? null
  const setJob = (p: Partial<NonNullable<Company['job']>>) => set({ job: { status: 'to_apply', ...job, ...p } })
  const setMitacs = (p: Partial<NonNullable<Company['mitacs']>>) => set({ mitacs: { status: 'to_contact', ...mitacs, ...p } })
  const text = (v: string) => (v.trim() ? v : null)
  const save = () => {
    if (!c.name.trim()) return
    saveCompany({ ...c, name: c.name.trim() })
    onClose()
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <Field label="Company"><input className="field" value={c.name} placeholder="e.g. Shopify" onChange={(e) => set({ name: e.target.value })} /></Field>
      <div className="grid2">
        <Field label="Industry">
          <input className="field" list="company-industries" value={c.industry ?? ''} placeholder="e.g. Automotive" onChange={(e) => set({ industry: text(e.target.value) })} />
          <datalist id="company-industries">{industries.map((i) => <option key={i} value={i} />)}</datalist>
        </Field>
        <Field label="City"><input className="field" value={c.city ?? ''} placeholder="e.g. Toronto" onChange={(e) => set({ city: text(e.target.value) })} /></Field>
      </div>

      <Label>How it feels</Label>
      <Chips list={PULLS} value={c.pull} onChange={(pull) => set({ pull })} />
      <input className="field" value={c.pull_note ?? ''} placeholder="Why? One line" onChange={(e) => set({ pull_note: text(e.target.value) })} />

      <div className="panel stack" style={{ gap: 12, padding: 14 }}>
        <Switch on={!!job} onChange={(on) => set({ job: on ? { status: 'to_apply', role: null, link: null, deadline: null, referral: false } : null })} label="Job application" />
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
            <Chips list={JOB_STATUS} value={job.status} onChange={(s) => s && setJob({ status: s })} />
          </>
        )}
      </div>

      <div className="panel stack" style={{ gap: 12, padding: 14 }}>
        <Switch on={!!mitacs} onChange={(on) => set({ mitacs: on ? { status: 'to_contact', contact: null, last_contact: null } : null })} label="Mitacs outreach" />
        {mitacs && (
          <>
            <Field label="Contact"><input className="field" value={mitacs.contact ?? ''} placeholder="Name, role or email" onChange={(e) => setMitacs({ contact: text(e.target.value) })} /></Field>
            <Chips list={MITACS_STATUS} value={mitacs.status} onChange={(s) => s && setMitacs({ status: s })} />
            <Field label="Last contact"><input className="field" type="date" value={mitacs.last_contact ?? ''} onChange={(e) => setMitacs({ last_contact: e.target.value || null })} /></Field>
          </>
        )}
      </div>

      <Field label="Next step"><input className="field" value={c.next ?? ''} placeholder="e.g. Send the email" onChange={(e) => set({ next: text(e.target.value) })} /></Field>
      <Field label="By"><input className="field" type="date" value={c.next_on ?? ''} onChange={(e) => set({ next_on: e.target.value || null })} /></Field>

      <Label>Priority</Label>
      <Chips list={[['1', 'P1'], ['2', 'P2'], ['3', 'P3']] as [string, string][]} value={c.priority ? String(c.priority) : null}
        onChange={(p) => set({ priority: p ? (Number(p) as Priority) : null })} />

      <Field label="Notes"><textarea className="field" value={c.notes ?? ''} onChange={(e) => set({ notes: text(e.target.value) })} /></Field>

      <div className="row" style={{ gap: 8 }}>
        {!isNew && <button className="btn grow" onClick={() => { deleteCompany(c.id); onClose() }}>Delete</button>}
        <button className="btn btn-filled grow" disabled={!c.name.trim()} onClick={save}>Save</button>
      </div>
    </div>
  )
}

/** Today's plan: company steps due today or late. Tap opens the tracker. */
export function TodayCompanies() {
  const list = dueSteps(useCompanies())
  if (!list.length) return null
  const today = localDate()
  return (
    <>
      <div className="label" style={{ margin: '14px 0 4px' }}>Companies · next steps</div>
      <div className="list">
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
