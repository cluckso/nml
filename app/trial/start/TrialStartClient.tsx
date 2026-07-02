"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { PlanType } from "@prisma/client"
import { trackStartTrial, trackCardTrialStart } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  clearFunnelTrialContext,
  loadFunnelTrialContext,
  type FunnelTrialContext,
} from "@/lib/funnel/funnel-trial-bridge"
import { PersistTermsConsent } from "@/components/legal/PersistTermsConsent"
import { FREE_TRIAL_MINUTES, TRIAL_DAYS } from "@/lib/plans"
import { trialDaysLabel, trialSummaryWithMinutes, moneyBackGuaranteeLabel } from "@/lib/trial-marketing"
import { pricingUrl } from "@/lib/monetization-urls"
import { PLAN_SOLO_OWNER, PLAN_MID_VOLUME } from "@/lib/plan-labels"
import { CreditCard, Shield } from "lucide-react"

const PLAN_OPTIONS = [
  { type: PlanType.STARTER, label: PLAN_SOLO_OWNER },
  { type: PlanType.PRO, label: PLAN_MID_VOLUME },
] as const

function planLabelFor(planType: PlanType): string {
  return planType === PlanType.PRO ? PLAN_MID_VOLUME : PLAN_SOLO_OWNER
}

export function TrialStartClient() {
  const searchParams = useSearchParams()
  const cardMode = searchParams.get("mode") === "card"
  const fromPaidIntent = searchParams.get("intent") === "paid"
  const initialPlan =
    searchParams.get("plan")?.toUpperCase() === "PRO" ? PlanType.PRO : PlanType.STARTER

  const [funnelCtx, setFunnelCtx] = useState<FunnelTrialContext | null>(null)
  const [businessPhone, setBusinessPhone] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan)
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

  const buildStartBody = (): Record<string, string | undefined> => {
    const startBody: Record<string, string | undefined> = {
      businessPhone: businessPhone.trim(),
      planType: selectedPlan,
    }
    if (funnelCtx) {
      startBody.funnelIndustry = funnelCtx.industry
      startBody.contactName = funnelCtx.contactName
      startBody.contactEmail = funnelCtx.contactEmail
    }
    return startBody
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

      const endpoint = cardMode ? "/api/trial/start-card" : "/api/trial/start"
      const startRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildStartBody(), smsConsent }),
      })
      const startData = await parseJsonSafe(startRes)
      if (!startRes.ok) {
        setError((startData.error as string) || "Failed to start trial")
        setLoading(false)
        return
      }
      const url = startData.url as string | undefined
      if (url) {
        if (cardMode) trackCardTrialStart(planLabelFor(selectedPlan))
        else trackStartTrial()
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
      <PersistTermsConsent />
      <Card>
        <CardHeader>
          <CardTitle>
            {cardMode
              ? "Start free trial — card on file"
              : fromFunnel && firstName
                ? `Almost there, ${firstName}!`
                : "Start your free trial — no card required"}
          </CardTitle>
          <CardDescription>
            {cardMode ? (
              <>
                {TRIAL_DAYS}-day free trial on {planLabelFor(selectedPlan)}. Card required — you won&apos;t be charged until the trial ends. Auto-renews unless you cancel.
              </>
            ) : fromFunnel ? (
              <>
                Confirm your business phone to start your {trialDaysLabel()} trial
                {funnelCtx?.displayName ? ` for ${funnelCtx.displayName.toLowerCase()}` : ""}. Includes {FREE_TRIAL_MINUTES} call minutes. One trial per business number.
              </>
            ) : (
              <>
                {trialSummaryWithMinutes()}. Add your business phone to start.
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

          {cardMode && (
            <div className="mb-4 space-y-2">
              <Label htmlFor="plan">Plan after trial</Label>
              <select
                id="plan"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as PlanType)}
                disabled={loading}
              >
                {PLAN_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
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
            {error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {cardMode && <CreditCard className="h-4 w-4" />}
              {loading
                ? "Starting…"
                : cardMode
                  ? "Continue to secure checkout"
                  : "Start free trial"}
            </Button>
            {cardMode ? (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {moneyBackGuaranteeLabel()} on your first paid month
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                You&apos;ll set up your business next. We&apos;ll ask for payment only when you pick a plan.
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t space-y-2 text-center text-sm">
            {cardMode ? (
              <Button variant="link" asChild className="text-muted-foreground">
                <Link href={`/trial/start${fromFunnel ? "?from=funnel" : ""}`}>
                  Prefer no card? Use the free trial instead
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="link" asChild className="text-muted-foreground">
                  <Link href={`/trial/start?mode=card${fromFunnel ? "&from=funnel" : ""}`}>
                    Start with card on file (auto-converts after trial)
                  </Link>
                </Button>
                {(fromFunnel || fromPaidIntent) && (
                  <Button variant="link" asChild>
                    <Link href={pricingUrl({ intent: "paid", plan: PlanType.PRO, ref: fromFunnel ? "funnel" : undefined })}>
                      Subscribe now — skip trial
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
