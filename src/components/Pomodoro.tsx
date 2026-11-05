import { useEffect } from 'react'
import { create } from 'zustand'
import { focusBreak, focusResume, focusStop, startFocus } from '../lib/actions'
import { categoriesOf } from '../lib/focustags'
import { POMO, POMO_ROUNDS, advancePomo, doneOn, freshPomo, startBreak, startWork, stopPomo, type Pomo } from '../lib/pomodoro'
import { beep, keepAwake, unlockAudio } from '../lib/rest'
import { get } from '../lib/store'
import { fmtStopwatch, localDate } from '../lib/time'
import type { FocusTag } from '../lib/types'
import { Bar, Label, useNow } from './ui'

const KEY = 'ahmed-pomodoro'

function loadPomo(): Pomo {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (p && typeof p.phase === 'string') return p
  } catch { /* storage blocked */ }
  return freshPomo()
}

const usePomo = create<Pomo>(() => loadPomo())

function save(p: Pomo) {
  usePomo.setState(p, true)
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* storage blocked */ }
}

/** Runs the rounds from anywhere in the app. Stopping focus on the main timer also ends the pomodoro. */
function tick(now = Date.now()) {
  const p = usePomo.getState()
  const { loaded, appState } = get()
  if (p.phase === 'idle' || !loaded || !appState) return
  if (appState.focus?.mode !== (p.phase === 'work' ? 'focus' : 'break')) { save(stopPomo(p)); return }
  const { next, workEndedAt } = advancePomo(p, now)
  if (next === p) return
  // Saved as ending when the round did, even if the phone was asleep and this runs later.
  if (workEndedAt != null) focusBreak('break', new Date(workEndedAt).toISOString())
  save(next)
  beep()
}

export function PomodoroTicker() {
  useEffect(() => {
    const t = window.setInterval(() => tick(), 1000)
    const vis = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', vis)
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [])
  return null
}

/** Focus for this round: keep what's running, come back from a break, or start one labelled from the picker (Study by default). */
function beginFocus(tag: FocusTag) {
  const f = get().appState?.focus
  if (f?.mode === 'focus') return
  if (f?.mode === 'break') { focusResume(); return }
  const study = categoriesOf(get().appState?.settings).includes('Study')
  startFocus(tag.cat || tag.what || tag.task || !study ? tag : { cat: 'Study' })
}

/** A small study timer. Its rounds run the focus timer above, so they count in your focus hours. */
export function Pomodoro({ tag, onStart }: { tag: FocusTag; onStart: () => void }) {
  const p = usePomo()
  const now = useNow(1000)
  const active = p.phase !== 'idle'

  // Screen stays on during a round, so the beep can play with the phone on the desk.
  useEffect(() => {
    if (!active) return
    void keepAwake(true)
    const vis = () => { if (document.visibilityState === 'visible') void keepAwake(false).then(() => keepAwake(true)) }
    document.addEventListener('visibilitychange', vis)
    return () => { document.removeEventListener('visibilitychange', vis); void keepAwake(false) }
  }, [active])

  const next = () => {
    unlockAudio()
    beginFocus(tag)
    onStart()
    save(startWork(usePomo.getState(), Date.now()))
  }
  const skipToBreak = () => {
    unlockAudio()
    focusBreak('break')
    save(startBreak(usePomo.getState(), Date.now(), false))
  }
  const end = () => {
    focusStop()
    save(stopPomo(usePomo.getState()))
  }

  const done = doneOn(p, localDate(now))
  const left = p.endsAt ? Math.max(0, Math.ceil((p.endsAt - now) / 1000)) : 0
  const title = p.phase === 'work' ? `Focus · round ${(done % POMO_ROUNDS) + 1}` : p.phase === 'break' ? 'Break' : p.phase === 'over' ? 'Break’s over' : 'Pomodoro'

  return (
    <section className="panel stack" style={{ gap: 14 }}>
      <div className="row between">
        <Label>{title}</Label>
        <span className="label">{done} today</span>
      </div>
      {!active && (
        <>
          <span className="small muted">{POMO.work} min focus · {POMO.brk} min break</span>
          <button className="btn btn-outline btn-caps btn-block" onClick={next}>Start pomodoro</button>
        </>
      )}
      {(p.phase === 'work' || p.phase === 'break') && (
        <>
          <div className="timer" style={{ fontSize: 44 }}>{fmtStopwatch(left * 1000)}</div>
          <Bar value={p.total / 1000 - left} max={p.total / 1000} thin />
          <div className="grid2">
            <button className="btn" onClick={p.phase === 'work' ? skipToBreak : next}>{p.phase === 'work' ? 'Break now' : 'Skip break'}</button>
            <button className="btn" onClick={end}>End</button>
          </div>
        </>
      )}
      {p.phase === 'over' && (
        <div className="grid2">
          <button className="btn btn-filled btn-caps" onClick={next}>Next round</button>
          <button className="btn" onClick={end}>End</button>
        </div>
      )}
    </section>
  )
}
