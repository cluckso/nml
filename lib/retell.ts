import { Industry, PlanType } from "@prisma/client"
import { db } from "./db"
import { generatePrompt, BusinessHoursInput } from "./prompts"
import {
  hasAppointmentCapture,
  hasMultiDepartment,
  hasBrandedVoice,
  getEffectivePlanType,
} from "./plans"
import { computeRingDurationMsForInbound, normalizeCallRouting, ringDurationMsForRetellAgent, DEFAULT_CALL_ROUTING } from "./call-routing"
import { DEFAULT_BUSINESS_TIMEZONE, normalizeBusinessTimezone } from "./business-timezone"
import { DEFAULT_RETELL_VOICE, RETELL_GLOBAL_PROMPT_TEMPLATE, getRetellVoiceConfig, receptionistAgentFields } from "./retell-agent-template"
import { buildDemoGlobalPrompt, buildSteveGlobalPrompt, buildTemplateGlobalPrompt } from "./receptionist-prompt"
import { STEVE_PERSONAL_AGENT_CONFIG } from "@/config/steve-personal-agent"
import { buildStevePersonalConversationFlow } from "./flows/steve-personal-flow"
import {
  TASK_ADDRESS,
  TASK_APPOINTMENT,
  TASK_CHILD_AGE,
  TASK_CHILD_CARE,
  TASK_CHILD_REASON,
  TASK_CHILD_TOUR,
  TASK_CITY,
  TASK_CONFIRM,
  TASK_CONFIRM_DEMO,
  TASK_DROPOFF,
  TASK_END,
  TASK_GREET,
  TASK_GREET_DEMO,
  TASK_NOT_SUPPORTED,
  TASK_PHONE,
  TASK_REASON,
  TASK_REASON_AUTO,
  TASK_REASON_DEMO,
  TASK_URGENCY,
  TASK_VEHICLE,
  TASK_VERIFY_AREA,
  TRANSITION_CONFIRM_DONE,
  TRANSITION_NAME_PROVIDED,
  TRANSITION_PHONE_PROVIDED,
  TRANSITION_REASON_CLEAR,
} from "./conversation-flow-instructions"
import {
  buildQuestionDepthGuidance,
  buildStrictnessGuidance,
  buildWarmthGuidance,
} from "./agent-override"

const RETELL_API_BASE = process.env.RETELL_API_BASE ?? "https://api.retellai.com"

/** Inbound webhook URL for per-call routing (dynamic vars, capacity, demo detection). */
export function getRetellInboundWebhookUrl(): string | undefined {
  const explicit = process.env.RETELL_INBOUND_WEBHOOK_URL?.trim()
  if (explicit) return explicit
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!appUrl) return undefined
  return `${appUrl.replace(/\/$/, "")}/api/webhooks/retell`
}

/** Standard model for all conversation flows: gemini-3.0-flash (create + update). */
const RETELL_MODEL_CHOICE = { model: "gemini-3.0-flash" as const, type: "cascading" as const }

export interface CreateAgentRequest {
  businessName: string
  industry: Industry
  serviceAreas: string[]
  planType?: PlanType
  businessHours?: BusinessHoursInput
  departments?: string[]
  afterHoursEmergencyPhone?: string
}

export async function createRetellAgent(
  data: CreateAgentRequest
): Promise<{ agent_id: string; phone_number?: string }> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    throw new Error("RETELL_API_KEY is not configured")
  }

  const globalPrompt = generatePrompt(
    data.businessName,
    data.industry,
    data.serviceAreas,
    {
      businessHours: data.businessHours ?? undefined,
      departments: data.departments?.length ? data.departments : undefined,
      afterHoursEmergencyPhone: data.afterHoursEmergencyPhone,
      includeAppointmentCapture: data.planType ? hasAppointmentCapture(data.planType) : false,
    }
  )

  // Retell requires creating the conversation flow first, then attaching by ID
  const flow = buildConversationFlow(data.businessName, data.industry, data.serviceAreas)
  const { conversation_flow_id, version } = await createConversationFlow(apiKey, {
    ...flow,
    global_prompt: globalPrompt,
  })

  const voiceConfig = getRetellVoiceConfig(data.planType)
  const agentPayload = {
    agent_name: data.businessName,
    language: "en-US" as const,
    ...receptionistAgentFields(voiceConfig),
    response_engine: {
      type: "conversation-flow" as const,
      conversation_flow_id,
      version: version ?? 0,
    },
  }

  console.info("createRetellAgent: creating agent for", data.businessName)
  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(agentPayload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("createRetellAgent: Retell returned", response.status, error)
    throw new Error(`Failed to create Retell agent (${response.status}): ${error}`)
  }

  const result = await response.json()

  // Use existing number (dev hardcoded or RETELL_EXISTING_PHONE) and attach to new agent via PATCH
  const existingPhone =
    process.env.NODE_ENV === "development"
      ? "+14159972506"
      : process.env.RETELL_EXISTING_PHONE ?? null

  let phone_number: string | undefined
  if (existingPhone) {
    try {
      await updatePhoneNumber(apiKey, existingPhone, result.agent_id)
      phone_number = existingPhone
    } catch (err) {
      console.error("Retell update-phone-number failed (agent was created):", err)
    }
  } else {
    const areaCode = process.env.RETELL_DEFAULT_AREA_CODE
      ? parseInt(process.env.RETELL_DEFAULT_AREA_CODE, 10)
      : 415
    try {
      phone_number = await createPhoneNumber(apiKey, result.agent_id, areaCode)
    } catch (err) {
      console.error("Retell create-phone-number failed (agent was created):", err)
    }
  }

  return {
    agent_id: result.agent_id,
    phone_number,
  }
}

/** Same as CreateAgentRequest; used when provisioning agent+number from onboarding. */
export interface BusinessForProvisioning {
  name: string
  industry: Industry
  serviceAreas: string[]
  planType?: PlanType | null
  businessHours?: BusinessHoursInput
  departments?: string[]
  afterHoursEmergencyPhone?: string | null
}

/**
 * Create a Retell agent (and flow) for a business without assigning a phone number.
 * Used by provisionAgentAndNumberForBusiness to create one agent per business.
 */
