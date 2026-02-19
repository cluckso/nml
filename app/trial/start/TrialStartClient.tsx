"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TrialStartClient() {
  const [businessPhone, setBusinessPhone] = useState("")
  // SMS consent is collected in one place only: onboarding (BusinessInfoForm)
  const smsConsent = false
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
    const text = await res.text()
    if (!text.trim()) return {}
    try {
      return JSON.parse(text) as Record<string, unknown>
    } catch {
      return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const eligibilityRes = await fetch("/api/trial/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessPhone: businessPhone.trim() }),
      })
      const eligibilityData = await parseJsonSafe(eligibilityRes)
      if (!eligibilityRes.ok) {
        setError(
          (eligibilityData.message as string) ||
            (eligibilityData.error as string) ||
            "This number is not eligible for a trial."
        )
        setLoading(false)
        return
      }

      const startRes = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessPhone: businessPhone.trim(), smsConsent }),
      })
      const startData = await parseJsonSafe(startRes)
      if (!startRes.ok) {
        setError(
          (startData.error as string) || "Failed to start trial"
        )
        setLoading(false)
        return
      }
      const url = startData.url as string | undefined
      if (url) {
        window.location.href = url
        return
      }
      setError("Missing redirect URL. Please try again or contact support.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Start your free trial — no card required</CardTitle>
          <CardDescription>
            Trial: 50 call minutes or 4 days, whichever comes first. No charge until you choose a plan. Add your business phone to start. One trial per business number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business phone number *</Label>
              <Input
                id="businessPhone"
                type="tel"
                placeholder="(608) 555-1234"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll use it to verify one trial per business.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll agree to SMS call alerts in the next step (setup).
            </p>
            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Starting…" : "Start free trial"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You&apos;ll set up your business next. We&apos;ll ask for payment only when you pick a plan.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
