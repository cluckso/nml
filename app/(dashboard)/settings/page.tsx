import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getEffectivePlanType } from "@/lib/plans"
import { SettingsClient } from "./SettingsClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SettingsPage() {
  const user = await requireAuth()
  if (!user.businessId) return <div>Complete onboarding first.</div>

  const business = await db.business.findUnique({
    where: { id: user.businessId },
    include: { subscription: true },
  })
  if (!business) return <div>Business not found.</div>

  const planType = getEffectivePlanType(business.subscription?.planType)
  const isLocalPlus = planType === "LOCAL_PLUS"

  const voiceSettings =
    business.voiceSettings && typeof business.voiceSettings === "object"
      ? (business.voiceSettings as { speed?: number; temperature?: number; volume?: number })
      : null

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Update your business info, conversation flow, and voice (Local Plus) anytime.
        </p>
        {isLocalPlus && (
          <Badge variant="secondary" className="mt-2">
            Priority Support
          </Badge>
        )}
      </div>

      <SettingsClient
        business={{
          id: business.id,
          name: business.name,
          industry: business.industry,
          businessLinePhone: business.businessLinePhone ?? undefined,
          address: business.address ?? undefined,
          city: business.city ?? undefined,
          state: business.state ?? undefined,
          zipCode: business.zipCode ?? undefined,
          serviceAreas: business.serviceAreas,
          businessHours:
            business.businessHours && typeof business.businessHours === "object"
              ? (business.businessHours as { open?: string; close?: string; days?: string[] })
              : undefined,
          crmWebhookUrl: business.crmWebhookUrl ?? undefined,
          forwardToEmail: business.forwardToEmail ?? undefined,
          afterHoursEmergencyPhone: isLocalPlus ? undefined : (business.afterHoursEmergencyPhone ?? undefined),
          offersRoadsideService: business.offersRoadsideService ?? undefined,
          voiceSettings: voiceSettings ?? undefined,
        }}
        planType={planType}
        hasAgent={!!business.retellAgentId}
      />
    </div>
  )
}