export async function createRetellAgentOnly(
  data: CreateAgentRequest | BusinessForProvisioning
): Promise<string> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY is not configured")

  const name = "businessName" in data ? data.businessName : data.name
  const globalPrompt = generatePrompt(
    name,
    data.industry,
    data.serviceAreas,
    {
      businessHours: data.businessHours ?? undefined,
      departments: data.departments?.length ? data.departments : undefined,
      afterHoursEmergencyPhone: data.afterHoursEmergencyPhone ?? undefined,
      includeAppointmentCapture: data.planType ? hasAppointmentCapture(data.planType) : false,
    }
  )

  const flow = buildConversationFlow(name, data.industry, data.serviceAreas)
  const { conversation_flow_id, version } = await createConversationFlow(apiKey, {
    ...flow,
    global_prompt: globalPrompt,
  })

  const voiceConfig = getRetellVoiceConfig(data.planType)
  const agentPayload = {
    agent_name: name,
    language: "en-US" as const,
    ...receptionistAgentFields(voiceConfig),
    response_engine: {
      type: "conversation-flow" as const,
      conversation_flow_id,
      version: version ?? 0,
    },
  }

  console.info("createRetellAgentOnly: creating agent for", name)
  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(agentPayload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("createRetellAgentOnly: Retell returned", response.status, error)
    throw new Error(`Failed to create Retell agent (${response.status}): ${error}`)
  }

  const result = await response.json()
  return result.agent_id
}

/**
 * Create a dedicated Retell agent for the business and assign a phone number (recycled or new).
 * Use this in onboarding so each business gets a unique agent and number.
 * Returns { agent_id, phone_number } or throws with a descriptive message.
 */
export async function provisionAgentAndNumberForBusiness(
  business: BusinessForProvisioning,
  areaCode?: number
): Promise<{ agent_id: string; phone_number: string }> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    throw new Error("RETELL_API_KEY not configured")
  }

  const request: CreateAgentRequest = {
    businessName: business.name,
    industry: business.industry,
    serviceAreas: business.serviceAreas,
    planType: business.planType ?? undefined,
    businessHours: business.businessHours,
    departments: business.departments ?? [],
    afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
  }

  const agent_id = await createRetellAgentOnly(request)

  const effectiveAreaCode =
    areaCode ?? (process.env.RETELL_DEFAULT_AREA_CODE ? parseInt(process.env.RETELL_DEFAULT_AREA_CODE, 10) : 415)

  // Claim recycled numbers atomically (one per transaction) and try to attach to this agent.
  let phone_number: string | null = null
  const maxRecycledAttempts = 20
  for (let attempt = 0; attempt < maxRecycledAttempts; attempt++) {
    const claimed = await db.$transaction(async (tx) => {
      const row = await tx.recycledRetellNumber.findFirst({
        orderBy: { releasedAt: "asc" },
      })
      if (!row) return null
      await tx.recycledRetellNumber.delete({ where: { id: row.id } })
      return row
    })
    if (!claimed) {
      if (attempt === 0) {
        console.info("Recycled pool empty, purchasing new Retell number for agent:", agent_id)
      }
      break
    }
    try {
      await updatePhoneNumber(apiKey, claimed.phoneNumber, agent_id)
      phone_number = claimed.phoneNumber
      console.info("Reused recycled Retell number for new agent:", phone_number, "agent:", agent_id)
      break
    } catch (err) {
      console.warn("Failed to attach recycled number to agent, re-adding to pool:", claimed.phoneNumber, err)
      await db.recycledRetellNumber.create({
        data: { phoneNumber: claimed.phoneNumber },
      })
    }
  }

  if (!phone_number) {
    phone_number = await createPhoneNumber(apiKey, agent_id, effectiveAreaCode)
    console.info("Provisioned new Retell number for business agent:", phone_number, "agent:", agent_id)
  }

  return { agent_id, phone_number }
}

/** Re-attach inbound webhook URL on a business number (idempotent). Call after call-routing changes. */
export async function ensureRetellInboundWebhookForBusiness(businessId: string): Promise<void> {
  const apiKey = process.env.RETELL_API_KEY
  const inboundWebhookUrl = getRetellInboundWebhookUrl()
  if (!apiKey || !inboundWebhookUrl) return

  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { retellPhoneNumber: true, retellAgentId: true, name: true },
  })
  if (!business?.retellPhoneNumber || !business.retellAgentId) return

  try {
    await updatePhoneNumber(apiKey, business.retellPhoneNumber, business.retellAgentId)
    console.info(
      "ensureRetellInboundWebhookForBusiness: confirmed inbound webhook on",
      business.retellPhoneNumber,
      business.name
    )
  } catch (err) {
    console.error("ensureRetellInboundWebhookForBusiness failed:", business.retellPhoneNumber, err)
  }
}

/**
 * Release a business's Retell number into the recycle pool so it can be reused.
 * Call when a business churns (trial end) or cancels subscription.
 */
export async function releaseRetellNumber(businessId: string): Promise<void> {
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { retellPhoneNumber: true, retellAgentId: true, name: true },
  })
  if (!business?.retellPhoneNumber) return

  const number = business.retellPhoneNumber
  await db.$transaction([
    db.recycledRetellNumber.upsert({
      where: { phoneNumber: number },
      create: { phoneNumber: number },
      update: { releasedAt: new Date() },
    }),
    db.business.update({
      where: { id: businessId },
      data: { retellPhoneNumber: null, retellAgentId: null },
    }),
  ])
  console.info("Released Retell number to pool:", number, "business:", business.name)
}

/**
 * Provision a dedicated Retell phone number for a business.
 * Tries the recycle pool first (numbers from churned/canceled users); if empty, purchases from Retell.
 * Returns the E.164 phone number, or null if provisioning fails.
 */
