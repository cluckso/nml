import { Resend } from "resend"
import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/site-url"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL?.trim()
  ? `CallGrabbr <${process.env.RESEND_FROM_EMAIL.trim()}>`
  : "CallGrabbr <notifications@callgrabbr.com>"

export type FirstVisitEmailTarget = {
  userId: string
  email: string
  name: string | null
  businessId: string | null
  onboardingComplete: boolean
  trialStartedAt: Date | null
}

/** Deep-link back to the step they likely stalled on. */
export function firstVisitCta(target: Pick<FirstVisitEmailTarget, "businessId" | "onboardingComplete" | "trialStartedAt">): {
  href: string
  label: string
} {
  const base = SITE_URL.replace(/\/$/, "")
  if (!target.businessId || !target.trialStartedAt) {
    return { href: `${base}/trial/start`, label: "Start your free trial" }
  }
  if (!target.onboardingComplete) {
    return { href: `${base}/onboarding`, label: "Finish business setup" }
  }
  return {
    href: `${base}/settings?section=greeting#preview-greeting`,
    label: "Preview your AI greeting",
  }
}

export function buildFirstVisitEmailHtml(input: {
  firstName: string
  ctaHref: string
  ctaLabel: string
}): string {
  const { firstName, ctaHref, ctaLabel } = input
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 560px;">
      <p>Hey ${firstName},</p>
      <p>
        Quick question — did you get a chance to hear how CallGrabbr answers a missed call?
        Most shops lose jobs when they're on a roof or under a truck. We grab the lead and
        text you in seconds so you can call back first.
      </p>
      <p style="margin-top: 20px;">
        <a href="${ctaHref}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600;">
          ${ctaLabel}
        </a>
      </p>
      <p style="font-size: 13px; color: #666; margin-top: 24px;">
        Takes about a minute. If anything's stuck, reply to this email — a real person reads it.
      </p>
      <p style="font-size: 13px; color: #666;">— CallGrabbr</p>
    </div>
  `.trim()
}

function displayFirstName(name: string | null, email: string): string {
  const fromName = name?.trim().split(/\s+/)[0]
  if (fromName) return fromName
  const local = email.split("@")[0]?.trim()
  if (local) return local.charAt(0).toUpperCase() + local.slice(1)
  return "there"
}

/**
 * Claim + send the first-visit re-engagement email once per user.
 * Returns whether a send was attempted (claimed).
 */
export async function maybeSendFirstVisitEmail(userId: string): Promise<{
  sent: boolean
  skipped?: "already_sent" | "no_resend" | "no_email" | "send_failed"
}> {
  if (!resend) {
    return { sent: false, skipped: "no_resend" }
  }

  let claimed: { count: number }
  try {
    claimed = await db.user.updateMany({
      where: { id: userId, firstVisitEmailSentAt: null },
      data: { firstVisitEmailSentAt: new Date() },
    })
  } catch (err) {
    // Column not migrated yet — fail soft so signup/confirm still works.
    console.error("[FirstVisitEmail] Claim failed (apply prisma/sql/add_first_visit_email_sent_at.sql):", err)
    return { sent: false, skipped: "send_failed" }
  }
  if (claimed.count === 0) {
    return { sent: false, skipped: "already_sent" }
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      businessId: true,
      business: {
        select: {
          onboardingComplete: true,
          trialStartedAt: true,
        },
      },
    },
  })

  const toEmail = user?.email?.trim()
  if (!user || !toEmail) {
    return { sent: false, skipped: "no_email" }
  }

  const cta = firstVisitCta({
    businessId: user.businessId,
    onboardingComplete: !!user.business?.onboardingComplete,
    trialStartedAt: user.business?.trialStartedAt ?? null,
  })
  const firstName = displayFirstName(user.name, toEmail)
  const subject = `Quick question about your CallGrabbr setup, ${firstName}`

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject,
      html: buildFirstVisitEmailHtml({
        firstName,
        ctaHref: cta.href,
        ctaLabel: cta.label,
      }),
    })
    if (error) {
      console.error("[FirstVisitEmail] Resend error:", error)
      // Allow retry on next confirm/cron if provider rejected the send.
      await db.user.update({
        where: { id: userId },
        data: { firstVisitEmailSentAt: null },
      })
      return { sent: false, skipped: "send_failed" }
    }
    return { sent: true }
  } catch (err) {
    console.error("[FirstVisitEmail] Send failed:", err)
    await db.user.update({
      where: { id: userId },
      data: { firstVisitEmailSentAt: null },
    })
    return { sent: false, skipped: "send_failed" }
  }
}

/**
 * Safety net for users who confirmed but never got the immediate send
 * (e.g. client never called the API). Prefer users idle 15+ minutes.
 */
export async function sendPendingFirstVisitEmails(limit = 50): Promise<{
  processed: number
  sent: number
}> {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000)
  const maxAge = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const pending = await db.user.findMany({
    where: {
      firstVisitEmailSentAt: null,
      email: { not: "" },
      createdAt: { lte: cutoff, gte: maxAge },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  })

  let sent = 0
  for (const row of pending) {
    const result = await maybeSendFirstVisitEmail(row.id)
    if (result.sent) sent += 1
  }
  return { processed: pending.length, sent }
}
