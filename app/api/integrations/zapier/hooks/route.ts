import { NextRequest, NextResponse } from "next/server"
import {
  getBusinessIdFromZapierApiKey,
  subscribeZapierHook,
  unsubscribeZapierHook,
} from "@/lib/zapier"

function getApiKey(req: NextRequest): string | null {
  const auth = req.headers.get("Authorization")
  if (auth?.startsWith("Bearer ")) return auth.slice(7)
  const header = req.headers.get("X-API-Key")
  return header ?? null
}

/** POST /api/integrations/zapier/hooks — Subscribe to Zapier REST Hook (new lead trigger) */
export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req)
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const businessId = await getBusinessIdFromZapierApiKey(apiKey)
  if (!businessId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  const body = await req.json()
  const targetUrl = typeof body.target_url === "string" ? body.target_url : typeof body.hookUrl === "string" ? body.hookUrl : ""
  const event = typeof body.event === "string" ? body.event : "new_lead"

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing target_url" }, { status: 400 })
  }

  const hook = await subscribeZapierHook(businessId, targetUrl, event)
  return NextResponse.json({ id: hook.id, event: hook.event })
}

/** DELETE /api/integrations/zapier/hooks — Unsubscribe Zapier REST Hook */
export async function DELETE(req: NextRequest) {
  const apiKey = getApiKey(req)
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const businessId = await getBusinessIdFromZapierApiKey(apiKey)
  if (!businessId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const hookId = searchParams.get("id")
  if (!hookId) {
    return NextResponse.json({ error: "Missing hook id" }, { status: 400 })
  }

  await unsubscribeZapierHook(hookId, businessId)
  return NextResponse.json({ success: true })
}

/** GET /api/integrations/zapier/hooks — Sample data for Zapier polling fallback */
export async function GET(req: NextRequest) {
  const apiKey = getApiKey(req)
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const businessId = await getBusinessIdFromZapierApiKey(apiKey)
  if (!businessId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  return NextResponse.json([
    {
      id: "sample",
      event: "new_lead",
      lead: {
        callerName: "Sample Caller",
        callerPhone: "+15551234567",
        issueDescription: "Needs AC repair",
        emergency: false,
      },
    },
  ])
}
