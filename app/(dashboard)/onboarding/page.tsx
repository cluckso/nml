"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { IndustrySelector } from "@/components/onboarding/IndustrySelector"
import { BusinessInfoForm } from "@/components/onboarding/BusinessInfoForm"
import { Industry } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { isComplexSetup } from "@/lib/industries"

type OnboardingStep = "industry" | "business-info" | "complete" | "manual-setup"

interface OnboardingData {
  industry?: Industry
  businessInfo?: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("industry")
  const [data, setData] = useState<OnboardingData>({})

  const handleIndustrySelect = async (industry: Industry) => {
    setData({ ...data, industry })
    
    // Check if this requires manual setup
    if (isComplexSetup({ industry })) {
      setStep("manual-setup")
      return
    }
    
    setStep("business-info")
  }

  const handleBusinessInfoSubmit = async (businessInfo: OnboardingData["businessInfo"]) => {
    const newData = { ...data, businessInfo }
    setData(newData)

    // Check if complex setup is needed
    if (isComplexSetup({ 
      industry: data.industry,
      serviceAreas: businessInfo ? [businessInfo.city] : []
    })) {
      setStep("manual-setup")
      return
    }

    // Save to backend
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      })

      if (!response.ok) throw new Error("Failed to save")

      setStep("complete")
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error saving onboarding:", error)
      alert("Failed to save. Please try again.")
    }
  }

  if (step === "manual-setup") {
    return (
      <div className="container mx-auto max-w-2xl py-12">
        <div className="rounded-lg border p-8 text-center">
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
        <div className="rounded-lg border p-8 text-center">
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
          Let's get your business set up in just a few minutes
        </p>
      </div>

      <div className="rounded-lg border p-8">
        {step === "industry" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Your Industry</h2>
            <IndustrySelector
              selected={data.industry}
              onSelect={handleIndustrySelect}
            />
          </div>
        )}

        {step === "business-info" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <BusinessInfoForm
              initialData={data.businessInfo}
              onSubmit={handleBusinessInfoSubmit}
              onBack={() => setStep("industry")}
            />
          </div>
        )}
      </div>
    </div>
  )
}