export async function provisionRetellNumberForBusiness(areaCode?: number): Promise<string | null> {
  const recycled = await db.recycledRetellNumber.findFirst({
    orderBy: { releasedAt: "asc" },
  })
  if (recycled) {
    await db.recycledRetellNumber.delete({
      where: { id: recycled.id },
    })
    console.info("Reused recycled Retell number:", recycled.phoneNumber)
    return recycled.phoneNumber
  }

  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.RETELL_AGENT_ID

  if (!apiKey) {
    console.error("provisionRetellNumberForBusiness: RETELL_API_KEY not configured")
    return null
  }

  if (!agentId) {
    console.error("provisionRetellNumberForBusiness: RETELL_AGENT_ID not configured")
    return null
  }

  const effectiveAreaCode = areaCode ?? (process.env.RETELL_DEFAULT_AREA_CODE ? parseInt(process.env.RETELL_DEFAULT_AREA_CODE, 10) : 415)

  try {
    const phoneNumber = await createPhoneNumber(apiKey, agentId, effectiveAreaCode)
    console.info("Provisioned new Retell number:", phoneNumber, "for agent:", agentId)
    return phoneNumber
  } catch (error) {
    console.error("Failed to provision Retell number:", error)
    return null
  }
}

/** Purchase a new phone number from Retell and bind it to the agent. */
async function createPhoneNumber(
  apiKey: string,
  agentId: string,
  areaCode: number
): Promise<string> {
  const agentBinding = [{ agent_id: agentId, weight: 1 }]
  const inboundWebhookUrl = getRetellInboundWebhookUrl()
  const body: Record<string, unknown> = {
    inbound_agents: agentBinding,
    outbound_agents: agentBinding,
    area_code: areaCode,
    country_code: "US",
  }
  if (inboundWebhookUrl) {
    body.inbound_webhook_url = inboundWebhookUrl
  }

  console.info("createPhoneNumber: purchasing number for agent", agentId, "area code", areaCode)
  const response = await fetch(`${RETELL_API_BASE}/create-phone-number`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  if (!response.ok) {
    console.error("createPhoneNumber: Retell returned", response.status, text)
    throw new Error(`Failed to create Retell phone number (${response.status}): ${text}`)
  }

  let result: { phone_number?: string }
  try {
    result = JSON.parse(text)
  } catch {
    throw new Error("createPhoneNumber: invalid JSON response from Retell")
  }

  if (!result.phone_number) {
    throw new Error("createPhoneNumber: response missing phone_number field")
  }
  return result.phone_number
}

/** Attach an already-purchased Retell phone number to an agent via PATCH update-phone-number. */
async function updatePhoneNumber(
  apiKey: string,
  phoneNumber: string,
  agentId: string
): Promise<void> {
  const agentBinding = [{ agent_id: agentId, weight: 1 }]
  const inboundWebhookUrl = getRetellInboundWebhookUrl()
  const body: Record<string, unknown> = {
    inbound_agents: agentBinding,
    outbound_agents: agentBinding,
  }
  if (inboundWebhookUrl) {
    body.inbound_webhook_url = inboundWebhookUrl
  }
  const encoded = encodeURIComponent(phoneNumber)
  const url = `${RETELL_API_BASE}/update-phone-number/${encoded}`
  console.info("updatePhoneNumber:", phoneNumber, "→ agent", agentId)

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("updatePhoneNumber: Retell returned", response.status, error)
    throw new Error(`Failed to update Retell phone number (${response.status}): ${error}`)
  }
}

