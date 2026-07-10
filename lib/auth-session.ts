/** Persisted preference for "Stay signed in" on the sign-in form. */
export const REMEMBER_ME_STORAGE_KEY = "callgrabbr_remember_me"

/** Cookie max-age when the user opts in to staying signed in (~30 days). */
export const PERSISTENT_SESSION_MAX_AGE = 60 * 60 * 24 * 30

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") return true
  try {
    return localStorage.getItem(REMEMBER_ME_STORAGE_KEY) !== "0"
  } catch {
    return true
  }
}

export function setRememberMePreference(remember: boolean): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(REMEMBER_ME_STORAGE_KEY, remember ? "1" : "0")
  } catch {
    // ignore storage errors
  }
}
