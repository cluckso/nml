import { STEVE_PERSONAL_AGENT_CONFIG } from "@/config/steve-personal-agent"
import {
  FLOW_ACKNOWLEDGE,
  FLOW_CONFIRM_EDGE,
  FLOW_CONFIRM_ONCE,
  FLOW_END_POLITE,
  FLOW_NAME_USAGE,
} from "@/lib/conversation-flow-instructions"

export const STEVE_EXTRACT_MESSAGE_TOOL = {
  type: "extract_dynamic_variable" as const,
  name: "store_message_details",
  description:
    "Call once when name, caller type, reason, callback phone, and priority flag are known. Stores fields for Steve's missed-call summary.",
  variables: [
    { type: "string" as const, name: "name", description: "Caller's name" },
    { type: "string" as const, name: "phone", description: "Best callback phone number" },
    {
      type: "string" as const,
      name: "caller_type",
      description: "employee | customer | vendor | applicant | corporate | other",
    },
    { type: "string" as const, name: "reason", description: "Brief reason for the call (concise paraphrase)" },
    {
      type: "string" as const,
      name: "company_name",
      description: "Vendor or company name if applicable",
    },
    {
      type: "boolean" as const,
      name: "priority_flag",
      description: "True if urgent store issue: equipment, safety, opening, staffing emergency",
    },
  ],
}

const SAVE_LEAD_INSTRUCTION =
  "Call store_message_details once with all gathered fields. Do not read details back to the caller in this step — only invoke the tool, then move on."

const TYPE_FOLLOWUP: Record<string, string> = {
  employee: `${FLOW_ACKNOWLEDGE} What's this regarding — a shift, call-off, schedule question, or something else? If it's a call-off, what shift or time? Never promise schedule changes.`,
  customer: `${FLOW_ACKNOWLEDGE} Can you briefly describe what happened — an order, a visit, or feedback? Do NOT offer refunds, comps, or policy decisions.`,
  vendor: `${FLOW_ACKNOWLEDGE} What company are you with, and what's the purpose of your call?`,
  applicant: `${FLOW_ACKNOWLEDGE} What role are you interested in? ${STEVE_PERSONAL_AGENT_CONFIG.hiringMessage}`,
  corporate: `${FLOW_ACKNOWLEDGE} Which department or person were you trying to reach, and what's your message?`,
  other: `${FLOW_ACKNOWLEDGE} What message should I pass along to Steve?`,
}

const URGENT_TYPES = new Set(["employee", "customer"])

function followUpNode(id: string, type: keyof typeof TYPE_FOLLOWUP) {
  const needsUrgent = URGENT_TYPES.has(type)
  return {
    id,
    type: "conversation" as const,
    name: `Follow-up ${type}`,
    instruction: { type: "prompt" as const, text: TYPE_FOLLOWUP[type] },
    edges: [
      {
        id: `${id}-edge`,
        destination_node_id: needsUrgent ? "check-urgency" : "collect-phone",
        transition_condition: {
          type: "prompt" as const,
          prompt: needsUrgent ? "User explained reason with enough detail" : "User provided enough detail",
        },
      },
    ],
  }
}