/** Create a conversation flow via Retell API; returns conversation_flow_id and version for use in create-agent. */
async function createConversationFlow(
  apiKey: string,
  flow: { nodes: any[]; start_node_id: string; start_speaker: string; global_prompt?: string }
): Promise<{ conversation_flow_id: string; version: number }> {
  const body = {
    model_choice: RETELL_MODEL_CHOICE,
    flex_mode: true,
    nodes: flow.nodes,
    start_speaker: flow.start_speaker as "agent",
    start_node_id: flow.start_node_id,
    global_prompt: flow.global_prompt ?? undefined,
  }

  console.info("createConversationFlow: creating flow with", body.nodes?.length ?? 0, "nodes")
  const response = await fetch(`${RETELL_API_BASE}/create-conversation-flow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("createConversationFlow: Retell returned", response.status, error)
    throw new Error(`Failed to create Retell conversation flow (${response.status}): ${error}`)
  }

  const result = await response.json()
  return {
    conversation_flow_id: result.conversation_flow_id,
    version: result.version ?? 0,
  }
}

/** Update an existing conversation flow (global_prompt and nodes). Returns new version. */
async function updateConversationFlow(
  apiKey: string,
  conversationFlowId: string,
  flow: { nodes: any[]; start_node_id: string; start_speaker: string; global_prompt?: string }
): Promise<{ version: number }> {
  const body = {
    model_choice: RETELL_MODEL_CHOICE,
    flex_mode: true,
    nodes: flow.nodes,
    start_speaker: flow.start_speaker as "agent",
    start_node_id: flow.start_node_id,
    global_prompt: flow.global_prompt ?? undefined,
  }

  const response = await fetch(`${RETELL_API_BASE}/update-conversation-flow/${conversationFlowId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update Retell conversation flow: ${error}`)
  }

  const result = await response.json()
  return { version: result.version ?? 0 }
}

/** GET agent; returns response_engine (conversation_flow_id, version), agent_name, voice_*. */
async function getAgent(
  apiKey: string,
  agentId: string
): Promise<{
  agent_name?: string
  voice_id?: string
  voice_temperature?: number
  voice_speed?: number
  volume?: number
  response_engine?: { type: string; conversation_flow_id?: string; version?: number }
}> {
  const response = await fetch(`${RETELL_API_BASE}/get-agent/${agentId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Retell agent: ${error}`)
  }
  return response.json()
}

/** PATCH agent (agent_name, voice_*, handbook_config, max_call_duration_ms, ring_duration_ms, response_engine). */
async function updateAgent(
  apiKey: string,
  agentId: string,
  payload: {
    agent_name?: string
    voice_id?: string
    voice_temperature?: number
    voice_speed?: number
    volume?: number
    max_call_duration_ms?: number
    ring_duration_ms?: number
    interruption_sensitivity?: number
    handbook_config?: Record<string, boolean>
    response_engine?: { type: "conversation-flow"; conversation_flow_id: string; version: number }
  }
): Promise<void> {
  const cleaned = { ...payload }
  // ring_duration_ms valid range on agent is [5000, 90000]; omit if outside range
  if (cleaned.ring_duration_ms != null && (cleaned.ring_duration_ms < 5000 || cleaned.ring_duration_ms > 90000)) {
    delete cleaned.ring_duration_ms
  }
  // max_call_duration_ms valid range [60000, 7200000]
  if (cleaned.max_call_duration_ms != null && (cleaned.max_call_duration_ms < 60000 || cleaned.max_call_duration_ms > 7200000)) {
    delete cleaned.max_call_duration_ms
  }

  const response = await fetch(`${RETELL_API_BASE}/update-agent/${agentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(cleaned),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update Retell agent (${response.status}): ${error}`)
  }
}

/** Business shape for sync (plan on Business). */
export type BusinessForSync = {
  name: string
  industry: Industry
  serviceAreas: string[]
  businessHours: unknown
  departments: string[]
  afterHoursEmergencyPhone: string | null
  voiceSettings: unknown
  retellAgentId: string | null
  planType: PlanType | null
}

/** Settings passed from dashboard (greeting, tone, question depth, voice, call routing) used to personalize the synced agent. */
export type SyncSettings = {
  greeting?: { customGreeting?: string | null; tone?: string; voiceGender?: "male" | "female" | null; premiumVoice?: boolean }
  questionDepth?: string
  voiceBrand?: { speed?: number; conciseness?: number; warmth?: number; strictness?: number }
  callRouting?: Partial<import("./call-routing").CallRoutingSettings>
  availability?: Partial<import("./business-settings").AvailabilitySettings>
  aiBehavior?: { maxCallLengthMinutes?: number; interruptTolerance?: number }
}

/**
 * Sync Retell agent and its conversation flow to match current business settings.
 * Call after PATCH /api/settings or PATCH /api/business when the business has a retellAgentId.
 * When `settings` is provided (e.g. from mergeWithDefaults), custom greeting, tone, and question depth are applied to the flow and global prompt.
 */
export async function syncRetellAgentFromBusiness(
  business: BusinessForSync,
  settings?: SyncSettings | null
): Promise<void> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey || !business.retellAgentId) return

  const agent = await getAgent(apiKey, business.retellAgentId)
  const flowId = agent.response_engine?.type === "conversation-flow" && agent.response_engine?.conversation_flow_id
  if (!flowId) {
    throw new Error("Agent does not use a conversation flow; cannot sync")
  }

  const planType = business.planType
  const effectivePlan = (await import("./plans")).getEffectivePlanType(planType)
  const bh = business.businessHours as BusinessHoursInput | null | undefined

  let globalPrompt = generatePrompt(
    business.name,
    business.industry,
    business.serviceAreas,
    {
      businessHours: bh ?? undefined,
      departments:
        hasMultiDepartment(effectivePlan) && business.departments?.length
          ? business.departments
          : undefined,
      afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
      includeAppointmentCapture: hasAppointmentCapture(effectivePlan),
    }
  )
  if (settings?.greeting?.tone || settings?.questionDepth || settings?.voiceBrand) {
    const parts: string[] = []
    if (settings.greeting?.tone) parts.push(`Use a ${settings.greeting.tone} tone.`)
    if (settings.questionDepth) {
      parts.push(
        `Question depth: ${settings.questionDepth} — ${buildQuestionDepthGuidance(settings.questionDepth as import("./business-settings").QuestionDepth)}`
      )
    }
    if (settings.voiceBrand) {
      if (typeof settings.voiceBrand.strictness === "number") {
        parts.push(buildStrictnessGuidance(settings.voiceBrand.strictness))
      }
      if (typeof settings.voiceBrand.warmth === "number") {
        parts.push(buildWarmthGuidance(settings.voiceBrand.warmth))
      }
    }
    if (parts.length) globalPrompt = globalPrompt + "\n\n" + parts.join(" ")
  }

  let flow = buildConversationFlow(business.name, business.industry, business.serviceAreas)
  const customGreeting = settings?.greeting?.customGreeting?.trim()
  if (customGreeting) {
    const startText = customGreeting.replace(/\[business\]/gi, business.name).trim()
    const startNodeId = flow.start_node_id
    const node = flow.nodes?.find((n: { id: string }) => n.id === startNodeId)
    if (node?.instruction) {
      node.instruction = {
        type: "prompt",
        text: `Deliver this greeting naturally (vary wording slightly): "${startText}" Then ask for their name if not already included.`,
      }
    }
  }

  const { version } = await updateConversationFlow(apiKey, flowId, {
    ...flow,
    global_prompt: globalPrompt,
  })

  const voiceGender = settings?.greeting?.voiceGender
  const voiceBase = getRetellVoiceConfig(effectivePlan, voiceGender, settings?.greeting?.premiumVoice)
  const voiceId = voiceBase.voice_id
  const vs = business.voiceSettings as { speed?: number; temperature?: number; volume?: number } | null | undefined
  const voiceBrand = hasBrandedVoice(effectivePlan) ? settings?.voiceBrand : undefined
  const voiceSpeed =
    voiceBrand != null && typeof voiceBrand.speed === "number"
      ? Math.max(0.5, Math.min(2, 0.75 + voiceBrand.speed * 0.75))
      : vs != null && typeof vs.speed === "number"
        ? Math.max(0.5, Math.min(2, 0.5 + vs.speed * 1.5))
        : voiceBase.voice_speed
  const voiceTemp =
    voiceBrand != null && typeof voiceBrand.conciseness === "number"
      ? Math.max(
          0,
          Math.min(
            2,
            0.2 +
              voiceBrand.conciseness * 0.35 +
              (typeof voiceBrand.warmth === "number" ? voiceBrand.warmth * 0.35 : 0.25)
          )
        )
      : vs != null && typeof vs.temperature === "number"
        ? Math.max(0, Math.min(2, vs.temperature * 2))
        : voiceBase.voice_temperature
  const voiceVol =
    vs != null && typeof vs.volume === "number"
      ? Math.max(0, Math.min(2, vs.volume * 2))
      : DEFAULT_RETELL_VOICE.volume

  const maxCallMinutes = Math.min(7, Math.max(1, settings?.aiBehavior?.maxCallLengthMinutes ?? 7))
  const maxCallDurationMs = maxCallMinutes * 60 * 1000

  const routing = settings?.callRouting
    ? normalizeCallRouting(settings.callRouting, DEFAULT_CALL_ROUTING)
    : DEFAULT_CALL_ROUTING
  const availability = {
    timezone: normalizeBusinessTimezone(settings?.availability?.timezone ?? DEFAULT_BUSINESS_TIMEZONE),
    businessHours: settings?.availability?.businessHours ?? {
      open: "08:00",
      close: "17:00",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    holidayOverrides: settings?.availability?.holidayOverrides ?? [],
    afterHoursBehavior: settings?.availability?.afterHoursBehavior ?? "take_message",
  }
  const ringDurationMs = computeRingDurationMsForInbound(routing, availability)
  const ringDurationMsPayload = ringDurationMsForRetellAgent(ringDurationMs)

  await updateAgent(apiKey, business.retellAgentId, {
    agent_name: business.name,
    ...receptionistAgentFields({
      voice_id: voiceId,
      voice_temperature: voiceTemp,
      voice_speed: voiceSpeed,
      volume: voiceVol,
      interruption_sensitivity:
        settings?.aiBehavior?.interruptTolerance ?? voiceBase.interruption_sensitivity,
      max_call_duration_ms: maxCallDurationMs,
    }),
    ...(ringDurationMsPayload != null ? { ring_duration_ms: ringDurationMsPayload } : {}),
    response_engine: { type: "conversation-flow", conversation_flow_id: flowId, version },
  })
}

function buildConversationFlow(
  businessName: string,
  industry: Industry,
  serviceAreas: string[]
): any {
  switch (industry) {
    case Industry.AUTO_REPAIR:
      return buildAutoRepairFlow(businessName)
    case Industry.CHILDCARE:
      return buildChildcareFlow(businessName)
    case Industry.GENERIC:
      return buildGenericFlow(businessName)
    case Industry.HVAC:
    case Industry.PLUMBING:
    case Industry.ELECTRICIAN:
    case Industry.HANDYMAN:
    default:
      return buildPropertyServiceFlow(businessName, serviceAreas)
  }
}

/** HVAC, PLUMBING, ELECTRICIAN: reason first, then location — natural CS flow with lead capture */
function buildPropertyServiceFlow(businessName: string, serviceAreas: string[]): any {
  const areas = serviceAreas.join(", ")
  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome Node",
        instruction: { type: "prompt", text: TASK_GREET },
        edges: [{ id: "edge-1", destination_node_id: "collect-reason", transition_condition: { type: "prompt", prompt: TRANSITION_NAME_PROVIDED } }],
        start_speaker: "agent",
      },
      {
        id: "collect-reason",
        type: "conversation",
        name: "Collect Reason",
        instruction: { type: "prompt", text: TASK_REASON },
        edges: [
          { id: "edge-2a", destination_node_id: "emergency-flag", transition_condition: { type: "prompt", prompt: "If urgent or emergency, e.g. flooding, no heat, gas smell, burst pipe, no power, sparks" } },
          { id: "edge-2b", destination_node_id: "collect-city", transition_condition: { type: "prompt", prompt: TRANSITION_REASON_CLEAR } },
        ],
      },
      {
        id: "emergency-flag",
        type: "conversation",
        name: "Emergency Detected",
        instruction: { type: "prompt", text: TASK_URGENCY },
        edges: [{ id: "edge-3", destination_node_id: "collect-city", transition_condition: { type: "prompt", prompt: "Always" } }],
      },
      {
        id: "collect-city",
        type: "conversation",
        name: "Collect City",
        instruction: { type: "prompt", text: TASK_CITY },
        edges: [{ id: "edge-4", destination_node_id: "verify-city", transition_condition: { type: "prompt", prompt: "Caller provided city" } }],
      },
      {
        id: "verify-city",
        type: "conversation",
        name: "City Verified",
        instruction: { type: "prompt", text: TASK_VERIFY_AREA(areas) },
        edges: [
          { id: "edge-5a", destination_node_id: "collect-address", transition_condition: { type: "prompt", prompt: "if city IS supported" } },
          { id: "edge-5b", destination_node_id: "not-supported", transition_condition: { type: "prompt", prompt: "if city IS NOT supported" } },
        ],
      },
      {
        id: "collect-address",
        type: "conversation",
        name: "Ask Address",
        instruction: { type: "prompt", text: TASK_ADDRESS },
        edges: [{ id: "edge-6", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: "If address is provided" } }],
      },
      {
        id: "collect-phone",
        type: "conversation",
        name: "Collect Phone",
        instruction: { type: "prompt", text: TASK_PHONE },
        edges: [{ id: "edge-6b", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: TRANSITION_PHONE_PROVIDED } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Confirm Details",
        instruction: { type: "prompt", text: TASK_CONFIRM },
        edges: [{ id: "edge-7", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: TRANSITION_CONFIRM_DONE } }],
      },
      {
        id: "not-supported",
        type: "conversation",
        name: "Not supported",
        instruction: { type: "prompt", text: TASK_NOT_SUPPORTED },
        edges: [{ id: "edge-11", destination_node_id: "end-call-not-supported", transition_condition: { type: "prompt", prompt: "Always" } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: TASK_END },
      },
      {
        id: "end-call-not-supported",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: TASK_END },
      },
    ],
  }
}

/** AUTO_REPAIR: name, phone, vehicle (year/make/model), reason — no address or service area */
function buildAutoRepairFlow(businessName: string): any {
  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome Node",
        instruction: { type: "prompt", text: TASK_GREET },
        edges: [{ id: "edge-1", destination_node_id: "collect-reason", transition_condition: { type: "prompt", prompt: TRANSITION_NAME_PROVIDED } }],
        start_speaker: "agent",
      },
      {
        id: "collect-reason",
        type: "conversation",
        name: "Reason for Call",
        instruction: { type: "prompt", text: TASK_REASON_AUTO },
        edges: [
          { id: "edge-2a", destination_node_id: "collect-vehicle", transition_condition: { type: "prompt", prompt: "If new issue, maintenance, or scheduling" } },
          { id: "edge-2b", destination_node_id: "collect-dropoff", transition_condition: { type: "prompt", prompt: "If checking on existing repair or status" } },
        ],
      },
      {
        id: "collect-vehicle",
        type: "conversation",
        name: "Vehicle Info",
        instruction: { type: "prompt", text: TASK_VEHICLE },
        edges: [
          { id: "edge-3a", destination_node_id: "collect-appointment-pref", transition_condition: { type: "prompt", prompt: "If scheduling or appointment" } },
          { id: "edge-3b", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: "If not scheduling" } },
        ],
      },
      {
        id: "collect-dropoff",
        type: "conversation",
        name: "When Dropped Off",
        instruction: { type: "prompt", text: TASK_DROPOFF },
        edges: [{ id: "edge-4", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: "Caller provided date or time" } }],
      },
      {
        id: "collect-phone",
        type: "conversation",
        name: "Collect Phone",
        instruction: { type: "prompt", text: TASK_PHONE },
        edges: [{ id: "edge-5", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: TRANSITION_PHONE_PROVIDED } }],
      },
      {
        id: "collect-appointment-pref",
        type: "conversation",
        name: "Appointment Preference",
        instruction: { type: "prompt", text: TASK_APPOINTMENT },
        edges: [{ id: "edge-6", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: "Caller provided preference or said no preference" } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Confirm Details",
        instruction: { type: "prompt", text: TASK_CONFIRM },
        edges: [{ id: "edge-7", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: TRANSITION_CONFIRM_DONE } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: TASK_END },
      },
    ],
  }
}

/** CHILDCARE: parent name, contact, child age, type of care, tour preference if applicable */
function buildChildcareFlow(businessName: string): any {
  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome Node",
        instruction: { type: "prompt", text: TASK_GREET },
        edges: [{ id: "edge-1", destination_node_id: "collect-reason", transition_condition: { type: "prompt", prompt: TRANSITION_NAME_PROVIDED } }],
        start_speaker: "agent",
      },
      {
        id: "collect-reason",
        type: "conversation",
        name: "Call Reason",
        instruction: { type: "prompt", text: TASK_CHILD_REASON },
        edges: [{ id: "edge-2", destination_node_id: "collect-child-age", transition_condition: { type: "prompt", prompt: "Caller described reason" } }],
      },
      {
        id: "collect-child-age",
        type: "conversation",
        name: "Child Age",
        instruction: { type: "prompt", text: TASK_CHILD_AGE },
        edges: [{ id: "edge-3", destination_node_id: "collect-care-type", transition_condition: { type: "prompt", prompt: "Caller provided age or range" } }],
      },
      {
        id: "collect-care-type",
        type: "conversation",
        name: "Type of Care",
        instruction: { type: "prompt", text: TASK_CHILD_CARE },
        edges: [
          { id: "edge-4a", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: "If not requesting a tour" } },
          { id: "edge-4b", destination_node_id: "collect-tour-pref", transition_condition: { type: "prompt", prompt: "If requesting a tour or visit" } },
        ],
      },
      {
        id: "collect-tour-pref",
        type: "conversation",
        name: "Tour Preference",
        instruction: { type: "prompt", text: TASK_CHILD_TOUR },
        edges: [{ id: "edge-5", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: "Caller provided preference or said no preference" } }],
      },
      {
        id: "collect-phone",
        type: "conversation",
        name: "Collect Phone",
        instruction: { type: "prompt", text: TASK_PHONE },
        edges: [{ id: "edge-6", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: TRANSITION_PHONE_PROVIDED } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Confirm Details",
        instruction: { type: "prompt", text: TASK_CONFIRM },
        edges: [{ id: "edge-7", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: TRANSITION_CONFIRM_DONE } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: TASK_END },
      },
    ],
  }
}

/** GENERIC: minimal — name, reason for call, contact, confirm */
function buildGenericFlow(businessName: string): any {
  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome Node",
        instruction: { type: "prompt", text: TASK_GREET },
        edges: [{ id: "edge-1", destination_node_id: "collect-reason", transition_condition: { type: "prompt", prompt: TRANSITION_NAME_PROVIDED } }],
        start_speaker: "agent",
      },
      {
        id: "collect-reason",
        type: "conversation",
        name: "Collect Reason",
        instruction: { type: "prompt", text: TASK_REASON },
        edges: [{ id: "edge-2", destination_node_id: "collect-contact", transition_condition: { type: "prompt", prompt: TRANSITION_REASON_CLEAR } }],
      },
      {
        id: "collect-contact",
        type: "conversation",
        name: "Contact Info",
        instruction: { type: "prompt", text: TASK_PHONE },
        edges: [{ id: "edge-3", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: TRANSITION_PHONE_PROVIDED } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Confirm Details",
        instruction: { type: "prompt", text: TASK_CONFIRM },
        edges: [{ id: "edge-4", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: TRANSITION_CONFIRM_DONE } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: TASK_END },
      },
    ],
  }
}

/** Extract-dynamic-variable tool so demo call populates name, phone, address, reason, vehicle, appointment in webhook. */
const DEMO_EXTRACT_LEAD_TOOL = {
  type: "extract_dynamic_variable" as const,
  name: "store_lead_details",
  description:
    "Call when you have gathered caller name, phone, reason for call, and any address/city, vehicle (year/make/model), or appointment preference. Stores all fields for the lead summary.",
  variables: [
    { type: "string" as const, name: "name", description: "Caller's full name" },
    { type: "string" as const, name: "phone", description: "Best callback phone number" },
    { type: "string" as const, name: "address", description: "Street or service address if provided" },
    { type: "string" as const, name: "city", description: "City if provided" },
    { type: "string" as const, name: "issue_description", description: "Reason for call or issue/service needed" },
    { type: "string" as const, name: "vehicle_year", description: "Vehicle year if auto-related" },
    { type: "string" as const, name: "vehicle_make", description: "Vehicle make if auto-related" },
    { type: "string" as const, name: "vehicle_model", description: "Vehicle model if auto-related" },
    { type: "string" as const, name: "appointment_preference", description: "Preferred day or time for appointment if mentioned" },
  ],
}

/** Demo line: name → reason → phone → confirm (save + recap once) → end. */
function buildDemoConversationFlow(): any {
  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome Node",
        instruction: { type: "prompt", text: TASK_GREET_DEMO },
        edges: [{ id: "edge-1", destination_node_id: "collect-reason", transition_condition: { type: "prompt", prompt: TRANSITION_NAME_PROVIDED } }],
        start_speaker: "agent",
      },
      {
        id: "collect-reason",
        type: "conversation",
        name: "Collect Reason",
        instruction: { type: "prompt", text: TASK_REASON_DEMO },
        edges: [{ id: "edge-2", destination_node_id: "collect-phone", transition_condition: { type: "prompt", prompt: TRANSITION_REASON_CLEAR } }],
      },
      {
        id: "collect-phone",
        type: "conversation",
        name: "Collect Phone",
        instruction: { type: "prompt", text: TASK_PHONE },
        edges: [{ id: "edge-3", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: TRANSITION_PHONE_PROVIDED } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Confirm Details",
        instruction: { type: "prompt", text: TASK_CONFIRM_DEMO },
        tools: [DEMO_EXTRACT_LEAD_TOOL],
        edges: [{ id: "edge-4", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: TRANSITION_CONFIRM_DONE } }],
        else_edge: {
          id: "edge-4-else",
          destination_node_id: "end-call",
          transition_condition: { type: "prompt", prompt: "Else" },
        },
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: TASK_END },
      },
    ],
  }
}

// ─── Template agents (for API setup with {{variable}} formatting) ─────────────────────────────

/**
 * Build a conversation flow whose prompts use {{business_name}}, {{Name}}, etc.
 * Used when creating agents via API so each inbound call gets values from the webhook dynamic_variables.
 */
export function buildTemplateConversationFlow(industry: Industry): {
  start_node_id: string
  start_speaker: "agent"
  nodes: any[]
} {
  const placeholder = "{{business_name}}"
  switch (industry) {
    case Industry.AUTO_REPAIR:
      return buildTemplateFlowFromExisting(buildAutoRepairFlow(placeholder))
    case Industry.CHILDCARE:
      return buildTemplateFlowFromExisting(buildChildcareFlow(placeholder))
    case Industry.GENERIC:
      return buildTemplateFlowFromExisting(buildGenericFlow(placeholder))
    case Industry.HVAC:
    case Industry.PLUMBING:
    case Industry.ELECTRICIAN:
    case Industry.HANDYMAN:
    default:
      return buildTemplateFlowFromExisting(buildPropertyServiceFlow(placeholder, ["{{service_areas}}"]))
  }
}

function buildTemplateFlowFromExisting(flow: { start_node_id: string; start_speaker: string; nodes: any[] }) {
  return {
    start_node_id: flow.start_node_id,
    start_speaker: flow.start_speaker as "agent",
    nodes: flow.nodes,
  }
}

/**
 * Create one Retell conversation flow + agent for an industry using the template global prompt
 * and flow nodes that use {{business_name}}, {{tone}}, etc. Set the returned agent_id in env
 * (e.g. RETELL_AGENT_ID or RETELL_AGENT_ID_HVAC).
 */
export async function createTemplateAgentForIndustry(
  apiKey: string,
  industry: Industry,
  options?: { agentName?: string; voiceId?: string }
): Promise<{ agent_id: string; conversation_flow_id: string; version: number }> {
  const flow = buildTemplateConversationFlow(industry)
  const { conversation_flow_id, version } = await createConversationFlow(apiKey, {
    ...flow,
    global_prompt: buildTemplateGlobalPrompt(industry),
  })

  const agentName = options?.agentName ?? `CallGrabbr ${industry}`
  const voiceId = options?.voiceId ?? DEFAULT_RETELL_VOICE.voice_id
  const voiceConfig = { ...DEFAULT_RETELL_VOICE, voice_id: voiceId }

  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      agent_name: agentName,
      language: "en-US",
      ...receptionistAgentFields(voiceConfig),
      response_engine: {
        type: "conversation-flow",
        conversation_flow_id,
        version: version ?? 0,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Retell create-agent failed: ${err}`)
  }

  const result = await response.json()
  return {
    agent_id: result.agent_id,
    conversation_flow_id,
    version: result.response_engine?.version ?? version ?? 0,
  }
}

/**
 * Create the dedicated demo agent + flow and attach a phone number.
 * Use scripts/setup-demo-agent.ts to run. Set RETELL_DEMO_PHONE to attach an existing number.
 */
export async function createDemoRetellAgent(): Promise<{ agent_id: string; phone_number: string | null }> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY is not configured")

  const globalPrompt = buildDemoGlobalPrompt()
  const flow = buildDemoConversationFlow()
  const { conversation_flow_id, version } = await createConversationFlow(apiKey, {
    ...flow,
    global_prompt: globalPrompt,
  })

  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      agent_name: "CallGrabbr Demo",
      language: "en-US",
      ...receptionistAgentFields(DEFAULT_RETELL_VOICE),
      response_engine: {
        type: "conversation-flow",
        conversation_flow_id,
        version: version ?? 0,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to create demo agent (${response.status}): ${err}`)
  }
  const result = await response.json()
  const agent_id = result.agent_id

  let phone_number: string | null = null
  const existingDemoPhone = process.env.RETELL_DEMO_PHONE ?? null
  const areaCode = process.env.RETELL_DEFAULT_AREA_CODE ? parseInt(process.env.RETELL_DEFAULT_AREA_CODE, 10) : 415

  if (existingDemoPhone) {
    try {
      await updatePhoneNumber(apiKey, existingDemoPhone, agent_id)
      phone_number = existingDemoPhone
    } catch (err) {
      console.error("Failed to attach RETELL_DEMO_PHONE to demo agent:", err)
    }
  }
  if (!phone_number) {
    try {
      phone_number = await createPhoneNumber(apiKey, agent_id, areaCode)
    } catch (err) {
      console.error("Failed to create phone for demo agent:", err)
    }
  }

  return { agent_id, phone_number }
}

/** Attach a phone number to an existing demo agent. Use when createDemoRetellAgent couldn't get a number. */
export async function attachPhoneToDemoAgent(agentId: string): Promise<string | null> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY is not configured")

  const existingPhone = process.env.RETELL_DEMO_PHONE ?? null
  if (existingPhone) {
    await updatePhoneNumber(apiKey, existingPhone, agentId)
    return existingPhone
  }

  const areaCodesToTry = [202, 312, 646, 702, 404, 305]
  for (const ac of areaCodesToTry) {
    try {
      const num = await createPhoneNumber(apiKey, agentId, ac)
      return num
    } catch {
      continue
    }
  }
  return null
}

/**
 * Update the existing demo agent's conversation flow (e.g. after adding extract_dynamic_variable tool).
 * Requires RETELL_API_KEY and RETELL_DEMO_AGENT_ID. Run: npx tsx scripts/update-demo-flow.ts
 */
export async function updateDemoAgentFlow(): Promise<void> {
  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.RETELL_DEMO_AGENT_ID
  if (!apiKey || !agentId) throw new Error("RETELL_API_KEY and RETELL_DEMO_AGENT_ID required")

  const agent = await getAgent(apiKey, agentId)
  const flowId = agent.response_engine?.type === "conversation-flow" && agent.response_engine?.conversation_flow_id
  if (!flowId) throw new Error("Demo agent has no conversation flow")

  const flow = buildDemoConversationFlow()
  const globalPrompt = buildDemoGlobalPrompt()
  const { version } = await updateConversationFlow(apiKey, flowId, { ...flow, global_prompt: globalPrompt })

  await updateAgent(apiKey, agentId, {
    ...receptionistAgentFields(DEFAULT_RETELL_VOICE),
    response_engine: { type: "conversation-flow", conversation_flow_id: flowId, version },
  })
  console.info("Demo agent flow updated to version", version)
}

function getStevePersonalGlobalPrompt(): string {
  return buildSteveGlobalPrompt()
}

/**
 * Create Steve's personal missed-call agent + flow. Run scripts/setup-steve-agent.ts.
 * Set RETELL_STEVE_PHONE to attach an existing Retell number.
 */
export async function createStevePersonalRetellAgent(): Promise<{ agent_id: string; phone_number: string | null }> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error("RETELL_API_KEY is not configured")

  const globalPrompt = getStevePersonalGlobalPrompt()
  const flow = buildStevePersonalConversationFlow()
  const { conversation_flow_id, version } = await createConversationFlow(apiKey, {
    ...flow,
    global_prompt: globalPrompt,
  })

  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      agent_name: STEVE_PERSONAL_AGENT_CONFIG.retellAgentName,
      language: "en-US",
      ...receptionistAgentFields(DEFAULT_RETELL_VOICE),
      response_engine: {
        type: "conversation-flow",
        conversation_flow_id,
        version: version ?? 0,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Failed to create Steve personal agent (${response.status}): ${err}`)
  }
  const result = await response.json()
  const agent_id = result.agent_id

  let phone_number: string | null = null
  const existingPhone = process.env.RETELL_STEVE_PHONE ?? null
  const areaCode = process.env.RETELL_DEFAULT_AREA_CODE ? parseInt(process.env.RETELL_DEFAULT_AREA_CODE, 10) : 608

  if (existingPhone) {
    try {
      await updatePhoneNumber(apiKey, existingPhone, agent_id)
      phone_number = existingPhone
    } catch (err) {
      console.error("Failed to attach RETELL_STEVE_PHONE:", err)
    }
  }
  if (!phone_number) {
    try {
      phone_number = await createPhoneNumber(apiKey, agent_id, areaCode)
    } catch (err) {
      console.error("Failed to create phone for Steve personal agent:", err)
    }
  }

  return { agent_id, phone_number }
}

