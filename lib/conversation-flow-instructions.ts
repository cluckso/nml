/** Shared node instructions for Retell conversation flows (demo + live agents). */

export const FLOW_NAME_USAGE =
  "Do NOT repeat the caller's name every turn. You may use their first name once right after they give it, then use natural acknowledgments ('Got it', 'Thanks', 'I understand') without their name."

export const FLOW_ACKNOWLEDGE =
  "Briefly acknowledge their answer without saying their name, then ask your next question."

export const FLOW_CONFIRM_ONCE = `Give ONE brief confirmation in short form: callback name, phone number, and a concise paraphrase of their request (do NOT read back the full verbatim job description). Ask a single question like "Does that sound right?" Confirm exactly ONCE. After they say yes, correct, sounds good, or similar, do NOT repeat the summary or ask again. If they correct one detail, acknowledge the fix and confirm only that detail once, then proceed.`

export const FLOW_CONFIRM_EDGE =
  "User confirmed with yes, correct, that's right, sounds good, yep, okay, or agreed — proceed immediately without re-reading details"

export const FLOW_END_POLITE = (businessLabel: string) =>
  `Thank them warmly and briefly. Let them know someone from ${businessLabel} will follow up soon. Do not repeat their details or say their name again. End on a friendly note.`

export const FLOW_DEMO_END =
  "Thank them warmly for trying the demo. Let them know someone will follow up soon. Keep it brief — do not repeat their details."

export const DEMO_SAVE_LEAD_INSTRUCTION =
  "Call store_lead_details once with all gathered fields (name, phone, issue, and address/city/vehicle/appointment if any). Do not read details back to the caller in this step — only invoke the tool, then move on."
