import { STEVE_PERSONAL_AGENT_CONFIG } from "@/config/steve-personal-agent"
import {
  TASK_CALLER_TYPE,
  TASK_CHECK_URGENCY,
  TASK_CONFIRM,
  TASK_END,
  TASK_FOLLOWUP_APPLICANT,
  TASK_FOLLOWUP_CORPORATE,
  TASK_FOLLOWUP_CUSTOMER,
  TASK_FOLLOWUP_EMPLOYEE,
  TASK_FOLLOWUP_OTHER,
  TASK_FOLLOWUP_VENDOR,
  TASK_PHONE_STEVE,
  TASK_PRIORITY_NOTE,
  TASK_SAVE_STEVE,
  TRANSITION_CONFIRM_DONE,
  TRANSITION_NAME_PROVIDED,
  TRANSITION_PHONE_PROVIDED,
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

const TYPE_FOLLOWUP: Record<string, string> = {
  employee: TASK_FOLLOWUP_EMPLOYEE,
  customer: TASK_FOLLOWUP_CUSTOMER,
  vendor: TASK_FOLLOWUP_VENDOR,
  applicant: TASK_FOLLOWUP_APPLICANT,
  corporate: TASK_FOLLOWUP_CORPORATE,
  other: TASK_FOLLOWUP_OTHER,
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
          prompt: needsUrgent ? "Caller explained reason with enough detail" : "Caller provided enough detail",
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
            transition_condition: { type: "prompt", prompt: TRANSITION_NAME_PROVIDED },
          },
        ],
        start_speaker: "agent",
      },
      {
        id: "collect-type",
        type: "conversation",
        name: "Caller Type",
        instruction: { type: "prompt", text: TASK_CALLER_TYPE },
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
        instruction: { type: "prompt", text: TASK_CHECK_URGENCY },
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
        instruction: { type: "prompt", text: TASK_PRIORITY_NOTE },
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
        instruction: { type: "prompt", text: TASK_PHONE_STEVE },
        edges: [
          {
            id: "edge-phone",
            destination_node_id: "save-lead",
            transition_condition: { type: "prompt", prompt: TRANSITION_PHONE_PROVIDED },
          },
        ],
      },
      {
        id: "save-lead",
        type: "conversation",
        name: "Save Message",
        instruction: { type: "prompt", text: TASK_SAVE_STEVE },
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
        instruction: { type: "prompt", text: TASK_CONFIRM },
        edges: [
          {
            id: "edge-confirm",
            destination_node_id: "end-call",
            transition_condition: { type: "prompt", prompt: TRANSITION_CONFIRM_DONE },
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
          text: TASK_END,
        },
      },
    ],
  }
}
