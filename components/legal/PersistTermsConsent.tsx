"use client"

import { useEffect } from "react"
import { TERMS_ACCEPTED_STORAGE_KEY } from "@/lib/user-legal"

/** After signup, persist Terms acceptance from sessionStorage once the user is authenticated. */
export function PersistTermsConsent() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(TERMS_ACCEPTED_STORAGE_KEY) !== "1") return
    } catch {
      return
    }

    fetch("/api/user/accept-terms", { method: "POST" })
      .then((res) => {
        if (res.ok) {
          try {
            sessionStorage.removeItem(TERMS_ACCEPTED_STORAGE_KEY)
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // retry on next page load
      })
  }, [])

  return null
}
