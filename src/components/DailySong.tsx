import { useEffect, useState } from 'react'
import { useStore } from '../lib/store'
import { patchSettings } from '../lib/actions'
import { findCard, today } from '../lib/songdaily'
import { todayWords } from '../lib/vocab'
import { localDate } from '../lib/time'
import type { SongDaily } from '../lib/types'
import { CardLesson } from './SongCards'
import { RevisionCard, WordsCard } from './DailyReview'
import { usePendingMilestone } from './StreakMilestone'
import { Sheet } from './ui'

type Step = 'song' | 'words' | 'quran'
const TITLE: Record<Step, string> = { song: 'Line of the day', words: 'Words of the day', quran: 'Quran revision' }

/** What still needs doing today, in order: song card, 5 French words, this week's Quran page. */
function pending(): Step[] {
  const s = useStore.getState().appState?.settings
  const day = localDate()
  const out: Step[] = []
  const song = today(s?.song_daily)
  if (song && song.status !== 'read') out.push('song')
  const w = todayWords(s?.vocab_daily, s?.vocab ?? [], day)
  if (w && !w.done) out.push('words')
  if (s?.quran_revision && !s.quran_revision_days?.includes(day)) out.push('quran')
  return out
}

/** Shown on app open until everything is done that day. Reopens when the app comes back after a minute away. */
export function DailySong() {
  const saved = useStore((s) => s.appState?.settings?.song_daily)
  const words = useStore((s) => s.appState?.settings?.vocab)
  const savedWords = useStore((s) => s.appState?.settings?.vocab_daily)
  const busy = useStore((s) => !!s.appState?.active_session)
  const { milestone } = usePendingMilestone()
  const [step, setStep] = useState<Step | null>(null)
  const t = today(saved)
  const entry = t && findCard(t.key)
  const w = todayWords(savedWords, words ?? [], localDate())

  // Save a new day's card and words as soon as they're picked, so every device shows the same ones.
  useEffect(() => {
    if (t && (t.day !== saved?.day || t.key !== saved?.key)) patchSettings({ song_daily: t })
  }, [t?.day, t?.key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (w && (w.day !== savedWords?.day || w.ids.join() !== savedWords?.ids.join())) patchSettings({ vocab_daily: w })
  }, [w?.day, w?.ids.join()]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const show = () => setStep(pending()[0] ?? null)
    show()
    let hiddenAt = 0
    const vis = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt > 60000) show()
    }
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])

  // A streak congratulations comes first; this opens right after it's closed.
  if (busy || milestone || !step) return null
  const next = (from: Step) => {
    const order: Step[] = ['song', 'words', 'quran']
    const rest = pending().filter((s) => order.indexOf(s) > order.indexOf(from))
    setStep(rest[0] ?? null)
  }
  const answer = (status: SongDaily['status']) => {
    if (t) patchSettings({ song_daily: { ...t, status } })
    next('song')
  }
  return (
    <Sheet open onClose={() => setStep(null)} title={TITLE[step]}>
      {step === 'song' && t && entry && (
        <div className="stack" style={{ gap: 14 }}>
          <CardLesson song={entry.song} card={entry.card} />
          <div className="grid2">
            <button className="btn btn-big" onClick={() => answer('again')}>Again</button>
            <button className="btn btn-big btn-filled" onClick={() => answer('read')}>Read</button>
          </div>
          <p className="small muted" style={{ textAlign: 'center' }}>Again shows it each time you open the app today. Read hides it until tomorrow.</p>
        </div>
      )}
      {step === 'words' && (
        <div className="stack" style={{ gap: 10 }}>
          <WordsCard onDone={() => next('words')} />
          <button className="btn" onClick={() => next('words')}>Later</button>
        </div>
      )}
      {step === 'quran' && (
        <div className="stack" style={{ gap: 10 }}>
          <RevisionCard onDone={() => next('quran')} />
          <button className="btn" onClick={() => setStep(null)}>Later</button>
        </div>
      )}
    </Sheet>
  )
}
