import { db } from "./db"
import { PlanType } from "@prisma/client"
import { hasWeeklyReports, getEffectivePlanType } from "./plans"
import { subDays } from "date-fns"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/** From address for report emails. Use RESEND_FROM_EMAIL in .env for testing (e.g. onboarding@resend.dev). */
const REPORT_FROM =
  process.env.RESEND_FROM_EMAIL ||
  "NeverMissLead-AI <notifications@nevermisslead.ai>"

export type SendWeeklyReportOptions = { test?: boolean }

export async function sendWeeklyReportForBusiness(
  businessId: string,
  options?: SendWeeklyReportOptions
): Promise<boolean> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    include: {
      users: { take: 1 },
      subscription: true,
    },
  })

  if (!business) return false

  const effectivePlan = getEffectivePlanType(business.subscription?.planType)
  if (!options?.test && !hasWeeklyReports(effectivePlan)) {
    return false
  }

  const owner = business.users[0]
  if (!owner || !resend) return false

  const weekStart = subDays(new Date(), 7)
  const [calls, usage] = await Promise.all([
    db.call.findMany({
      where: {
        businessId,
        createdAt: { gte: weekStart },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.usage.findUnique({
      where: {
        businessId_billingPeriod: {
          businessId,
          billingPeriod: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
        },
      },
    }),
  ])

  const byTag = calls.reduce(
    (acc, c) => {
      const tag = c.leadTag || "GENERAL"
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const totalMinutes = calls.reduce((sum, c) => sum + c.minutes, 0)

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>Weekly Report</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>Weekly report: ${business.name}</h1>
          <p>Week ending ${new Date().toLocaleDateString()}</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Usage</h2>
            <p><strong>Call minutes this period:</strong> ${totalMinutes.toFixed(1)}</p>
            <p><strong>Total calls:</strong> ${calls.length}</p>
          </div>

          <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Leads by tag</h2>
            <ul>
              ${Object.entries(byTag).map(([tag, count]) => `<li>${tag}: ${count}</li>`).join("")}
            </ul>
          </div>

          ${calls.length > 0 ? `
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Recent calls</h2>
              <ul>
                ${calls.slice(0, 10).map((c) => `<li>${new Date(c.createdAt).toLocaleString()} – ${c.callerName || "Unknown"} (${c.leadTag || "—"})</li>`).join("")}
              </ul>
            </div>
          ` : ""}

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            NeverMissLead-AI – Weekly report
          </p>
        </div>
      </body>
    </html>
  `

  const subject = options?.test
    ? `[TEST] Weekly report: ${business.name}`
    : `Weekly report: ${business.name}`

  const { error } = await resend.emails.send({
    from: REPORT_FROM,
    to: owner.email,
    subject,
    html,
  })
  if (error) {
    console.error("Weekly report send error:", error)
    return false
  }
  return true
}

/** Send weekly reports to all Local Plus businesses (call from cron) */
export async function sendAllWeeklyReports(): Promise<{ sent: number; skipped: number }> {
  const businesses = await db.business.findMany({
    where: {
      subscription: {
        planType: PlanType.LOCAL_PLUS,
        status: "ACTIVE",
      },
    },
    select: { id: true },
  })

  let sent = 0
  let skipped = 0
  for (const b of businesses) {
    try {
      const ok = await sendWeeklyReportForBusiness(b.id)
      if (ok) sent++
      else skipped++
    } catch (e) {
      console.error(`Weekly report failed for business ${b.id}:`, e)
      skipped++
    }
  }
  return { sent, skipped }
}
