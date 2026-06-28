"use client"

import { useCallback, useState } from "react"
import type { FunnelLeadPayload } from "@/lib/funnel/funnel-config"
import { trackFunnelLeadSubmit } from "@/lib/funnel/analytics"

interface UseFunnelLeadResult {
  submitting: boolean
  submitted: boolean
  error: string | null
  submitLead: (payload: FunnelLeadPayload) => Promise<boolean>
}

function getUtmParams(): FunnelLeadPayload["utm"] {
  if (typeof window === "undefined") return undefined
  const params = new URLSearchParams(window.location.search)
  const utm = {
    source: params.get("utm_source") ?? undefined,
    medium: params.get("utm_medium") ?? undefined,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
  }
  const hasAny = Object.values(utm).some(Boolean)
  return hasAny ? utm : undefined
}

export function useFunnelLead(): UseFunnelLeadResult {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitLead = useCallback(async (payload: FunnelLeadPayload): Promise<boolean> => {
    setSubmitting(true)
    setError(null)

    const body = { ...payload, utm: payload.utm ?? getUtmParams() }

    try {
      const res = await fetch("/api/funnel/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Failed to submit")
      }

      trackFunnelLeadSubmit(payload.industry, payload.score)
      setSubmitted(true)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      return false
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { submitting, submitted, error, submitLead }
}
