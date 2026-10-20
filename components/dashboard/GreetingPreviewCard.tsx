"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Volume2, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type GreetingPreviewCardProps = {
  /** Already heard a preview (from settings.greeting.greetingPreviewedAt). */
  alreadyPreviewed: boolean
  businessName: string
}

function playBrowserVoicePreview(text: string, rate: number, voiceGender?: "male" | "female" | null) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = Math.min(2, Math.max(0.5, rate))
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0 && voiceGender) {
    const prefer = voiceGender === "female" ? /female|woman|zira|samantha|karen|moira/i : /male|man|david|mark|daniel|alex/i
    const match = voices.find((v) => prefer.test(v.name)) ?? voices.find((v) => v.lang.startsWith("en"))
    if (match) utterance.voice = match
  }
  window.speechSynthesis.speak(utterance)
  return true
}

/**
 * Inline "hear your greeting" card for trial dashboards — aha moment without digging into settings.
 */
export function GreetingPreviewCard({ alreadyPreviewed, businessName }: GreetingPreviewCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState<string | null>(null)
  const [voiceSummary, setVoiceSummary] = useState<string | null>(null)
  const [heard, setHeard] = useState(alreadyPreviewed)

  const handlePreview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/settings/voice-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "greeting" }),
      })
      const data = (await res.json()) as {
        text?: string
        voiceSpeed?: number
        voiceSummary?: string
        error?: string
        greeting?: { voiceGender?: "male" | "female" | null }
      }
      if (!res.ok) throw new Error(data.error ?? "Preview failed")
      if (!data.text) throw new Error("No greeting text returned")

      setPreviewText(data.text)
      setVoiceSummary(data.voiceSummary ?? null)
      const played = playBrowserVoicePreview(data.text, data.voiceSpeed ?? 1, null)
      if (!played) {
        setError("Browser speech preview is not available on this device. Open Settings to edit pronunciation.")
        return
      }

      setHeard(true)
      void fetch("/api/activation/greeting-previewed", { method: "POST" })
        .then(() => router.refresh())
        .catch(() => {})
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-8 border-primary/25 bg-primary/5" id="preview-greeting">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          {heard ? "Greeting previewed" : "Hear your AI greeting"}
        </CardTitle>
        <CardDescription>
          {heard
            ? "Nice — next, forward your line and place a test call so you get a real lead text."
            : `One click to hear how callers are greeted for ${businessName || "your shop"}. Rough browser preview — live calls use your Retell voice.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {previewText && (
          <blockquote className="rounded-md border border-border/60 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
            “{previewText}”
          </blockquote>
        )}
        {voiceSummary && <p className="text-xs text-muted-foreground">{voiceSummary}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handlePreview} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : heard ? <CheckCircle2 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {heard ? "Play again" : "Preview pronunciation & greeting"}
          </Button>
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/settings?section=greeting#preview-greeting" className="gap-2">
              Edit in Settings
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
