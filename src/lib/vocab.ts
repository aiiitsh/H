// French words he adds himself (French → English). Every day the app shows 5 of them after the song card.
// Words loop in the order they were added; new words join the loop automatically.
import type { QuranRevision, VocabDaily, VocabWord } from './types'
import { surahLatin } from '../data/surahs'

export const WORDS_PER_DAY = 5

/** The next `n` word ids after the last one shown, wrapping to the start. */
export function pickWords(words: VocabWord[], lastIds: string[] = [], n = WORDS_PER_DAY): string[] {
  if (!words.length) return []
  const last = lastIds[lastIds.length - 1]
  const i = last ? words.findIndex((w) => w.id === last) : -1
  const out: string[] = []
  for (let k = 1; k <= Math.min(n, words.length); k++) out.push(words[(i + k + words.length) % words.length].id)
  return out
}

/** Today's words: a fresh set on a new day; the same set all day (topped up if words were added). */
export function todayWords(saved: VocabDaily | undefined, words: VocabWord[], day: string, n = WORDS_PER_DAY): VocabDaily | null {
  if (!words.length) return null
  if (saved?.day === day) {
    const ids = saved.ids.filter((id) => words.some((w) => w.id === id))
    if (!saved.done && ids.length < Math.min(n, words.length)) {
      for (const id of pickWords(words, ids.length ? ids : undefined, words.length)) {
        if (ids.length >= n) break
        if (!ids.includes(id)) ids.push(id)
      }
    }
    if (ids.length) return { ...saved, ids }
  }
  return { day, ids: pickWords(words, saved?.ids), done: false }
}

/** "Page 4 · Al-Baqarah · Juz 1" */
export function revisionLabel(r: QuranRevision): string {
  return [`Page ${r.page}`, r.surah ? surahLatin(r.surah) : null, r.juz ? `Juz ${r.juz}` : null].filter(Boolean).join(' · ')
}
