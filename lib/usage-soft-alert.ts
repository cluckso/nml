import type { Business } from "@prisma/client"
import { Resend } from "resend"
import twilio from "twilio"
import { db } from "@/lib/db"
import { mergeWithDefaults } from "@/lib/business-settings"
import { getIncludedMinutes } from "@/lib/plans"
import { getPlanDisplayName } from "@/lib/plan-labels"
import {
  getPlanUsageNudge,
  getUsagePercent,
  isUsageNudgeThreshold,
} from "@/lib/plan-usage"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL?.trim()
  ? `CallGrabbr <${process.env.RESEND_FROM_EMAIL.trim()}>`
  : "CallGrabbr <notifications@callgrabbr.com>"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.callgrabbr.com"

/** True when this increment crosses the soft usage threshold for the first time. */
export function crossedUsageSoftAlertThreshold(
  previousMinutes: number,
  newMinutes: number,
  includedMinutes: number
): boolean {
  if (includedMinutes <= 0) return false
  if (isUsageNudgeThreshold(previousMinutes, includedMinutes)) return false
  return isUsageNudgeThreshold(newMinutes, includedMinutes)
}

/**
 * Once per billing period: email/SMS when paid usage first hits 80% of included minutes.
 * Claims the alert row first so concurrent webhooks cannot double-send.
 */
export async function maybeSendUsageSoftAlert(input: {
  business: Business
  billingPeriod: string
  previousMinutes: number
  newMinutes: number
}): Promise<void> {
  const { business, billingPeriod, previousMinutes, newMinutes } = input
  if (!business.planType) return

  const includedMinutes = getIncludedMinutes(business.planType)
  if (!crossedUsageSoftAlertThreshold(previousMinutes, newMinutes, includedMinutes)) {
    return
  }

  const claimed = await db.usage.updateMany({
    where: {
      businessId: business.id,
      billingPeriod,
      usageSoftAlertSentAt: null,
    },
    data: { usageSoftAlertSentAt: new Date() },
  })
  if (claimed.count === 0) return

  const settings = mergeWithDefaults(
    business.settings as Parameters<typeof mergeWithDefaults>[0]
  )
  const wantEmail = settings.notifications.emailAlerts
  const wantSms = settings.notifications.smsAlerts

  const nudge = getPlanUsageNudge({
    planType: business.planType,
    minutesUsed: newMinutes,
    minutesIncluded: includedMinutes,
    isOnTrial: false,
  })
  if (!nudge?.show) return

  const percent = Math.ceil(getUsagePercent(newMinutes, includedMinutes))
  const planName = getPlanDisplayName(business.planType)
  const billingUrl = `${APP_URL}/billing#plans`
  const smsBody = `CallGrabbr: you've used ~${percent}% of your ${planName} minutes this month. Review plans: ${billingUrl}`

  if (wantEmail && resend) {
    try {
      const owner = await db.user.findFirst({ where: { businessId: business.id } })
      const toEmail = owner?.email
      if (toEmail) {
        const { error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: toEmail,
          subject: `You've used ${percent}% of your CallGrabbr minutes`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 560px;">
              <h2 style="margin-bottom: 8px;">${nudge.title}</h2>
              <p>${nudge.message}</p>
              <p style="margin-top: 16px;">
                <a href="${billingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">
                  ${nudge.ctaLabel}
                </a>
              </p>
              <p style="font-size: 13px; color: #666; margin-top: 24px;">
                You're on ${planName} · ${Math.round(newMinutes)} / ${includedMinutes} minutes used this period.
                This is a one-time heads-up for this billing month.
              </p>
            </div>
          `,
        })
        if (error) {
          console.error("[UsageSoftAlert] Email error:", error)
        }
      }
    } catch (err) {
      console.error("[UsageSoftAlert] Email failed:", err)
    }
  }

  if (wantSms && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const owner = await db.user.findFirst({
        where: {
          businessId: business.id,
          phoneNumber: { not: null },
          smsConsent: true,
          smsOptedOut: false,
        },
      })
      if (owner?.phoneNumber) {
        await twilioClient.messages.create({
          body: smsBody.slice(0, 480),
          from: process.env.TWILIO_PHONE_NUMBER,
          to: owner.phoneNumber,
        })
      }
    } catch (err) {
      console.error("[UsageSoftAlert] SMS failed:", err)
    }
  }
}

/** Test helper — threshold fraction used by product. */
export function usageSoftAlertThreshold(): number {
  return 0.8
}
