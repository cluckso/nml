"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IndustrySelector } from "@/components/onboarding/IndustrySelector"
import { BusinessInfoForm } from "@/components/onboarding/BusinessInfoForm"
import { Industry } from "@prisma/client"
import { isComplexSetup } from "@/lib/industries"
import { hasIndustryOptimizedAgents } from "@/lib/plans"
import { PlanType } from "@prisma/client"

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
}

export function OnboardingClient({ planType, initialBusiness }: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("industry")
  const [data, setData] = useState<OnboardingData>({})

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
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Manual Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Your setup requires additional configuration. Our team will help you get started.
          </p>
          <div className="space-y-2">
            <p className="font-semibold">Contact Steven Steinhoff</p>
            <p>
              <a href="mailto:ststeinhoff80@gmail.com" className="text-primary hover:underline">
                ststeinhoff80@gmail.com
              </a>
            </p>
            <p>
              <a href="tel:+16086421459" className="text-primary hover:underline">
                (608) 642-1459
              </a>
            </p>
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
          Set up your business in a few minutes. {planType ? "You've already chosen your plan." : "You're on the free trial — 100 minutes to try real calls. Upgrade anytime from Billing."}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
        {step === "industry" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Your Industry</h2>
            {planType && hasIndustryOptimizedAgents(planType) && (
              <p className="text-sm text-muted-foreground mb-4">
                Your plan includes industry-optimized AI agents. Select your business type to use the right prebuilt intake flow.
              </p>
            )}
            <IndustrySelector selected={data.industry} onSelect={handleIndustrySelect} />
          </div>
        )}

        {step === "business-info" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
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