/** Steve personal missed-call flow: type branch → optional urgency → phone → save → confirm → end. */
export function buildStevePersonalConversationFlow(): {
  start_node_id: string
  start_speaker: "agent"
  nodes: unknown[]
} {
  const owner = STEVE_PERSONAL_AGENT_CONFIG.ownerFirstName
  const endLabel = `${owner}'s line`

  return {
    start_node_id: "start-node",
    start_speaker: "agent",
    nodes: [
      {
        id: "start-node",
        type: "conversation",
        name: "Welcome",
        instruction: {
          type: "static_text",
          text: `${STEVE_PERSONAL_AGENT_CONFIG.welcomeMessage}\n`,
        },
        edges: [
          {
            id: "edge-1",
            destination_node_id: "collect-type",
            transition_condition: { type: "prompt", prompt: "User provided name" },
          },
        ],
        start_speaker: "agent",
      },
      {
        id: "collect-type",
        type: "conversation",
        name: "Caller Type",
        instruction: {
          type: "prompt",
          text: `${FLOW_ACKNOWLEDGE} Are you calling as a store employee, a customer, a vendor or delivery driver, about a job application, from corporate or district, or something else? ${FLOW_NAME_USAGE}`,
        },
        edges: [
          { id: "edge-t-employee", destination_node_id: "followup-employee", transition_condition: { type: "prompt", prompt: "Employee or store staff" } },
          { id: "edge-t-customer", destination_node_id: "followup-customer", transition_condition: { type: "prompt", prompt: "Customer or guest" } },
          { id: "edge-t-vendor", destination_node_id: "followup-vendor", transition_condition: { type: "prompt", prompt: "Vendor, supplier, or delivery" } },
          { id: "edge-t-applicant", destination_node_id: "followup-applicant", transition_condition: { type: "prompt", prompt: "Job applicant or hiring" } },
          { id: "edge-t-corporate", destination_node_id: "followup-corporate", transition_condition: { type: "prompt", prompt: "Corporate, district, or franchise office" } },
          { id: "edge-t-other", destination_node_id: "followup-other", transition_condition: { type: "prompt", prompt: "Other or unclear — default here" } },
        ],
      },
      followUpNode("followup-employee", "employee"),
      followUpNode("followup-customer", "customer"),
      followUpNode("followup-vendor", "vendor"),
      followUpNode("followup-applicant", "applicant"),
      followUpNode("followup-corporate", "corporate"),
      followUpNode("followup-other", "other"),
      {
        id: "check-urgency",
        type: "conversation",
        name: "Check Urgency",
        instruction: {
          type: "prompt",
          text: `${FLOW_ACKNOWLEDGE} Is this urgent — like equipment down, a safety issue, or trouble opening or staffing the store? If yes, I'll flag it as priority for Steve.`,
        },
        edges: [
          {
            id: "edge-urgent-yes",
            destination_node_id: "priority-note",
            transition_condition: { type: "prompt", prompt: "Urgent — equipment, safety, opening, or staffing emergency" },
          },
          {
            id: "edge-urgent-no",
            destination_node_id: "collect-phone",
            transition_condition: { type: "prompt", prompt: "Not urgent or routine matter" },
          },
        ],
      },
      {
        id: "priority-note",
        type: "conversation",
        name: "Priority Note",
        instruction: {
          type: "prompt",
          text: "Acknowledge briefly that this is priority and Steve will be notified as soon as possible. Ask one short question only if you still need a critical detail.",
        },
        edges: [
          {
            id: "edge-priority",
            destination_node_id: "collect-phone",
            transition_condition: { type: "prompt", prompt: "Always proceed to collect phone" },
          },
        ],
      },
      {
        id: "collect-phone",
        type: "conversation",
        name: "Collect Phone",
        instruction: {
          type: "prompt",
          text: `${FLOW_ACKNOWLEDGE} What's the best number for Steve to call you back? If the number you're calling from works, they can say so.`,
        },
        edges: [
          {
            id: "edge-phone",
            destination_node_id: "save-lead",
            transition_condition: { type: "prompt", prompt: "User provided phone or confirmed calling number" },
          },
        ],
      },
      {
        id: "save-lead",
        type: "conversation",
        name: "Save Message",
        instruction: { type: "prompt", text: SAVE_LEAD_INSTRUCTION },
        tools: [STEVE_EXTRACT_MESSAGE_TOOL],
        edges: [
          {
            id: "edge-save",
            destination_node_id: "confirm-details",
            transition_condition: { type: "prompt", prompt: "Tool called or message fields saved" },
          },
        ],
      },
      {
        id: "confirm-details",
        type: "conversation",
        name: "Confirm Details",
        instruction: { type: "prompt", text: FLOW_CONFIRM_ONCE },
        edges: [
          {
            id: "edge-confirm",
            destination_node_id: "end-call",
            transition_condition: { type: "prompt", prompt: FLOW_CONFIRM_EDGE },
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
          text: FLOW_END_POLITE(endLabel),
        },
      },
    ],
  }
}
