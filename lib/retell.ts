import { Industry, PlanType } from "@prisma/client"
import { db } from "./db"
import { generatePrompt, BusinessHoursInput } from "./prompts"
import {
  hasAppointmentCapture,
  hasBrandedVoice,
  hasMultiDepartment,
} from "./plans"
import { RETELL_GLOBAL_PROMPT_TEMPLATE } from "./retell-agent-template"

const RETELL_API_BASE = process.env.RETELL_API_BASE ?? "https://api.retellai.com"

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

  // Local Plus: use a distinct "branded" voice; others use default
  const voiceId = data.planType && hasBrandedVoice(data.planType) ? "11labs-Adam" : "11labs-Chloe"

  const agentPayload = {
    agent_name: data.businessName,
    language: "en-US" as const,
    voice_id: voiceId,
    voice_temperature: 0.98,
    voice_speed: 0.98,
    volume: 0.94,
    max_call_duration_ms: 3600000, // 1 hour
    interruption_sensitivity: 0.9,
    response_engine: {
      type: "conversation-flow" as const,
      conversation_flow_id,
      version: version ?? 0,
    },
  }

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
    throw new Error(`Failed to create Retell agent: ${error}`)
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

  const voiceId =
    data.planType && hasBrandedVoice(data.planType) ? "11labs-Adam" : "11labs-Chloe"
  const agentPayload = {
    agent_name: name,
    language: "en-US" as const,
    voice_id: voiceId,
    voice_temperature: 0.98,
    voice_speed: 0.98,
    volume: 0.94,
    max_call_duration_ms: 3600000,
    interruption_sensitivity: 0.9,
    response_engine: {
      type: "conversation-flow" as const,
      conversation_flow_id,
      version: version ?? 0,
    },
  }

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
    throw new Error(`Failed to create Retell agent: ${error}`)
  }

  const result = await response.json()
  return result.agent_id
}

/**
 * Create a dedicated Retell agent for the business and assign a phone number (recycled or new).
 * Use this in onboarding so each business gets a unique agent and number.
 * Returns { agent_id, phone_number } or null if provisioning fails.
 */
export async function provisionAgentAndNumberForBusiness(
  business: BusinessForProvisioning,
  areaCode?: number
): Promise<{ agent_id: string; phone_number: string } | null> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    console.error("provisionAgentAndNumberForBusiness: RETELL_API_KEY not configured")
    return null
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

  let agent_id: string
  try {
    agent_id = await createRetellAgentOnly(request)
  } catch (err) {
    console.error("provisionAgentAndNumberForBusiness: createRetellAgentOnly failed:", err)
    return null
  }

  const effectiveAreaCode =
    areaCode ?? (process.env.RETELL_DEFAULT_AREA_CODE ? parseInt(process.env.RETELL_DEFAULT_AREA_CODE, 10) : 415)

  // Prefer recycled number; otherwise purchase a new one
  const recycled = await db.recycledRetellNumber.findFirst({
    orderBy: { releasedAt: "asc" },
  })

  let phone_number: string
  if (recycled) {
    await db.recycledRetellNumber.delete({ where: { id: recycled.id } })
    try {
      await updatePhoneNumber(apiKey, recycled.phoneNumber, agent_id)
      phone_number = recycled.phoneNumber
      console.info("Reused recycled Retell number for new agent:", phone_number, "agent:", agent_id)
    } catch (err) {
      console.error("Failed to attach recycled number to new agent, re-adding to pool:", err)
      await db.recycledRetellNumber.create({
        data: { phoneNumber: recycled.phoneNumber },
      })
      try {
        phone_number = await createPhoneNumber(apiKey, agent_id, effectiveAreaCode)
      } catch (createErr) {
        console.error("createPhoneNumber fallback failed:", createErr)
        return null
      }
    }
  } else {
    try {
      phone_number = await createPhoneNumber(apiKey, agent_id, effectiveAreaCode)
      console.info("Provisioned new Retell number for business agent:", phone_number, "agent:", agent_id)
    } catch (err) {
      console.error("provisionAgentAndNumberForBusiness: createPhoneNumber failed:", err)
      return null
    }
  }

  return { agent_id, phone_number }
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
  const body: Record<string, unknown> = {
    inbound_agent_id: agentId,
    outbound_agent_id: agentId,
    area_code: areaCode,
    country_code: "US",
  }

  // Try v2 then non-versioned (Retell may use api.retellai.com/v2 for phone number)
  const bases = ["https://api.retellai.com/v2", RETELL_API_BASE]
  const seen = new Set<string>()
  let lastError: string | null = null

  for (const base of bases) {
    const url = `${base}/create-phone-number`
    if (seen.has(url)) continue
    seen.add(url)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
    const text = await response.text()
    if (response.ok) {
      try {
        const result = JSON.parse(text) as { phone_number?: string }
        if (result.phone_number) return result.phone_number
      } catch {
        // ignore parse error
      }
      lastError = "Response missing phone_number"
      continue
    }
    lastError = text || `HTTP ${response.status}`
  }

  throw new Error(`Failed to create Retell phone number: ${lastError}`)
}

