// The 30-day goal on the Streak page, with a congratulations pop-up each time a week passes.
import type { HabitEntry, Settings } from './types'
import { addDays, daysBetween, localDate } from './time'

export const GOAL_DAYS = 30

export interface GoalRun {
  /** first clean day being counted */
  start: string
  /** clean days so far, today included */
  days: number
  /** days to go, 0 once reached */
  left: number
  /** full weeks passed */
  weeks: number
  /** the day the goal is reached */
  finish: string
}

/** Counts from the day after the last logged time, or from the chosen start date if that's later. */
export function goalRun(entries: HabitEntry[], goalStart?: string, today = localDate()): GoalRun {
  const last = entries.filter((e) => e.count > 0 && e.entry_date <= today).map((e) => e.entry_date).sort().pop()
  const afterLast = last ? addDays(last, 1) : null
  const start = [afterLast, goalStart].filter((d): d is string => !!d).sort().pop() ?? today
  const days = Math.max(0, daysBetween(start, today) + 1)
  return { start, days, left: Math.max(0, GOAL_DAYS - days), weeks: Math.floor(days / 7), finish: addDays(start, GOAL_DAYS - 1) }
}

/** The milestone reached so far: day 7, 14, 21, 28, then 30. */
export const milestoneOf = (days: number) => (days >= GOAL_DAYS ? GOAL_DAYS : Math.floor(days / 7) * 7)

/** The milestone still to celebrate. Opening the app late shows only the latest one. */
export function pendingMilestone(run: GoalRun, seen: Settings['streak_milestone']): number | null {
  const m = milestoneOf(run.days)
  if (!m || (seen?.start === run.start && seen.m >= m)) return null
  return m
}

/** "3 weeks 2 days", "1 week", "2 days". */
export function weeksAndDays(n: number): string {
  const w = Math.floor(n / 7)
  const d = n % 7
  const parts = [w && `${w} week${w === 1 ? '' : 's'}`, d && `${d} day${d === 1 ? '' : 's'}`].filter(Boolean)
  return parts.join(' ') || '0 days'
}
