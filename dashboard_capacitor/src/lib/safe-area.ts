import { Capacitor } from '@capacitor/core'

/**
 * Android WebView often returns 0 for env(safe-area-inset-*).
 * Apply a CSS fallback so the sticky app bar clears the status bar / system tray.
 */
export function applySafeAreaFallbacks() {
  const root = document.documentElement
  if (Capacitor.getPlatform() !== 'android') {
    root.style.setProperty('--sat-fallback', '0px')
    root.style.setProperty('--sab-fallback', '0px')
    return
  }

  // Typical status bar ~24–28dp; gesture nav bar ~16–48dp. Prefer slightly generous top.
  root.style.setProperty('--sat-fallback', '28px')
  root.style.setProperty('--sab-fallback', '12px')
}
