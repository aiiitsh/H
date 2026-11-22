import { useState } from 'react'
import { useStore } from '../lib/store'
import { localDate } from '../lib/time'
import { todayWords, revisionLabel } from '../lib/vocab'
import { addWord, deleteWord, markRevisionRead, markWordsDone, setQuranRevision } from '../lib/actions'
import { SURAHS } from '../data/surahs'
import { Label, Stepper } from './ui'

/** Today's 5 French words, all on one card. */
export function WordsCard({ onDone }: { onDone?: () => void }) {
  const words = useStore((s) => s.appState?.settings?.vocab) ?? []
  const saved = useStore((s) => s.appState?.settings?.vocab_daily)
  const t = todayWords(saved, words, localDate())
  if (!t) return <div className="empty">No words yet. Add them in Learn → My French words.</div>
  const list = t.ids.map((id) => words.find((w) => w.id === id)).filter((w) => !!w)
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="flash-lesson">
        <Label>Words of the day</Label>
        <div className="flash-words">
          {list.map((w) => (
            <div key={w.id} className="li"><span className="flash-word">{w.fr}</span><span className="small grow">{w.en}</span></div>
          ))}
        </div>
      </div>
      {t.done ? <div className="small muted" style={{ textAlign: 'center' }}>✓ Revised today</div>
        : <button className="btn btn-big btn-filled" onClick={() => { markWordsDone(t); onDone?.() }}>Revised</button>}
    </div>
  )
}

/** This week's Quran revision page: read it today, or change the page. */
export function RevisionCard({ onDone }: { onDone?: () => void }) {
  const r = useStore((s) => s.appState?.settings?.quran_revision)
  const read = useStore((s) => s.appState?.settings?.quran_revision_days)?.includes(localDate())
  const [edit, setEdit] = useState(!r)
  const [page, setPage] = useState(r?.page ?? 1)
  const [surah, setSurah] = useState(r?.surah ?? 1)
  const [juz, setJuz] = useState(r?.juz ?? 1)
  if (edit) {
    return (
      <div className="stack" style={{ gap: 14 }}>
        <Label>Revision page for this week</Label>
        <Stepper value={`PAGE ${page}`} onMinus={() => setPage(Math.max(1, page - 1))} onPlus={() => setPage(Math.min(604, page + 1))} />
        <div className="row" style={{ gap: 8 }}>
          <select className="field grow" value={surah} onChange={(e) => setSurah(Number(e.target.value))} aria-label="Surah">
            {SURAHS.map(([ar, latin], k) => <option key={k} value={k + 1}>{k + 1}. {latin} · {ar}</option>)}
          </select>
          <select className="field" value={juz} onChange={(e) => setJuz(Number(e.target.value))} aria-label="Juz">
            {Array.from({ length: 30 }, (_, k) => <option key={k} value={k + 1}>Juz {k + 1}</option>)}
          </select>
        </div>
        <button className="btn btn-big btn-filled" onClick={() => { setQuranRevision({ page, surah, juz }); setEdit(false) }}>Save</button>
      </div>
    )
  }
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="flash-lesson">
        <Label>Revise this week</Label>
        <div className="flash-fr">{r && revisionLabel(r)}</div>
      </div>
      {read ? <div className="small muted" style={{ textAlign: 'center' }}>✓ Read today</div>
        : <button className="btn btn-big btn-filled" onClick={() => { markRevisionRead(); onDone?.() }}>Read</button>}
      <button className="btn" onClick={() => setEdit(true)}>New page for this week</button>
    </div>
  )
}

/** Learn screen: add French words with their English meaning; the list, newest first. */
export function MyWords() {
  const words = useStore((s) => s.appState?.settings?.vocab) ?? []
  const [fr, setFr] = useState('')
  const [en, setEn] = useState('')
  const add = () => {
    if (!fr.trim() || !en.trim()) return
    addWord(fr, en)
    setFr(''); setEn('')
  }
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row between"><Label>My French words</Label><span className="label">{words.length}</span></div>
      <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); add() }}>
        <input className="field grow" value={fr} placeholder="Français" lang="fr" onChange={(e) => setFr(e.target.value)} style={{ minWidth: 0 }} />
        <input className="field grow" value={en} placeholder="English" onChange={(e) => setEn(e.target.value)} style={{ minWidth: 0 }} />
        <button className="btn btn-filled" type="submit" disabled={!fr.trim() || !en.trim()}>Add</button>
      </form>
      {words.length > 0 && (
        <div className="list">
          {[...words].reverse().map((w) => (
            <div key={w.id} className="li" style={{ gap: 8 }}>
              <span className="flash-word">{w.fr}</span><span className="small grow">{w.en}</span>
              <button className="chip sm" onClick={() => deleteWord(w.id)} aria-label={`Delete ${w.fr}`}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
