import { patchSettings } from '../lib/actions'
import { useStore } from '../lib/store'
import { GOAL_DAYS, goalRun, pendingMilestone, weeksAndDays } from '../lib/streakgoal'
import { Label, Sheet } from './ui'

/** The week just passed that hasn't been celebrated yet (day 7, 14, 21, 28, 30), or null. */
export function usePendingMilestone() {
  const habits = useStore((s) => s.habits)
  const settings = useStore((s) => s.appState?.settings)
  const run = goalRun(habits, settings?.streak_goal_start)
  return { run, milestone: pendingMilestone(run, settings?.streak_milestone) }
}

/** First thing on app open, before the French line of the day. */
export function StreakMilestone() {
  const busy = useStore((s) => !!s.appState?.active_session)
  const { run, milestone } = usePendingMilestone()
  if (!milestone || busy) return null
  const done = milestone >= GOAL_DAYS
  const seen = () => patchSettings({ streak_milestone: { start: run.start, m: milestone } })
  return (
    <Sheet open onClose={seen} title="Congratulations">
      <div className="stack" style={{ gap: 18, alignItems: 'center', textAlign: 'center' }}>
        <div className="hero-word" style={{ fontSize: 44 }}>{done ? '30 DAYS' : `WEEK ${run.weeks}`}</div>
        <p className="muted">{done ? 'You did it. All 30 days.' : `${run.days} days down. Keep going.`}</p>
        <div className="grid2" style={{ width: '100%' }}>
          <div className="stack" style={{ gap: 3 }}><span className="big-num" style={{ fontSize: 20 }}>{run.weeks}</span><Label>{run.weeks === 1 ? 'Week passed' : 'Weeks passed'}</Label></div>
          <div className="stack" style={{ gap: 3 }}><span className="big-num" style={{ fontSize: 20 }}>{done ? 'None' : weeksAndDays(run.left)}</span><Label>Left</Label></div>
        </div>
        <button className="btn btn-filled btn-big btn-caps btn-block" onClick={seen}>Keep going</button>
      </div>
    </Sheet>
  )
}
