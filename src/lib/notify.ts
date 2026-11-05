// Phone/desktop notifications. iPhones only allow these for the app added to the home screen.

export const notifySupported = () => typeof Notification !== 'undefined'
export const notifyBlocked = () => notifySupported() && Notification.permission === 'denied'

/** Must be called from a tap. Asks once; the browser remembers the answer. */
export function askNotifications() {
  if (notifySupported() && Notification.permission === 'default') void Notification.requestPermission().catch(() => {})
}

/** Goes through the service worker where there is one (iPhones require it), so tapping it can open the app. */
export async function notify(title: string, body: string) {
  if (!notifySupported() || Notification.permission !== 'granted') return
  const options = { body, tag: 'ahmed-pomodoro', icon: `${import.meta.env.BASE_URL}icon-192.png` }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, options)
    else new Notification(title, options)
  } catch { /* not allowed here */ }
}
