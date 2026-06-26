import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendFollowUpSMS } from "@/lib/notifications"
import { mergeWithDefaults } from "@/lib/business-settings"
import { hasSmsToCallers, getEffectivePlanType } from "@/lib/plans"

/** Cron: send 24hr follow-up SMS to callers who haven't booked an appointment */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const delayHoursDefault = 24
  const minAge = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const maxAge = new Date(now.getTime() - 20 * 60 * 60 * 1000)

  const calls = await db.call.findMany({
    where: {
      callerPhone: { not: null },
      callerConfirmationSentAt: { not: null, gte: minAge, lte: maxAge },
      followUpSentAt: null,
      appointments: { none: {} },
    },
    include: {
      business: { select: { id: true, name: true, planType: true, settings: true } },
    },
    take: 100,
  })

  let sent = 0
  for (const call of calls) {
    const planType = getEffectivePlanType(call.business.planType)
    if (!hasSmsToCallers(planType)) continue

    const settings = mergeWithDefaults(call.business.settings as Parameters<typeof mergeWithDefaults>[0])
    if (!settings.followUpSms.enabled) continue

    const delayHours = settings.followUpSms.followUpDelayHours || delayHoursDefault
    const eligibleAfter = new Date(
      (call.callerConfirmationSentAt ?? call.createdAt).getTime() + delayHours * 60 * 60 * 1000
    )
    if (now < eligibleAfter) continue

    const phone = call.callerPhone
    if (!phone) continue

    try {
      await sendFollowUpSMS(
        { id: call.business.id, name: call.business.name } as import("@prisma/client").Business,
        phone,
        call.issueDescription,
        settings.followUpSms.followUpMessage
      )
      await db.call.update({
        where: { id: call.id },
        data: { followUpSentAt: new Date() },
      })
      sent++
    } catch (err) {
      console.error("[Cron follow-up] Failed for call", call.id, err)
    }
  }

  return NextResponse.json({ ok: true, processed: calls.length, sent })
}
