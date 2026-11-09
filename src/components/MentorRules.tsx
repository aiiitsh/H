import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import { demoMode } from '../lib/demo'
import { toast } from '../lib/toast'
import { Label, Sheet } from './ui'

/** Settings → Mentor rules: your private rules for Claude, kept in your account only (table mentor_notes).
 *  Copy them on any device and paste into a Claude chat or its profile/project instructions. */
export function MentorRules() {
  const userId = useStore((s) => s.userId)
  const [text, setText] = useState<string | null | undefined>(undefined) // undefined = loading
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const load = async () => {
    if (demoMode || !userId) { setText(null); return }
    const { data, error } = await supabase.from('mentor_notes').select('content').eq('user_id', userId).maybeSingle()
    if (error) { setErr(error.message); setText(null) } else { setErr(null); setText(data?.content ?? null) }
  }
  useEffect(() => { void load() }, [userId])

  const copy = async () => {
    if (!text) return
    try { await navigator.clipboard.writeText(text); toast('Mentor rules copied') }
    catch { toast('Clipboard blocked', undefined, 'error') }
  }

  const note = text === undefined ? 'Loading…'
    : err ? 'Table not found. Run supabase/migrations/008_mentor_notes.sql in the Supabase SQL editor first.'
    : text ? `${text.length.toLocaleString()} characters · saved to your account only, never to the code.`
    : 'No rules saved yet. Paste them to keep them on every device.'

  return (
    <section className="panel stack" style={{ gap: 12 }}>
      <Label>Mentor rules</Label>
      <p className="small muted">{note}</p>
      {!err && text !== undefined && (
        <div className="row" style={{ gap: 8 }}>
          {text && <button className="btn grow" onClick={copy}>Copy for Claude</button>}
          <button className="btn grow" onClick={() => setOpen(true)}>{text ? 'Edit' : 'Paste rules'}</button>
        </div>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title={text ? 'Edit mentor rules' : 'Paste mentor rules'}>
        <Editor key={String(open)} initial={text ?? ''} userId={userId} onSaved={(t) => { setText(t); setOpen(false) }} />
      </Sheet>
    </section>
  )
}

function Editor({ initial, userId, onSaved }: { initial: string; userId: string | null; onSaved: (t: string) => void }) {
  const [raw, setRaw] = useState(initial)
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (!userId) return
    setBusy(true)
    const { error } = await supabase.from('mentor_notes').upsert({ user_id: userId, content: raw, updated_at: new Date().toISOString() })
    setBusy(false)
    if (error) { toast(error.message, undefined, 'error'); return }
    toast('Mentor rules saved')
    onSaved(raw)
  }
  return (
    <div className="stack" style={{ gap: 12 }}>
      <textarea className="field mono" style={{ minHeight: 260, fontSize: 13 }} placeholder="Paste your MENTOR.md here"
        value={raw} onChange={(e) => setRaw(e.target.value)} />
      <button className="btn btn-filled" disabled={busy || !raw.trim()} onClick={save}>Save rules</button>
    </div>
  )
}
