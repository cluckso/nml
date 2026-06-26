import { createHash, randomBytes } from "crypto"
import { db } from "./db"

const KEY_PREFIX = "cgz_"

export function generateZapierApiKey(): string {
  return `${KEY_PREFIX}${randomBytes(24).toString("hex")}`
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

export async function ensureZapierApiKey(businessId: string): Promise<{ key: string; isNew: boolean }> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  })
  if (!business) throw new Error("Business not found")

  const settings = (business.settings ?? {}) as Record<string, unknown>
  const integrations = (settings.integrations ?? {}) as Record<string, unknown>
  if (integrations.zapierApiKeyHash && integrations.zapierApiKeyPrefix) {
    return { key: "", isNew: false }
  }

  const key = generateZapierApiKey()
  const updatedSettings = {
    ...settings,
    integrations: {
      ...integrations,
      zapierApiKeyHash: hashApiKey(key),
      zapierApiKeyPrefix: key.slice(0, 12),
      zapierConnectedAt: new Date().toISOString(),
    },
  }

  await db.business.update({
    where: { id: businessId },
    data: { settings: updatedSettings },
  })

  return { key, isNew: true }
}

export async function getBusinessIdFromZapierApiKey(apiKey: string): Promise<string | null> {
  if (!apiKey.startsWith(KEY_PREFIX)) return null
  const hash = hashApiKey(apiKey)

  const businesses = await db.business.findMany({
    where: { settings: { not: null } },
    select: { id: true, settings: true },
    take: 500,
  })

  for (const b of businesses) {
    const settings = (b.settings ?? {}) as Record<string, unknown>
    const integrations = (settings.integrations ?? {}) as Record<string, unknown>
    if (integrations.zapierApiKeyHash === hash) return b.id
  }
  return null
}

export async function subscribeZapierHook(businessId: string, targetUrl: string, event = "new_lead") {
  return db.zapierHook.create({
    data: { businessId, targetUrl, event },
  })
}

export async function unsubscribeZapierHook(hookId: string, businessId: string) {
  return db.zapierHook.deleteMany({
    where: { id: hookId, businessId },
  })
}

export async function fireZapierHooks(
  businessId: string,
  event: string,
  payload: Record<string, unknown>
) {
  const hooks = await db.zapierHook.findMany({
    where: { businessId, event },
  })

  await Promise.allSettled(
    hooks.map((hook) =>
      fetch(hook.targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    )
  )
}

export async function fireZapierLeadHook(
  businessId: string,
  businessName: string,
  call: {
    id: string
    callerName?: string | null
    callerPhone?: string | null
    issueDescription?: string | null
    summary?: string | null
    emergencyFlag?: boolean
    createdAt: Date
  }
) {
  const payload = {
    event: "new_lead",
    business: { id: businessId, name: businessName },
    lead: {
      callId: call.id,
      callerName: call.callerName,
      callerPhone: call.callerPhone,
      issueDescription: call.issueDescription,
      summary: call.summary,
      emergency: call.emergencyFlag ?? false,
      createdAt: call.createdAt.toISOString(),
    },
  }

  await fireZapierHooks(businessId, "new_lead", payload)

  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { settings: true },
  })
  const settings = (business?.settings ?? {}) as Record<string, unknown>
  const crm = (settings.crm ?? {}) as Record<string, unknown>
  const zapierUrl = typeof crm.zapierWebhookUrl === "string" ? crm.zapierWebhookUrl : null
  if (zapierUrl) {
    await fetch(zapierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((e) => console.error("Zapier webhook URL error:", e))
  }
}
