// Pomodoro: timed focus and break rounds. It works from end times, so it stays right while the phone sleeps.
import { localDate } from './time'

export const POMO = { work: 25, brk: 5, long: 15 }
/** A long break after this many finished rounds. */
export const POMO_ROUNDS = 4

export type PomoPhase = 'idle' | 'work' | 'break' | 'over'

export interface Pomo {
  phase: PomoPhase
  endsAt: number | null
  /** length of the current phase, ms */
  total: number
  /** rounds finished on `day` */
  done: number
  day: string
}

export const freshPomo = (day = localDate()): Pomo => ({ phase: 'idle', endsAt: null, total: 0, done: 0, day })

export const doneOn = (p: Pomo, day: string) => (p.day === day ? p.done : 0)

export function startWork(p: Pomo, now: number): Pomo {
  const day = localDate(now)
  const total = POMO.work * 60000
  return { ...p, phase: 'work', endsAt: now + total, total, done: doneOn(p, day), day }
}

/** `finished` = the round ran its full time; skipped rounds don't count and never earn the long break. */
export function startBreak(p: Pomo, at: number, finished: boolean): Pomo {
  const day = localDate(at)
  const done = doneOn(p, day) + (finished ? 1 : 0)
  const total = (finished && done % POMO_ROUNDS === 0 ? POMO.long : POMO.brk) * 60000
  return { ...p, phase: 'break', endsAt: at + total, total, done, day }
}

export const stopPomo = (p: Pomo): Pomo => ({ ...p, phase: 'idle', endsAt: null, total: 0 })

/** Move on if the time is up. A break never rolls into focus by itself: focus only counts once you're back. */
export function advancePomo(p: Pomo, now: number): { next: Pomo; workEndedAt: number | null; breakOver: boolean } {
  let next = p
  let workEndedAt: number | null = null
  let breakOver = false
  if (next.phase === 'work' && next.endsAt != null && now >= next.endsAt) {
    workEndedAt = next.endsAt
    next = startBreak(next, next.endsAt, true)
  }
  if (next.phase === 'break' && next.endsAt != null && now >= next.endsAt) {
    next = { ...next, phase: 'over', endsAt: null, total: 0 }
    breakOver = true
  }
  return { next, workEndedAt, breakOver }
}
