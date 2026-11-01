import { describe, expect, it, vi } from 'vitest'

// A fake Supabase that answers each table after a different delay, and records when calls start and end.
const events: string[] = []
const delay: Record<string, number> = { workouts: 60, workout_sets: 0 }
vi.mock('./supabase', () => ({
  supabase: {
    from: (table: string) => ({
      upsert: async () => {
        events.push(`start ${table}`)
        await new Promise((r) => setTimeout(r, delay[table] ?? 0))
        events.push(`end ${table}`)
        return { error: null }
      },
    }),
  },
}))
vi.mock('./demo', () => ({ demoMode: false }))

describe('write queue', () => {
  it('sends writes one at a time, in order: sets never reach the database before their workout', async () => {
    const { write } = await import('./queue')
    const a = write({ kind: 'upsert', table: 'workouts', values: { id: 'w' } })
    const b = write({ kind: 'upsert', table: 'workout_sets', values: [{ id: 's', workout_id: 'w' }] })
    await Promise.all([a, b])
    expect(events).toEqual(['start workouts', 'end workouts', 'start workout_sets', 'end workout_sets'])
  })
})
