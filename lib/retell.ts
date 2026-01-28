import { Industry } from "@prisma/client"
import { generatePrompt } from "./prompts"

const RETELL_API_BASE = "https://api.retellai.com"

export interface RetellAgent {
  agent_id?: string
  agent_name: string
  language: string
  voice_id: string
  voice_temperature: number
  voice_speed: number
  volume: number
  max_call_duration_ms: number
  interruption_sensitivity: number
  response_engine: {
    type: string
    version: number
    conversation_flow_id?: string
  }
  conversationFlow?: any
}

export interface CreateAgentRequest {
  businessName: string
  industry: Industry
  serviceAreas: string[]
  phoneNumber?: string
}

export async function createRetellAgent(
  data: CreateAgentRequest
): Promise<{ agent_id: string; phone_number?: string }> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    throw new Error("RETELL_API_KEY is not configured")
  }

  const globalPrompt = generatePrompt(data.businessName, data.industry, data.serviceAreas)

  // Build conversation flow based on Kip (3).json structure
  const conversationFlow = buildConversationFlow(data.businessName, data.industry, data.serviceAreas)

  const agentPayload: RetellAgent = {
    agent_name: data.businessName,
    language: "en-US",
    voice_id: "11labs-Chloe",
    voice_temperature: 0.98,
    voice_speed: 0.98,
    volume: 0.94,
    max_call_duration_ms: 3600000, // 1 hour
    interruption_sensitivity: 0.9,
    response_engine: {
      type: "conversation-flow",
      version: 0,
    },
    conversationFlow: {
      ...conversationFlow,
      global_prompt: globalPrompt,
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

  // Assign phone number if provided
  let phone_number: string | undefined
  if (data.phoneNumber) {
    phone_number = await assignPhoneNumber(result.agent_id, data.phoneNumber)
  }

  return {
    agent_id: result.agent_id,
    phone_number,
  }
}

async function assignPhoneNumber(
  agentId: string,
  phoneNumber: string
): Promise<string> {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    throw new Error("RETELL_API_KEY is not configured")
  }

  const response = await fetch(`${RETELL_API_BASE}/update-agent/${agentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to assign phone number: ${error}`)
  }

  return phoneNumber
}

