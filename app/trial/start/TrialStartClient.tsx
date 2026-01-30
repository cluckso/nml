"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TrialStartClient() {
  const [businessPhone, setBusinessPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const eligibilityData = await eligibilityRes.json()
      if (!eligibilityRes.ok) {
        setError(eligibilityData.message || eligibilityData.error || "This number is not eligible for a trial.")
        setLoading(false)
        return
      }

      const startRes = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessPhone: businessPhone.trim() }),
      })
      const startData = await startRes.json()
      if (!startRes.ok) {
        setError(startData.error || "Failed to start trial")
        setLoading(false)
        return
      }
      if (startData.url) {
        window.location.href = startData.url
        return
      }
      setError("Missing redirect URL")
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
          <CardTitle>Start your 14-day trial — 50 free call minutes</CardTitle>
          <CardDescription>
            No charge until you upgrade. Add your business phone and payment method to start. One trial per business number.
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
            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Starting…" : "Continue — add card next"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Add a card on the next step — we won&apos;t charge you until you choose a plan after your trial.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