/** Attach an already-purchased Retell phone number to an agent via PATCH update-phone-number. */
async function updatePhoneNumber(
  apiKey: string,
  phoneNumber: string,
  agentId: string
): Promise<void> {
  const body = {
    inbound_agent_id: agentId,
    outbound_agent_id: agentId,
  }
  const encoded = encodeURIComponent(phoneNumber)
  const bases = ["https://api.retellai.com/v2", RETELL_API_BASE]
  let lastError: string | null = null

  for (const base of bases) {
    const url = `${base}/update-phone-number/${encoded}`
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
    if (response.ok) return
    lastError = await response.text()
  }

  throw new Error(`Failed to update Retell phone number: ${lastError}`)
}

/** Create a conversation flow via Retell API; returns conversation_flow_id and version for use in create-agent. */
async function createConversationFlow(
  apiKey: string,
  flow: { nodes: any[]; start_node_id: string; start_speaker: string; global_prompt?: string }
): Promise<{ conversation_flow_id: string; version: number }> {
  const body = {
    model_choice: { model: "gpt-4.1", type: "cascading" },
    nodes: flow.nodes,
    start_speaker: flow.start_speaker as "agent",
    start_node_id: flow.start_node_id,
    global_prompt: flow.global_prompt ?? undefined,
  }

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
    throw new Error(`Failed to create Retell conversation flow: ${error}`)
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
    model_choice: { model: "gpt-4.1", type: "cascading" },
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

/** PATCH agent (agent_name, voice_*, response_engine). */
async function updateAgent(
  apiKey: string,
  agentId: string,
  payload: {
    agent_name?: string
    voice_id?: string
    voice_temperature?: number
    voice_speed?: number
    volume?: number
    response_engine?: { type: "conversation-flow"; conversation_flow_id: string; version: number }
  }
): Promise<void> {
  const response = await fetch(`${RETELL_API_BASE}/update-agent/${agentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update Retell agent: ${error}`)
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

/** Settings passed from dashboard (greeting, tone, question depth) used to personalize the synced agent. */
export type SyncSettings = {
  greeting?: { customGreeting?: string | null; tone?: string }
  questionDepth?: string
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
      departments: business.departments?.length ? business.departments : undefined,
      afterHoursEmergencyPhone: business.afterHoursEmergencyPhone ?? undefined,
      includeAppointmentCapture: hasAppointmentCapture(effectivePlan),
    }
  )
  if (settings?.greeting?.tone || settings?.questionDepth) {
    const parts: string[] = []
    if (settings.greeting?.tone) parts.push(`Use a ${settings.greeting.tone} tone.`)
    if (settings.questionDepth) parts.push(`Question depth: ${settings.questionDepth}.`)
    if (parts.length) globalPrompt = globalPrompt + "\n\n" + parts.join(" ")
  }

  let flow = buildConversationFlow(business.name, business.industry, business.serviceAreas)
  const customGreeting = settings?.greeting?.customGreeting?.trim()
  if (customGreeting) {
    const startText = customGreeting.replace(/\[business\]/gi, business.name).trimEnd() + "\n"
    const startNodeId = flow.start_node_id
    const node = flow.nodes?.find((n: { id: string }) => n.id === startNodeId)
    if (node?.instruction?.type === "static_text") {
      node.instruction = { type: "static_text", text: startText }
    }
  }

  const { version } = await updateConversationFlow(apiKey, flowId, {
    ...flow,
    global_prompt: globalPrompt,
  })

  const voiceId = hasBrandedVoice(effectivePlan) ? "11labs-Adam" : "11labs-Chloe"
  const vs = business.voiceSettings as { speed?: number; temperature?: number; volume?: number } | null | undefined
  const voiceSpeed =
    vs != null && typeof vs.speed === "number"
      ? Math.max(0.5, Math.min(2, 0.5 + vs.speed * 1.5))
      : 0.98
  const voiceTemp =
    vs != null && typeof vs.temperature === "number"
      ? Math.max(0, Math.min(2, vs.temperature * 2))
      : 0.98
  const voiceVol =
    vs != null && typeof vs.volume === "number"
      ? Math.max(0, Math.min(2, vs.volume * 2))
      : 0.94

  await updateAgent(apiKey, business.retellAgentId, {
    agent_name: business.name,
    voice_id: voiceId,
    voice_temperature: voiceTemp,
    voice_speed: voiceSpeed,
    volume: voiceVol,
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

/** HVAC, PLUMBING, ELECTRICIAN: property + service area + address + issue + emergency path */
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
        instruction: { type: "static_text", text: `Thanks for calling ${businessName}! This is our virtual assistant. Who am I speaking with today?\n` },
        edges: [{ id: "edge-1", destination_node_id: "collect-name", transition_condition: { type: "prompt", prompt: "User provided name" } }],
        start_speaker: "agent",
      },
      {
        id: "collect-name",
        type: "conversation",
        name: "Collect Name",
        instruction: { type: "prompt", text: `Thank you {{Name}}! Could you please provide the city where the property needing service is located?\n` },
        edges: [{ id: "edge-2", destination_node_id: "verify-city", transition_condition: { type: "prompt", prompt: "User provided city" } }],
      },
      {
        id: "verify-city",
        type: "conversation",
        name: "City Verified",
        instruction: { type: "prompt", text: `Confirm the city with the caller. Verify it is one of our service areas: ${areas}. Do not read the list to the caller.\n` },
        edges: [
          { id: "edge-3", destination_node_id: "collect-address", transition_condition: { type: "prompt", prompt: "if city IS supported" } },
          { id: "edge-4", destination_node_id: "not-supported", transition_condition: { type: "prompt", prompt: "if city IS NOT supported" } },
        ],
      },
      {
        id: "collect-address",
        type: "conversation",
        name: "Ask Address",
        instruction: { type: "prompt", text: `Great, we do service {{city}}. What is the full address of the property needing service?` },
        edges: [{ id: "edge-5", destination_node_id: "collect-issue", transition_condition: { type: "prompt", prompt: "If address is provided" } }],
      },
      {
        id: "collect-issue",
        type: "conversation",
        name: "Ask Issue Details",
        instruction: { type: "prompt", text: `Please describe the issue in as much detail as you can.` },
        edges: [
          { id: "edge-6", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "If user is done" } },
          { id: "edge-7", destination_node_id: "emergency-flag", transition_condition: { type: "prompt", prompt: "If urgent or emergency, e.g. flooding, no heat, gas smell, burst pipe, no power, sparks" } },
        ],
      },
      {
        id: "emergency-flag",
        type: "conversation",
        name: "Emergency Detected",
        instruction: { type: "prompt", text: `This sounds urgent. I'll make sure it's flagged as a priority.` },
        edges: [{ id: "edge-8", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "Always" } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Recite Issue",
        instruction: { type: "prompt", text: `Repeat back the information gathered. Ask if it is correct.` },
        edges: [{ id: "edge-9", destination_node_id: "phone-confirm", transition_condition: { type: "prompt", prompt: "if user agrees that information recited is correct" } }],
      },
      {
        id: "phone-confirm",
        type: "conversation",
        name: "Phone Confirm",
        instruction: { type: "prompt", text: `Is the best number to reach you the one you're calling from?` },
        edges: [
          { id: "edge-10", destination_node_id: "final-assistant", transition_condition: { type: "prompt", prompt: "if confirmed" } },
          { id: "edge-11", destination_node_id: "ask-number", transition_condition: { type: "prompt", prompt: "if NOT confirmed" } },
        ],
      },
      {
        id: "ask-number",
        type: "conversation",
        name: "Ask number",
        instruction: { type: "prompt", text: `What is the best phone number to reach you?` },
        edges: [{ id: "edge-12", destination_node_id: "final-assistant", transition_condition: { type: "prompt", prompt: "user provides number" } }],
      },
      {
        id: "final-assistant",
        type: "conversation",
        name: "Final Assistant",
        instruction: { type: "prompt", text: `Is there anything else I can help you with today?` },
        edges: [{ id: "edge-13", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: "If conversation is complete" } }],
      },
      {
        id: "not-supported",
        type: "conversation",
        name: "Not supported",
        instruction: { type: "prompt", text: `Apologize and say we don't currently provide services in {{city}}. Do not offer future services.` },
        edges: [{ id: "edge-14", destination_node_id: "end-call-not-supported", transition_condition: { type: "prompt", prompt: "Always" } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: `Thanks {{Name}}. A team member will reach out shortly about your request. Thank you for calling ${businessName}. Have a great day!` },
      },
      {
        id: "end-call-not-supported",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: `Politely end the call` },
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
        instruction: { type: "static_text", text: `Thanks for calling ${businessName}! Who am I speaking with today?\n` },
        edges: [{ id: "edge-1", destination_node_id: "collect-name", transition_condition: { type: "prompt", prompt: "User provided name" } }],
        start_speaker: "agent",
      },
      {
        id: "collect-name",
        type: "conversation",
        name: "Collect Name",
        instruction: { type: "prompt", text: `Thanks {{Name}}. What's the best phone number to reach you?` },
        edges: [{ id: "edge-2", destination_node_id: "collect-vehicle", transition_condition: { type: "prompt", prompt: "User provided phone number" } }],
      },
      {
        id: "collect-vehicle",
        type: "conversation",
        name: "Vehicle Info",
        instruction: { type: "prompt", text: `What vehicle are you calling about? Please give the year, make, and model.` },
        edges: [{ id: "edge-3", destination_node_id: "collect-reason", transition_condition: { type: "prompt", prompt: "User provided vehicle year, make, or model" } }],
      },
      {
        id: "collect-reason",
        type: "conversation",
        name: "Reason for Call",
        instruction: { type: "prompt", text: `What can we help you with today — a new issue, maintenance, checking on an existing repair, or scheduling?` },
        edges: [
          { id: "edge-4a", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "If new issue or maintenance" } },
          { id: "edge-4b", destination_node_id: "collect-dropoff", transition_condition: { type: "prompt", prompt: "If checking on existing repair or status" } },
          { id: "edge-4c", destination_node_id: "collect-appointment-pref", transition_condition: { type: "prompt", prompt: "If scheduling or appointment" } },
        ],
      },
      {
        id: "collect-dropoff",
        type: "conversation",
        name: "When Dropped Off",
        instruction: { type: "prompt", text: `When did you drop the vehicle off?` },
        edges: [{ id: "edge-5", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "User provided date or time" } }],
      },
      {
        id: "collect-appointment-pref",
        type: "conversation",
        name: "Appointment Preference",
        instruction: { type: "prompt", text: `Do you have preferred days or times for an appointment?` },
        edges: [{ id: "edge-6", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "User provided preference or said no preference" } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Recite Details",
        instruction: { type: "prompt", text: `Repeat back the information gathered. Ask if it is correct.` },
        edges: [{ id: "edge-7", destination_node_id: "final-assistant", transition_condition: { type: "prompt", prompt: "if user agrees" } }],
      },
      {
        id: "final-assistant",
        type: "conversation",
        name: "Final Assistant",
        instruction: { type: "prompt", text: `Anything else we should know?` },
        edges: [{ id: "edge-8", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: "If conversation is complete" } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: `Thanks {{Name}}. We'll be in touch about your vehicle. Thank you for calling ${businessName}.` },
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
        instruction: { type: "static_text", text: `Thanks for calling ${businessName}! Who am I speaking with today?\n` },
        edges: [{ id: "edge-1", destination_node_id: "collect-name", transition_condition: { type: "prompt", prompt: "User provided name" } }],
        start_speaker: "agent",
      },
      {
        id: "collect-name",
        type: "conversation",
        name: "Collect Name",
        instruction: { type: "prompt", text: `Thanks. What's the best phone number to reach you?` },
        edges: [{ id: "edge-2", destination_node_id: "collect-child-age", transition_condition: { type: "prompt", prompt: "User provided phone number" } }],
      },
      {
        id: "collect-child-age",
        type: "conversation",
        name: "Child Age",
        instruction: { type: "prompt", text: `How old is your child, or what age range are you looking for care for?` },
        edges: [{ id: "edge-3", destination_node_id: "collect-care-type", transition_condition: { type: "prompt", prompt: "User provided age or range" } }],
      },
      {
        id: "collect-care-type",
        type: "conversation",
        name: "Type of Care",
        instruction: { type: "prompt", text: `What type of care are you looking for — full-time, part-time, drop-in, or something else?` },
        edges: [
          { id: "edge-4a", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "If not requesting a tour" } },
          { id: "edge-4b", destination_node_id: "collect-tour-pref", transition_condition: { type: "prompt", prompt: "If requesting a tour or visit" } },
        ],
      },
      {
        id: "collect-tour-pref",
        type: "conversation",
        name: "Tour Preference",
        instruction: { type: "prompt", text: `Do you have preferred days or times for a tour?` },
        edges: [{ id: "edge-5", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "User provided preference or said no preference" } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Recite Details",
        instruction: { type: "prompt", text: `Repeat back the information gathered. Ask if it is correct.` },
        edges: [{ id: "edge-6", destination_node_id: "final-assistant", transition_condition: { type: "prompt", prompt: "if user agrees" } }],
      },
      {
        id: "final-assistant",
        type: "conversation",
        name: "Final Assistant",
        instruction: { type: "prompt", text: `Anything else we should know?` },
        edges: [{ id: "edge-7", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: "If conversation is complete" } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: `Thanks {{Name}}. We'll be in touch. Thank you for calling ${businessName}.` },
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
        instruction: { type: "static_text", text: `Thanks for calling ${businessName}! Who am I speaking with today?\n` },
        edges: [{ id: "edge-1", destination_node_id: "collect-name", transition_condition: { type: "prompt", prompt: "User provided name" } }],
        start_speaker: "agent",
      },
      {
        id: "collect-name",
        type: "conversation",
        name: "Collect Name",
        instruction: { type: "prompt", text: `Thanks {{Name}}. What can we help you with today?` },
        edges: [{ id: "edge-2", destination_node_id: "collect-contact", transition_condition: { type: "prompt", prompt: "User described reason for calling" } }],
      },
      {
        id: "collect-contact",
        type: "conversation",
        name: "Contact Info",
        instruction: { type: "prompt", text: `What's the best phone number to reach you?` },
        edges: [{ id: "edge-3", destination_node_id: "confirm-details", transition_condition: { type: "prompt", prompt: "User provided phone number" } }],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Recite Details",
        instruction: { type: "prompt", text: `Repeat back what you gathered. Ask if it is correct.` },
        edges: [{ id: "edge-4", destination_node_id: "final-assistant", transition_condition: { type: "prompt", prompt: "if user agrees" } }],
      },
      {
        id: "final-assistant",
        type: "conversation",
        name: "Final Assistant",
        instruction: { type: "prompt", text: `Anything else?` },
        edges: [{ id: "edge-5", destination_node_id: "end-call", transition_condition: { type: "prompt", prompt: "If conversation is complete" } }],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: { type: "prompt", text: `Thanks {{Name}}. We'll be in touch. Thank you for calling ${businessName}.` },
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
    global_prompt: RETELL_GLOBAL_PROMPT_TEMPLATE,
  })

  const agentName = options?.agentName ?? `NeverMissLead ${industry}`
  const voiceId = options?.voiceId ?? "11labs-Chloe"

  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      agent_name: agentName,
      language: "en-US",
      voice_id: voiceId,
      voice_temperature: 0.98,
      voice_speed: 0.98,
      volume: 0.94,
      max_call_duration_ms: 3600000,
      interruption_sensitivity: 0.9,
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
