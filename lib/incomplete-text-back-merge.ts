import { db } from "./db"
import { Prisma } from "@prisma/client"
import { normalizeE164 } from "./normalize-phone"
import { parseLeadFromSummaryOrTranscript } from "./parse-lead-from-transcript"

function phoneVariants(phone: string): string[] {
  const normalized = normalizeE164(phone) ?? phone
  const digits = normalized.replace(/\D/g, "")
  const variants = new Set<string>()
  if (normalized) variants.add(normalized)
  if (digits.length >= 10) {
    variants.add(`+1${digits.slice(-10)}`)
    variants.add(digits.slice(-10))
    variants.add(digits)
  }
  return [...variants].filter(Boolean)
}

function extractPhoneFromText(text: string): string | null {
  const match = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/)
  if (!match) return null
  return normalizeE164(match[0])
}

/**
 * Merge an inbound SMS reply into a recent call that received incomplete-call text-back.
 * Returns an auto-reply message when merged, or null when no matching call.
 */
export async function mergeIncompleteTextBackReply(
  from: string,
  body: string
): Promise<string | null> {
  const trimmed = body.trim()
  if (trimmed.length < 3) return null

  const variants = phoneVariants(from)
  const call = await db.call.findFirst({
    where: {
      missedCallTextBackSent: true,
      incompleteTextBackReplyAt: null,
      callerPhone: { in: variants },
    },
    orderBy: { createdAt: "desc" },
    include: { business: true },
  })

  if (!call) return null

  const parsed = parseLeadFromSummaryOrTranscript(trimmed)
  const replyPhone = extractPhoneFromText(trimmed)
  const existingIntake = (call.structuredIntake as Record<string, unknown> | null) ?? {}

  const updateData: {
    callerName?: string
    callerPhone?: string
    issueDescription?: string
    structuredIntake: Record<string, unknown>
    incompleteTextBackReplyAt: Date
  } = {
    structuredIntake: {
      ...existingIntake,
      ...(parsed.name ? { name: parsed.name } : {}),
      ...(parsed.address ? { address: parsed.address } : {}),
      ...(parsed.city ? { city: parsed.city } : {}),
      ...(parsed.issue_description ? { issue_description: parsed.issue_description } : {}),
      ...(replyPhone ? { phone: replyPhone } : {}),
      sms_reply: trimmed,
      sms_reply_at: new Date().toISOString(),
    },
    incompleteTextBackReplyAt: new Date(),
  }

  if (!call.callerName?.trim() && parsed.name) {
    updateData.callerName = parsed.name
  }
  if (!call.issueDescription?.trim() && parsed.issue_description) {
    updateData.issueDescription = parsed.issue_description
  }
  if (replyPhone && (!call.callerPhone || call.callerPhone === from)) {
    updateData.callerPhone = replyPhone
  }

  await db.call.update({
    where: { id: call.id },
    data: {
      ...updateData,
      structuredIntake: updateData.structuredIntake as Prisma.InputJsonValue,
    },
  })

  const businessName = call.business?.name?.trim() || "our team"
  return `Thanks—we got your details. Someone from ${businessName} will follow up.`
}
