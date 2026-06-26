import { Resend } from "resend"
import { db } from "./db"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL?.trim()
  ? `CallGrabbr <${process.env.RESEND_FROM_EMAIL.trim()}>`
  : "CallGrabbr <notifications@callgrabbr.com>"

const REVIEW_LINKS = {
  google: process.env.REVIEW_LINK_GOOGLE || "https://g.page/r/callgrabbr/review",
  g2: process.env.REVIEW_LINK_G2 || "https://www.g2.com/products/callgrabbr/reviews",
  capterra: process.env.REVIEW_LINK_CAPTERRA || "https://www.capterra.com/p/callgrabbr/reviews",
}

interface ReviewCaptureResult {
  sent: boolean
  reason?: string
}

/**
 * Check if a user qualifies for a review request and send if appropriate.
 * Triggers:
 * - After 7+ days of active usage
 * - After 10+ captured leads
 * - Only sends once per account
 */
export async function checkAndSendReviewRequest(
  userId: string
): Promise<ReviewCaptureResult> {
  if (!resend) {
    return { sent: false, reason: "Resend not configured" }
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { business: true },
  })

  if (!user || !user.email) {
    return { sent: false, reason: "User not found or no email" }
  }

  if (!user.business) {
    return { sent: false, reason: "No business associated" }
  }

  // Check if review email already sent
  const existingReview = await db.user.findFirst({
    where: {
      id: userId,
      reviewEmailSentAt: { not: null },
    },
  })

  if (existingReview) {
    return { sent: false, reason: "Review email already sent" }
  }

  // Check usage thresholds
  const business = user.business
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(business.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Count captured leads (calls with structured intake data)
  const leadCount = await db.call.count({
    where: {
      businessId: business.id,
      structuredIntake: { not: null },
    },
  })

  // Thresholds: 7+ days AND 10+ leads
  const MIN_DAYS = 7
  const MIN_LEADS = 10

  if (accountAgeDays < MIN_DAYS) {
    return { sent: false, reason: `Account age ${accountAgeDays} days < ${MIN_DAYS}` }
  }

  if (leadCount < MIN_LEADS) {
    return { sent: false, reason: `Lead count ${leadCount} < ${MIN_LEADS}` }
  }

  // Send review request email
  const firstName = user.name?.split(" ")[0] || "there"

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">Quick favor? (30 seconds)</h2>
      
      <p style="color: #333; line-height: 1.6;">Hey ${firstName},</p>
      
      <p style="color: #333; line-height: 1.6;">
        You've captured <strong>${leadCount} leads</strong> with CallGrabbr so far.
      </p>
      
      <p style="color: #333; line-height: 1.6;">
        If it's working for you, would you mind leaving a quick review? It helps other business owners find us.
      </p>
      
      <div style="margin: 30px 0;">
        <a href="${REVIEW_LINKS.google}" 
           style="display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px; margin-bottom: 10px;">
          Review on Google
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        Takes less than a minute. Your feedback genuinely helps.
      </p>
      
      <p style="color: #333; line-height: 1.6;">
        Thanks!<br>
        — The CallGrabbr Team
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px;">
        You received this because you've been using CallGrabbr for ${accountAgeDays} days. 
        This is a one-time email — we won't ask again.
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Quick favor? (30 seconds)",
      html: emailHtml,
    })

    // Mark as sent
    await db.user.update({
      where: { id: userId },
      data: { reviewEmailSentAt: new Date() },
    })

    console.info(`[Review Capture] Sent review request to ${user.email}`)
    return { sent: true }
  } catch (error) {
    console.error("[Review Capture] Failed to send:", error)
    return { sent: false, reason: "Email send failed" }
  }
}

/**
 * Batch check all users for review eligibility.
 * Call this from a cron job or scheduled task.
 */
export async function batchCheckReviewRequests(): Promise<{
  checked: number
  sent: number
}> {
  const users = await db.user.findMany({
    where: {
      reviewEmailSentAt: null,
      business: { isNot: null },
    },
    select: { id: true },
  })

  let sent = 0
  for (const user of users) {
    const result = await checkAndSendReviewRequest(user.id)
    if (result.sent) sent++
  }

  return { checked: users.length, sent }
}
