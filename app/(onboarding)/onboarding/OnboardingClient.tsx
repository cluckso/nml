"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IndustrySelector } from "@/components/onboarding/IndustrySelector"
import { BusinessInfoForm } from "@/components/onboarding/BusinessInfoForm"
import { Industry } from "@prisma/client"
import { isComplexSetup } from "@/lib/industries"
import { hasIndustryOptimizedAgents } from "@/lib/plans"
import { PlanType } from "@prisma/client"
import { formatPhoneForDisplay } from "@/lib/utils"
import { Phone } from "lucide-react"
import Link from "next/link"

type OnboardingStep = "industry" | "business-info" | "complete" | "manual-setup"

interface OnboardingData {
  industry?: Industry
  businessInfo?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    serviceAreas?: string[]
    phoneNumber?: string
    ownerPhone?: string
    businessHours?: { open: string; close: string; days: string[] }
    departments?: string[]
    crmWebhookUrl?: string
    forwardToEmail?: string
    afterHoursEmergencyPhone?: string
  }
}

interface OnboardingClientProps {
  planType: PlanType | null
  /** Pre-selected industry when user revisits onboarding (e.g. existing business). */
  initialIndustry?: Industry | null
  initialBusiness?: {
    name?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    serviceAreas?: string[]
    phoneNumber?: string
    businessHours?: { open: string; close: string; days: string[] } | null
    departments?: string[]
    crmWebhookUrl?: string | null
    forwardToEmail?: string | null
    afterHoursEmergencyPhone?: string | null
  }
  /** AI number to forward calls to (by industry); shown on setup steps */
  intakeNumber?: string | null
}

export function OnboardingClient({ planType, initialIndustry, initialBusiness, intakeNumber }: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("industry")
  const [data, setData] = useState<OnboardingData>({ industry: initialIndustry ?? undefined })

  const handleIndustrySelect = async (industry: Industry) => {
    setData({ ...data, industry })
    if (isComplexSetup({ industry })) {
      setStep("manual-setup")
      return
    }
    setStep("business-info")
  }

  const handleBusinessInfoSubmit = async (businessInfo: OnboardingData["businessInfo"]) => {
    const newData = { ...data, businessInfo }
    setData(newData)
    const serviceAreas = businessInfo?.serviceAreas?.length ? businessInfo.serviceAreas : businessInfo?.city ? [businessInfo.city] : []
    if (
      isComplexSetup({
        industry: data.industry,
        serviceAreas,
      })
    ) {
      setStep("manual-setup")
      return
    }
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      })
      if (!response.ok) throw new Error("Failed to save")
      setStep("complete")
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (error) {
      console.error("Error saving onboarding:", error)
      alert("Failed to save. Please try again.")
    }
  }

  if (step === "manual-setup") {
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com"
    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? null
    const supportName = process.env.NEXT_PUBLIC_SUPPORT_NAME ?? "Support"
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Manual Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Your setup requires additional configuration. Our team will help you get started.
          </p>
          <div className="space-y-2">
            <p className="font-semibold">Contact {supportName}</p>
            <p>
              <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
                {supportEmail}
              </a>
            </p>
            {supportPhone && (
              <p>
                <a href={`tel:${supportPhone}`} className="text-primary hover:underline">
                  {supportPhone.replace(/^\+1/, "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === "complete") {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Setup Complete!</h1>
          {intakeNumber && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6 text-left">
              <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4" />
                Forward your business line to this AI number
              </p>
              <p className="text-xl font-mono font-semibold">{formatPhoneForDisplay(intakeNumber) || intakeNumber}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Set call forwarding at your carrier to this number. See <Link href="/docs/faq" className="text-primary underline">Help & FAQ</Link> for steps.
              </p>
            </div>
          )}
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to NeverMissLead-AI</h1>
        <p className="text-muted-foreground">
          Set up your business in a few minutes. {planType ? "You've already chosen your plan." : "You're on the free trial — 50 minutes over 14 days. Upgrade anytime from Billing."}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
        {step === "industry" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Select Your Industry (required)</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose the option that best fits your business. This determines which AI agent answers your calls. Select &quot;Other&quot; for the default service number if none of the listed industries apply.
            </p>
            {planType && hasIndustryOptimizedAgents(planType) && (
              <p className="text-sm text-muted-foreground mb-4">
                Your plan includes industry-optimized AI agents for the types listed below.
              </p>
            )}
            <IndustrySelector selected={data.industry} onSelect={handleIndustrySelect} />
          </div>
        )}

        {step === "business-info" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            {intakeNumber && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6 flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Forward calls to this AI number</p>
                  <p className="text-lg font-mono font-semibold mt-1">{formatPhoneForDisplay(intakeNumber) || intakeNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    After saving, set your business line to forward to this number. <Link href="/docs/faq" className="text-primary underline">Help & FAQ</Link>
                  </p>
                </div>
              </div>
            )}
            <BusinessInfoForm
              initialData={data.businessInfo ?? initialBusiness}
              onSubmit={handleBusinessInfoSubmit}
              onBack={() => setStep("industry")}
              planType={planType}
            />
          </div>
        )}
      </div>
    </div>
  )
}