function buildConversationFlow(
  businessName: string,
  industry: Industry,
  serviceAreas: string[]
): any {
  // Base structure from Kip (3).json
  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome Node",
        instruction: {
          type: "static_text",
          text: `Thanks for calling ${businessName}! This is our virtual assistant. Who am I speaking with today?\n`,
        },
        edges: [
          {
            id: "edge-1",
            destination_node_id: "collect-name",
            transition_condition: {
              type: "prompt",
              prompt: "User provided name",
            },
          },
        ],
        start_speaker: "agent",
      },
      {
        id: "collect-name",
        type: "conversation",
        name: "Collect Name",
        instruction: {
          type: "prompt",
          text: `Thank you {{Name}}! Could you please provide the city the property is in that needs service?\n`,
        },
        edges: [
          {
            id: "edge-2",
            destination_node_id: "verify-city",
            transition_condition: {
              type: "prompt",
              prompt: "User provided city",
            },
          },
        ],
      },
      {
        id: "verify-city",
        type: "conversation",
        name: "City Verified",
        instruction: {
          type: "prompt",
          text: `Ask the caller to confirm the city.\nInternally verify the city is one of the supported service locations:\n${serviceAreas.join(", ")}.\n\nDo not show the list to the caller.`,
        },
        edges: [
          {
            id: "edge-3",
            destination_node_id: "collect-address",
            transition_condition: {
              type: "prompt",
              prompt: "if city IS supported",
            },
          },
          {
            id: "edge-4",
            destination_node_id: "not-supported",
            transition_condition: {
              type: "prompt",
              prompt: "if city IS NOT supported",
            },
          },
        ],
      },
      {
        id: "collect-address",
        type: "conversation",
        name: "Ask Address",
        instruction: {
          type: "prompt",
          text: `Great, we do service {{city}}. Could you please provide the full address of the property needing service?`,
        },
        edges: [
          {
            id: "edge-5",
            destination_node_id: "collect-issue",
            transition_condition: {
              type: "prompt",
              prompt: "If address is provided",
            },
          },
        ],
      },
      {
        id: "collect-issue",
        type: "conversation",
        name: "Ask Issue Details",
        instruction: {
          type: "prompt",
          text: `Please describe the issue you're experiencing in as much detail as possible.`,
        },
        edges: [
          {
            id: "edge-6",
            destination_node_id: "confirm-details",
            transition_condition: {
              type: "prompt",
              prompt: "If user is done",
            },
          },
          {
            id: "edge-7",
            destination_node_id: "emergency-flag",
            transition_condition: {
              type: "prompt",
              prompt: "If urgent or emergency, i.e. 'flooding', 'no heat', 'gas smell', 'burst pipe'",
            },
          },
        ],
      },
      {
        id: "emergency-flag",
        type: "conversation",
        name: "Emergency Detected",
        instruction: {
          type: "prompt",
          text: `This sounds urgent. I'll make sure it's flagged as a priority.`,
        },
        edges: [
          {
            id: "edge-8",
            destination_node_id: "confirm-details",
            transition_condition: {
              type: "prompt",
              prompt: "Always",
            },
          },
        ],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Recite Issue",
        instruction: {
          type: "prompt",
          text: `Repeat back to the user the information gathered about the issue. Ask if it is correct.`,
        },
        edges: [
          {
            id: "edge-9",
            destination_node_id: "phone-confirm",
            transition_condition: {
              type: "prompt",
              prompt: "if user agrees that information recited is correct",
            },
          },
        ],
      },
      {
        id: "phone-confirm",
        type: "conversation",
        name: "Phone Confirm",
        instruction: {
          type: "prompt",
          text: `Ok, got it! {{Name}}! Now, is the best number to reach you the one you're calling from?`,
        },
        edges: [
          {
            id: "edge-10",
            destination_node_id: "final-assistant",
            transition_condition: {
              type: "prompt",
              prompt: "if confirmed",
            },
          },
          {
            id: "edge-11",
            destination_node_id: "ask-number",
            transition_condition: {
              type: "prompt",
              prompt: "if NOT confirmed",
            },
          },
        ],
      },
      {
        id: "ask-number",
        type: "conversation",
        name: "Ask number",
        instruction: {
          type: "prompt",
          text: `Ask for best contact phone number`,
        },
        edges: [
          {
            id: "edge-12",
            destination_node_id: "final-assistant",
            transition_condition: {
              type: "prompt",
              prompt: "user provides number",
            },
          },
        ],
      },
      {
        id: "final-assistant",
        type: "conversation",
        name: "Final Assistant",
        instruction: {
          type: "prompt",
          text: `Is there anything else we should know or anything else I can help you with today?`,
        },
        edges: [
          {
            id: "edge-13",
            destination_node_id: "end-call",
            transition_condition: {
              type: "prompt",
              prompt: "If conversation is complete",
            },
          },
        ],
      },
      {
        id: "not-supported",
        type: "conversation",
        name: "Not supported",
        instruction: {
          type: "prompt",
          text: `Apologize, and inform the caller that we don't currently provide services in {{city}}. Do not offer any future services.`,
        },
        edges: [
          {
            id: "edge-14",
            destination_node_id: "end-call-not-supported",
            transition_condition: {
              type: "prompt",
              prompt: "Always",
            },
          },
        ],
      },
      {
        id: "end-call",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: {
          type: "prompt",
          text: `Thanks {{Name}}. A member of our team will reach out shortly regarding your {{issue_description}}. Thank you for calling ${businessName}. Have a great day!`,
        },
      },
      {
        id: "end-call-not-supported",
        type: "end",
        name: "End Call",
        speak_during_execution: true,
        instruction: {
          type: "prompt",
          text: `Politely end the call`,
        },
      },
    ],
  }
}

export async function getRetellAgent(agentId: string) {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) {
    throw new Error("RETELL_API_KEY is not configured")
  }

  const response = await fetch(`${RETELL_API_BASE}/get-agent/${agentId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get Retell agent")
  }

  return response.json()
}
