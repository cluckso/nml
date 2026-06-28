import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { FunnelLeadPayload } from "@/lib/funnel/funnel-config"
import { getFunnelConfig } from "@/lib/funnel/industry-configs"
import { notifyHighScoreFunnelLead } from "@/lib/funnel/lead-notifications"

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FunnelLeadPayload

    const industry = typeof body.industry === "string" ? body.industry.trim().toLowerCase() : ""
    if (!industry || !getFunnelConfig(industry)) {
      return NextResponse.json({ error: "Invalid industry" }, { status: 400 })
    }

    const responses =
      body.responses && typeof body.responses === "object" ? body.responses : {}
    const score = typeof body.score === "number" ? Math.round(body.score) : 0

    const name = typeof responses.contactName === "string" ? responses.contactName.trim() : undefined
    const email = typeof responses.contactEmail === "string" ? responses.contactEmail.trim() : undefined
    const phone = typeof responses.contactPhone === "string" ? responses.contactPhone.trim() : undefined

    if (!email && !phone) {
      return NextResponse.json({ error: "Contact email or phone required" }, { status: 400 })
    }

    const utm = body.utm ?? {}

    const leadData = {
      industry,
      score,
      responses,
      roiSnapshot: body.roiSnapshot ?? null,
      utm,
      name: name ?? null,
      email: email ?? null,
      phone: phone ?? null,
    }

    console.info("[funnel/lead]", JSON.stringify({ ...leadData, responses: "[redacted]" }))

    try {
      const lead = await db.funnelLead.create({
        data: {
          industry,
          score,
          responses,
          roiSnapshot: body.roiSnapshot ?? undefined,
          utmSource: utm.source ?? null,
          utmMedium: utm.medium ?? null,
          utmCampaign: utm.campaign ?? null,
          utmTerm: utm.term ?? null,
          utmContent: utm.content ?? null,
          name: name ?? null,
          email: email ?? null,
          phone: phone ?? null,
        },
      })

      void notifyHighScoreFunnelLead({
        leadId: lead.id,
        industry,
        score,
        name: name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        responses,
        roiSnapshot: body.roiSnapshot,
        utm,
      }).catch((err) => console.warn("[funnel/lead] Notification error:", err))

      return NextResponse.json({ success: true, leadId: lead.id })
    } catch (dbError) {
      console.warn("[funnel/lead] DB insert failed, logged only:", dbError)

      void notifyHighScoreFunnelLead({
        leadId: null,
        industry,
        score,
        name: name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        responses,
        roiSnapshot: body.roiSnapshot,
        utm,
      }).catch((err) => console.warn("[funnel/lead] Notification error:", err))

      return NextResponse.json({ success: true, leadId: null, persisted: false })
    }
  } catch (error) {
    console.error("Funnel lead error:", error)
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 })
  }
}
