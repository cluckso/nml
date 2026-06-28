import { Resend } from "resend"
import type { FunnelLeadPayload } from "./funnel-config"
import { getFunnelConfig } from "./industry-configs"
import { SUPPORT_EMAIL } from "@/lib/site-contact"

/** Max weighted score from standard funnel weights: 50 + 25 + 10 = 85 */
export const FUNNEL_MAX_LEAD_SCORE = 85

/** Default high-intent threshold — mid/high volume plus pain or confirm. Override via env. */
export const DEFAULT_FUNNEL_HIGH_SCORE_THRESHOLD = 60

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL?.trim()
  ? `CallGrabbr Funnel <${process.env.RESEND_FROM_EMAIL.trim()}>`
  : "CallGrabbr Funnel <notifications@callgrabbr.com>"

export function getFunnelHighScoreThreshold(): number {
  const raw = process.env.FUNNEL_LEAD_HIGH_SCORE_THRESHOLD?.trim()
  if (!raw) return DEFAULT_FUNNEL_HIGH_SCORE_THRESHOLD
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 0) return DEFAULT_FUNNEL_HIGH_SCORE_THRESHOLD
  return n
}

export function isHighScoreFunnelLead(score: number): boolean {
  return score >= getFunnelHighScoreThreshold()
}

function getNotifyEmail(): string | null {
  const configured = process.env.FUNNEL_LEAD_NOTIFY_EMAIL?.trim()
  if (configured) return configured
  return SUPPORT_EMAIL
}

function getWebhookUrl(): string | null {
  const url = process.env.FUNNEL_LEAD_WEBHOOK_URL?.trim()
  return url || null
}

export interface FunnelLeadNotificationInput {
  leadId: string | null
  industry: string
  score: number
  name?: string | null
  email?: string | null
  phone?: string | null
  responses: Record<string, string>
  roiSnapshot?: FunnelLeadPayload["roiSnapshot"]
  utm?: FunnelLeadPayload["utm"]
}

function buildLeadSummaryHtml(input: FunnelLeadNotificationInput): string {
  const config = getFunnelConfig(input.industry)
  const displayName = config?.displayName ?? input.industry
  const roi = input.roiSnapshot

  return `
    <h2>High-score funnel lead (${input.score}/${FUNNEL_MAX_LEAD_SCORE})</h2>
    <p><strong>Industry:</strong> ${displayName}</p>
    ${input.name ? `<p><strong>Name:</strong> ${input.name}</p>` : ""}
    ${input.email ? `<p><strong>Email:</strong> ${input.email}</p>` : ""}
    ${input.phone ? `<p><strong>Phone:</strong> ${input.phone}</p>` : ""}
    ${input.leadId ? `<p><strong>Lead ID:</strong> ${input.leadId}</p>` : ""}
    ${
      roi
        ? `<p><strong>ROI snapshot:</strong> ~${roi.callsPerWeek} calls/week · $${Math.round(roi.missedRevenuePerMonth).toLocaleString()}/mo missed · $${Math.round(roi.recoveredRevenuePerMonth).toLocaleString()}/mo recoverable</p>`
        : ""
    }
    <p><strong>Business:</strong> ${input.responses.businessName ?? "—"}</p>
    <p><strong>Call volume:</strong> ${input.responses.callVolume ?? "—"}</p>
    <p><strong>Biggest pain:</strong> ${input.responses.biggestPain ?? "—"}</p>
  `.trim()
}

export async function notifyHighScoreFunnelLead(
  input: FunnelLeadNotificationInput
): Promise<{ emailSent: boolean; webhookSent: boolean; skipped: boolean }> {
  if (!isHighScoreFunnelLead(input.score)) {
    return { emailSent: false, webhookSent: false, skipped: true }
  }

  const results = { emailSent: false, webhookSent: false, skipped: false }

  const notifyEmail = getNotifyEmail()
  if (resend && notifyEmail) {
    try {
      const config = getFunnelConfig(input.industry)
      const displayName = config?.displayName ?? input.industry
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: notifyEmail,
        subject: `🔥 High-score funnel lead: ${displayName} (${input.score})`,
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5">${buildLeadSummaryHtml(input)}</body></html>`,
      })
      if (error) {
        console.warn("[funnel/lead] High-score email failed:", error)
      } else {
        results.emailSent = true
      }
    } catch (err) {
      console.warn("[funnel/lead] High-score email error:", err)
    }
  } else if (!resend) {
    console.info("[funnel/lead] High-score email skipped: RESEND_API_KEY not configured")
  }

  const webhookUrl = getWebhookUrl()
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "funnel_lead.high_score",
          leadId: input.leadId,
          industry: input.industry,
          score: input.score,
          threshold: getFunnelHighScoreThreshold(),
          name: input.name,
          email: input.email,
          phone: input.phone,
          responses: input.responses,
          roiSnapshot: input.roiSnapshot,
          utm: input.utm,
        }),
      })
      if (!res.ok) {
        console.warn("[funnel/lead] Webhook failed:", res.status, await res.text().catch(() => ""))
      } else {
        results.webhookSent = true
      }
    } catch (err) {
      console.warn("[funnel/lead] Webhook error:", err)
    }
  }

  return results
}
