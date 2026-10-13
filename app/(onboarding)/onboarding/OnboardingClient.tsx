"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { trackCompleteRegistration } from "@/lib/analytics"
import { IndustrySelector } from "@/components/onboarding/IndustrySelector"
import { BusinessInfoForm } from "@/components/onboarding/BusinessInfoForm"
import { Industry, PlanType } from "@prisma/client"
import { hasIndustryOptimizedAgents } from "@/lib/plans"
import { onboardingWelcomeSubtitle } from "@/lib/trial-marketing"

interface OnboardingData {
  industry?: Industry
  businessInfo?: {
    name: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    serviceAreas?: string[]
    phoneNumber?: string
    ownerPhone?: string
    smsConsent?: boolean
    businessHours?: { open: string; close: string; days: string[] }
  }
}

interface OnboardingClientProps {
  planType: PlanType | null
  /** Pre-selected industry when user revisits onboarding (e.g. existing business). */
  initialIndustry?: Industry | null
  initialBusiness?: {
    name?: string
    city?: string
    serviceAreas?: string[]
    phoneNumber?: string
    ownerPhone?: string
    businessHours?: { open: string; close: string; days: string[] } | null
  }
}

export function OnboardingClient({ planType, initialIndustry, initialBusiness }: OnboardingClientProps) {
  const router = useRouter()
  const [industry, setIndustry] = useState<Industry | undefined>(initialIndustry ?? undefined)
  const [industryError, setIndustryError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleBusinessInfoSubmit = async (businessInfo: OnboardingData["businessInfo"]) => {
    if (!industry) {
      setIndustryError("Select your business type to continue.")
      return
    }
    setIndustryError(null)
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, businessInfo }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        const msg = typeof result?.error === "string" ? result.error : "Failed to save"
        const details = result?.details ?? result?.hint ?? ""
        throw new Error(details ? `${msg}. ${details}` : msg)
      }
      const businessId = result.business?.id
      if (businessId && typeof window !== "undefined") {
        const referralCode = sessionStorage.getItem("callgrabbr_referral")
        if (referralCode) {
          fetch("/api/referrals/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode, businessId }),
          }).catch(console.error)
          sessionStorage.removeItem("callgrabbr_referral")
        }
        const agencyCode = sessionStorage.getItem("callgrabbr_agency")
        if (agencyCode) {
          fetch("/api/agency/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inviteCode: agencyCode, businessId }),
          }).catch(console.error)
          sessionStorage.removeItem("callgrabbr_agency")
        }
      }
      trackCompleteRegistration()
      const qs = result.provisioningFailed ? "?setup=provisioning_failed" : ""
      router.replace(`/dashboard${qs}`)
    } catch (error) {
      console.error("Error saving onboarding:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to save. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Set up your call assistant</h1>
        <p className="text-muted-foreground">{onboardingWelcomeSubtitle(!!planType)}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">What type of business is this?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We&apos;ll tune how your assistant answers — HVAC, plumbing, auto, and more each get industry-specific intake.
          </p>
          {planType && hasIndustryOptimizedAgents(planType) && (
            <p className="text-sm text-muted-foreground mb-4">
              Your plan includes industry-optimized call flows for the types listed below.
            </p>
          )}
          <IndustrySelector
            selected={industry}
            onSelect={(value) => {
              setIndustry(value)
              setIndustryError(null)
            }}
          />
          {industryError && (
            <p className="text-sm text-destructive mt-3" role="alert">
              {industryError}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Your business details</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Shop name, where you serve, and where to text leads. Takes under a minute.
          </p>
          {submitError && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-4 text-sm text-destructive"
              role="alert"
            >
              {submitError}
            </div>
          )}
          <BusinessInfoForm
            initialData={initialBusiness ?? undefined}
            onSubmit={handleBusinessInfoSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
