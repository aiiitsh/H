// Keeps an open app on the latest deploy: an open tab or home-screen app otherwise runs its old code until fully reloaded.

/** The app's code file named in a page, e.g. assets/index-Du_noehp.js. */
export const bundleOf = (html: string) => /assets\/index-[\w-]+\.js/.exec(html)?.[0] ?? null

/** A newer build we haven't already reloaded for (so a stale page can never cause a reload loop). */
export const shouldReload = (current: string | null, latest: string | null, tried: string | null) =>
  !!current && !!latest && latest !== current && latest !== tried

const TRIED = 'ahmed-update-tried'
const CHECK_EVERY_MS = 5 * 60000

/** `isSafe`: nothing would be interrupted (no open sheet, typing, workout or unsaved write). */
export function startUpdateChecks(base: string, isSafe: () => boolean) {
  let busy = false
  const check = async () => {
    if (busy || document.visibilityState !== 'visible' || !navigator.onLine) return
    busy = true
    try {
      const res = await fetch(`${base}index.html`, { cache: 'no-store' })
      if (!res.ok) return
      let tried: string | null = null
      try { tried = sessionStorage.getItem(TRIED) } catch { /* storage blocked */ }
      const current = bundleOf(document.querySelector('script[src*="assets/index-"]')?.getAttribute('src') ?? '')
      const latest = bundleOf(await res.text())
      if (!shouldReload(current, latest, tried) || !isSafe()) return
      try { sessionStorage.setItem(TRIED, latest!) } catch { return }
      location.reload()
    } catch { /* offline: try next time */ } finally {
      busy = false
    }
  }
  void check()
  setInterval(() => void check(), CHECK_EVERY_MS)
  document.addEventListener('visibilitychange', () => void check())
  window.addEventListener('focus', () => void check())
}
