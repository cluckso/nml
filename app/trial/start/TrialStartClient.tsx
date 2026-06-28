"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { trackStartTrial } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  clearFunnelTrialContext,
  loadFunnelTrialContext,
  type FunnelTrialContext,
} from "@/lib/funnel/funnel-trial-bridge"
import { LegalConsentCheckbox } from "@/components/legal/LegalConsentCheckbox"

export function TrialStartClient() {
  const searchParams = useSearchParams()
  const [funnelCtx, setFunnelCtx] = useState<FunnelTrialContext | null>(null)
  const [businessPhone, setBusinessPhone] = useState("")
  const [agreedToLegal, setAgreedToLegal] = useState(false)
  const smsConsent = false
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ctx = loadFunnelTrialContext()
    if (!ctx) return
    setFunnelCtx(ctx)
    if (ctx.contactPhone) setBusinessPhone(ctx.contactPhone)
  }, [])

  const fromFunnel =
    searchParams.get("from") === "funnel" || funnelCtx !== null

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
    if (!agreedToLegal) {
      setError("Please agree to the Terms of Service and Privacy Policy to start your trial.")
      return
    }
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

      const startBody: Record<string, string | undefined> = {
        businessPhone: businessPhone.trim(),
      }
      if (funnelCtx) {
        startBody.funnelIndustry = funnelCtx.industry
        startBody.contactName = funnelCtx.contactName
        startBody.contactEmail = funnelCtx.contactEmail
      }

      const startRes = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...startBody, smsConsent, termsAccepted: true }),
      })
      const startData = await parseJsonSafe(startRes)
      if (!startRes.ok) {
        setError((startData.error as string) || "Failed to start trial")
        setLoading(false)
        return
      }
      const url = startData.url as string | undefined
      if (url) {
        trackStartTrial()
        clearFunnelTrialContext()
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

  const firstName = funnelCtx?.contactName?.split(/\s+/)[0]

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            {fromFunnel && firstName
              ? `Almost there, ${firstName}!`
              : "Start your free trial — no card required"}
          </CardTitle>
          <CardDescription>
            {fromFunnel ? (
              <>
                Confirm your business phone to start your 7-day trial
                {funnelCtx?.displayName ? ` for ${funnelCtx.displayName.toLowerCase()}` : ""}. One
                trial per business number.
              </>
            ) : (
              <>
                7-day free trial. No charge until you choose a plan. Add your business phone to
                start. One trial per business number.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fromFunnel && funnelCtx?.contactEmail && (
            <p className="mb-4 rounded-md bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              Signed up as <span className="font-medium text-foreground">{funnelCtx.contactEmail}</span>
            </p>
          )}
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
                {fromFunnel
                  ? "This is the number callers use — we pre-filled from your funnel if you entered a mobile number."
                  : "We'll use it to verify one trial per business."}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll agree to SMS call alerts in the next step (setup).
            </p>
            <LegalConsentCheckbox
              id="trial-legal-consent"
              checked={agreedToLegal}
              onChange={setAgreedToLegal}
            />
            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !agreedToLegal}>
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
