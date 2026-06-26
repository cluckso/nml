import { db } from "./db"
import { stripe } from "./stripe"
import { ReferralStatus } from "@prisma/client"

const REFERRAL_REWARD_CENTS = 5000

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function ensureReferralCode(businessId: string): Promise<string> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { referralCode: true },
  })
  if (business?.referralCode) return business.referralCode

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode()
    try {
      const updated = await db.business.update({
        where: { id: businessId },
        data: { referralCode: code },
        select: { referralCode: true },
      })
      return updated.referralCode!
    } catch {
      // collision — retry
    }
  }
  throw new Error("Failed to generate unique referral code")
}

export async function trackReferralSignup(referralCode: string, referredBusinessId: string, referredEmail?: string) {
  const referrer = await db.business.findFirst({
    where: { referralCode: referralCode.toUpperCase() },
    select: { id: true },
  })
  if (!referrer || referrer.id === referredBusinessId) return null

  const existing = await db.referral.findFirst({
    where: { referredBusinessId },
  })
  if (existing) return existing

  await db.business.update({
    where: { id: referredBusinessId },
    data: { referredByBusinessId: referrer.id },
  })

  return db.referral.create({
    data: {
      referrerBusinessId: referrer.id,
      referredBusinessId,
      referredEmail: referredEmail ?? null,
      status: ReferralStatus.PENDING,
      rewardAmountCents: REFERRAL_REWARD_CENTS,
    },
  })
}

export async function convertReferralOnSubscription(businessId: string) {
  const referral = await db.referral.findFirst({
    where: {
      referredBusinessId: businessId,
      status: ReferralStatus.PENDING,
      rewardCredited: false,
    },
    include: {
      referrerBusiness: { select: { id: true, stripeCustomerId: true, name: true } },
    },
  })
  if (!referral) return

  await db.referral.update({
    where: { id: referral.id },
    data: {
      status: ReferralStatus.CONVERTED,
      convertedAt: new Date(),
    },
  })

  if (stripe && referral.referrerBusiness.stripeCustomerId) {
    try {
      await stripe.customers.createBalanceTransaction(referral.referrerBusiness.stripeCustomerId, {
        amount: -referral.rewardAmountCents,
        currency: "usd",
        description: `Referral reward: ${referral.referredEmail ?? "new business"} subscribed`,
      })
      await db.referral.update({
        where: { id: referral.id },
        data: { rewardCredited: true },
      })
      console.info("[Referrals] Credited referrer", {
        referrerId: referral.referrerBusinessId,
        amountCents: referral.rewardAmountCents,
      })
    } catch (err) {
      console.error("[Referrals] Failed to credit Stripe balance:", err)
    }
  }
}

export function getReferralLink(referralCode: string, appUrl?: string): string {
  const base = (appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com").replace(/\/$/, "")
  return `${base}/sign-up?ref=${encodeURIComponent(referralCode)}`
}