/**
 * Update Steve personal agent flow. Requires RETELL_API_KEY and RETELL_STEVE_AGENT_ID.
 * Run: npx tsx scripts/update-steve-flow.ts
 */
export async function updateStevePersonalAgentFlow(): Promise<void> {
  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.RETELL_STEVE_AGENT_ID
  if (!apiKey || !agentId) throw new Error("RETELL_API_KEY and RETELL_STEVE_AGENT_ID required")

  const agent = await getAgent(apiKey, agentId)
  const flowId = agent.response_engine?.type === "conversation-flow" && agent.response_engine?.conversation_flow_id
  if (!flowId) throw new Error("Steve personal agent has no conversation flow")

  const flow = buildStevePersonalConversationFlow()
  const globalPrompt = getStevePersonalGlobalPrompt()
  const { version } = await updateConversationFlow(apiKey, flowId, { ...flow, global_prompt: globalPrompt })

  await updateAgent(apiKey, agentId, {
    ...receptionistAgentFields(DEFAULT_RETELL_VOICE),
    response_engine: { type: "conversation-flow", conversation_flow_id: flowId, version },
  })
  console.info("Steve personal agent flow updated to version", version)
}

type TemplateAgentEntry = {
  agent_id: string
  conversation_flow_id: string
  version?: number
}

/** Update one industry template agent's flow and voice (used by sync script). */
export async function updateTemplateAgentForIndustry(
  apiKey: string,
  industry: Industry,
  entry: TemplateAgentEntry
): Promise<{ version: number }> {
  const flow = buildTemplateConversationFlow(industry)
  const { version } = await updateConversationFlow(apiKey, entry.conversation_flow_id, {
    ...flow,
    global_prompt: buildTemplateGlobalPrompt(industry),
  })
  await updateAgent(apiKey, entry.agent_id, {
    ...receptionistAgentFields(DEFAULT_RETELL_VOICE),
    response_engine: {
      type: "conversation-flow",
      conversation_flow_id: entry.conversation_flow_id,
      version,
    },
  })
  return { version }
}
