"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { applyCallRoutingPreset, type CallRoutingPresetId } from "@/lib/call-routing-presets"
import { DEFAULT_CALL_ROUTING } from "@/lib/call-routing"

type QuickChoice = Exclude<CallRoutingPresetId, "custom">

/**
 * One-tap ring behavior during activation — writes callRouting via settings API.
 */
export function RingBehaviorChoice({ className = "" }: { className?: string }) {
  const [saving, setSaving] = useState<QuickChoice | null>(null)
  const [saved, setSaved] = useState<QuickChoice | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function choose(preset: QuickChoice) {
    setSaving(preset)
    setError(null)
    try {
      const callRouting = applyCallRoutingPreset(preset, DEFAULT_CALL_ROUTING)
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callRouting }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      setSaved(preset)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className={`rounded-lg border border-border bg-background p-3 space-y-2 ${className}`}>
      <p className="text-sm font-medium text-foreground">How should we answer?</p>
      <p className="text-xs text-muted-foreground">
        Your phone can ring first, or we can answer every forwarded call right away. Change anytime in Settings.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={saved === "daytime-delay" || (!saved && !saving) ? "default" : "outline"}
          disabled={!!saving}
          onClick={() => choose("daytime-delay")}
        >
          {saving === "daytime-delay" ? "Saving…" : "Ring my phone first (10s)"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={saved === "always-answer" ? "default" : "outline"}
          disabled={!!saving}
          onClick={() => choose("always-answer")}
        >
          {saving === "always-answer" ? "Saving…" : "Answer every call"}
        </Button>
      </div>
      {saved && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          {saved === "always-answer"
            ? "Saved — assistant answers immediately."
            : "Saved — your phone rings first during business hours; we pick up after hours."}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
