import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { ensureZapierApiKey } from "@/lib/zapier"
import { db } from "@/lib/db"

/** GET /api/integrations/zapier — Zapier connection status for dashboard */
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId },
    select: { settings: true },
  })
  const settings = (business?.settings ?? {}) as Record<string, unknown>
  const integrations = (settings.integrations ?? {}) as Record<string, unknown>
  const hooks = await db.zapierHook.findMany({
    where: { businessId: user.businessId },
    select: { id: true, event: true, targetUrl: true, createdAt: true },
  })

  return NextResponse.json({
    connected: !!integrations.zapierApiKeyHash,
    keyPrefix: integrations.zapierApiKeyPrefix ?? null,
    connectedAt: integrations.zapierConnectedAt ?? null,
    hooks,
    docsUrl: "/integrations/zapier",
  })
}

/** POST /api/integrations/zapier — Generate or rotate Zapier API key */
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { key, isNew } = await ensureZapierApiKey(user.businessId)
  if (!isNew) {
    const rotated = await regenerateKey(user.businessId)
    return NextResponse.json({ success: true, apiKey: rotated, rotated: true })
  }

  return NextResponse.json({ success: true, apiKey: key, rotated: false })
}

async function regenerateKey(businessId: string) {
  const { generateZapierApiKey, hashApiKey } = await import("@/lib/zapier")
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  })
  const settings = (business?.settings ?? {}) as Record<string, unknown>
  const integrations = (settings.integrations ?? {}) as Record<string, unknown>
  const key = generateZapierApiKey()

  await db.business.update({
    where: { id: businessId },
    data: {
      settings: {
        ...settings,
        integrations: {
          ...integrations,
          zapierApiKeyHash: hashApiKey(key),
          zapierApiKeyPrefix: key.slice(0, 12),
          zapierConnectedAt: new Date().toISOString(),
        },
      },
    },
  })

  return key
}
