import { db } from "./db"
import { checkTrialEligibility, releasePrimaryForwardingNumberFromOtherBusinesses } from "./trial"
import { Industry, ClientStatus } from "@prisma/client"
import { funnelSlugToIndustry } from "./funnel/funnel-trial-bridge"
import { TRIAL_DAYS } from "./plans"

export type TrialStartBusinessInput = {
  userId: string
  businessPhone: string
  funnelIndustry?: string
  contactName?: string
  contactEmail?: string
  smsConsent?: boolean
  /** When true, only create/update business — no internal trial clock (Stripe trial checkout). */
  skipInternalTrial?: boolean
}

export type TrialStartBusinessResult =
  | { ok: true; businessId: string; onboardingUrl: string }
  | { ok: false; status: number; error: string }

/**
 * Shared business setup for no-card and card-on-file trial flows.
 */
export async function prepareBusinessForTrial(
  input: TrialStartBusinessInput,
  appUrl: string
): Promise<TrialStartBusinessResult> {
  const eligibility = await checkTrialEligibility(input.businessPhone.trim())
  if (!eligibility.eligible) {
    const reason = "reason" in eligibility ? eligibility.reason : "invalid_phone"
    return {
      ok: false,
      status: 403,
      error:
        reason === "phone_already_used_trial"
          ? "This number has already been used for a trial."
          : "Invalid phone number.",
    }
  }

  const normalizedPhone = eligibility.normalizedPhone
  const resolvedIndustry = input.funnelIndustry
    ? funnelSlugToIndustry(input.funnelIndustry.trim().toLowerCase())
    : Industry.GENERIC

  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { businessId: true },
  })

  let business = user?.businessId
    ? await db.business.findUnique({ where: { id: user.businessId } })
    : null

  await releasePrimaryForwardingNumberFromOtherBusinesses(normalizedPhone, business?.id)

  if (business?.primaryForwardingNumber?.startsWith("pending-")) {
    await db.business.update({
      where: { id: business.id },
      data: { primaryForwardingNumber: normalizedPhone },
    })
    business = await db.business.findUnique({ where: { id: business.id } })
  } else if (!business) {
    business = await db.business.create({
      data: {
        name: input.contactName?.trim() || "My Business",
        industry: resolvedIndustry,
        primaryForwardingNumber: normalizedPhone,
        forwardToEmail: input.contactEmail?.trim() || undefined,
        onboardingComplete: false,
        status: ClientStatus.ACTIVE,
        users: { connect: { id: input.userId } },
      },
    })
    await db.user.update({
      where: { id: input.userId },
      data: { businessId: business.id },
    })
  }

  if (!business) {
    return { ok: false, status: 500, error: "Business not found" }
  }

  const now = new Date()
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
  await db.business.update({
    where: { id: business.id },
    data: {
      status: ClientStatus.ACTIVE,
      ...(input.skipInternalTrial
        ? {}
        : {
            trialStartedAt: now,
            trialEndsAt,
            trialMinutesUsed: 0,
          }),
      ...(business.industry === Industry.GENERIC && resolvedIndustry !== Industry.GENERIC
        ? { industry: resolvedIndustry }
        : {}),
      ...(input.contactName &&
      (business.name === "My Business" || !business.name.trim())
        ? { name: input.contactName.trim() }
        : {}),
      ...(input.contactEmail?.trim() && !business.forwardToEmail
        ? { forwardToEmail: input.contactEmail.trim() }
        : {}),
    },
  })

  if (input.smsConsent) {
    await db.user.update({
      where: { id: input.userId },
      data: {
        smsConsent: true,
        smsConsentAt: new Date(),
        smsOptedOut: false,
        smsOptedOutAt: null,
      },
    })
  }

  const baseUrl = appUrl.replace(/\/$/, "")
  return {
    ok: true,
    businessId: business.id,
    onboardingUrl: `${baseUrl}/onboarding`,
  }
}
