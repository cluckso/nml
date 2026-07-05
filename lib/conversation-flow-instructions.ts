/** Shared node instructions for Retell conversation flows (demo + live agents).
 * Personality lives in the global prompt — nodes are task-focused only.
 */

export const TRANSITION_NAME_PROVIDED =
  "Caller gave their name or how they'd like to be addressed"

export const TRANSITION_PHONE_PROVIDED =
  "Caller gave a callback number or confirmed the number they're calling from works"

export const TRANSITION_REASON_CLEAR =
  "Caller described the reason with enough actionable detail, or one follow-up was enough"

/** Natural opening — prompt type so wording varies call to call. */
export const FLOW_START_GREETING = (businessName: string) =>
  `Greet warmly for ${businessName}. Thank them for calling and ask who you're speaking with. Vary wording each call; match their pace.`

/** Demo welcome — mention demo once, then ask who. */
export const FLOW_DEMO_START =
  "Open warmly on the CallGrabbr demo line. Mention once that they've reached the demo and you'll take their info so someone can follow up — then ask who you're speaking with. Vary wording; match their pace."

export const FLOW_ACKNOWLEDGE =
  "Give a short acknowledgment that fits what they said, then your next question."

export const FLOW_COLLECT_REASON =
  "Ask what they need help with. If vague, one short follow-up only. Move on once you have a clear, actionable description."

export const FLOW_COLLECT_REASON_AUTO =
  "Ask what they need — new issue, maintenance, status on existing repair, or scheduling. If vague, one short follow-up. For new issues, note symptoms and whether the vehicle is drivable when relevant."

export const FLOW_EMPATHY_PRIORITY =
  "Acknowledge briefly that this is a priority. Reassure them the team will be notified as soon as possible. Ask one short question only if a critical detail is still missing."

export const FLOW_EMPATHY_URGENT =
  "Validate that this sounds urgent. Reassure you'll flag it as priority, then ask for the property city in a calm, natural way."

export const FLOW_COLLECT_CITY =
  "Ask which city the property is in — conversational, not like a form field."

export const FLOW_COLLECT_ADDRESS =
  "Acknowledge briefly, then ask for the full service address in a natural way."

export const FLOW_VERIFY_SERVICE_AREA = (serviceAreas: string) =>
  `Confirm the city with the caller. Check quietly against service areas: ${serviceAreas}. Do not read the full list aloud. If supported, say so warmly and continue. If not, apologize and explain you don't service that area yet.`

export const FLOW_COLLECT_PHONE =
  "Ask for the best number to reach them — like making sure the team can call back, not filling out a form."

export const FLOW_COLLECT_VEHICLE =
  "Ask what vehicle this is for — year, make, and model — in a conversational way."

export const FLOW_COLLECT_DROPOFF =
  "Ask when they dropped the vehicle off."

export const FLOW_COLLECT_APPOINTMENT =
  "Ask if they have preferred days or times for an appointment."

export const FLOW_CHILD_REASON =
  "Ask warmly whether they're calling about enrolling, an existing enrollment, or something else."

export const FLOW_CHILD_AGE =
  "Ask how old their child is, or what age range they're looking for care for."

export const FLOW_CHILD_CARE_TYPE =
  "Ask what type of care they're looking for — full-time, part-time, drop-in, or something else."

export const FLOW_CHILD_TOUR =
  "Ask if they have preferred days or times for a tour."

export const FLOW_CONFIRM_ONCE = `Read back what you have in one natural breath: their name, callback number, and a short paraphrase of what they need (not a word-for-word recap). Check once that it sounds right or if they want to add anything. That's your only confirmation — never re-read the full summary. If they correct something, acknowledge the fix in one short sentence and stop; don't recite everything again. After they respond, do not speak again in this step — the call wraps up next.`

export const FLOW_CONFIRM_EDGE =
  "Caller responded after hearing the summary — including yes, correct, sounds good, that's all, nothing else, okay, yep, sure, or a correction you already acknowledged. Proceed immediately; do not re-read or re-confirm details."

/** Demo confirm: save silently, then one natural read-back. */
export const DEMO_CONFIRM_INSTRUCTION =
  "First call store_lead_details silently with everything you've gathered — don't mention the tool or read fields aloud while saving. Then read back what you have in one natural breath: their name, callback number, and a short paraphrase of what they need (not a word-for-word recap). Check once that it sounds right or if they want to add anything. That's your only confirmation — never re-read the full summary. If they correct something, acknowledge the fix in one short sentence and stop. After they respond, do not speak again in this step."

export const FLOW_END_POLITE = (businessLabel: string) =>
  `Thank them warmly and briefly. Let them know someone from ${businessLabel} will follow up soon. Don't recap their details. End on a friendly note.`

export const FLOW_DEMO_END =
  "Thank them warmly for trying the demo and let them know someone will follow up soon. Keep it brief and friendly — no recap of their details."

export const DEMO_COLLECT_REASON =
  "Acknowledge briefly, then ask what they need help with. If vague, one short follow-up. When it fits, get useful extras: address or city for home/service work, year/make/model for auto, preferred day or time if scheduling."

export const DEMO_COLLECT_PHONE = FLOW_COLLECT_PHONE

export const DEMO_SAVE_LEAD_INSTRUCTION =
  "Call store_lead_details once with all gathered fields (name, phone, issue, and address/city/vehicle/appointment if any). Do not read details back to the caller in this step — only invoke the tool, then move on."

/** Global node: caller already volunteered info the current step would ask for. */
export const FLOW_GLOBAL_ALREADY_SAID =
  "They already gave this detail earlier. Acknowledge it briefly and continue the intake — do not ask again."

/** Global node: caller wants a manager or human. */
export const FLOW_GLOBAL_WANTS_HUMAN =
  "They want to speak with someone now. Empathize, take their message and callback number if missing, and assure the team will follow up — do not promise an exact time or that someone is available right now."

/** Build a Retell global conversation node (interruptible from any step). */
export function buildGlobalNode(
  id: string,
  name: string,
  instruction: string,
  condition: string,
  coolDown = 3
): Record<string, unknown> {
  return {
    id,
    type: "conversation",
    name,
    instruction: { type: "prompt", text: instruction },
    global_node_setting: {
      condition,
      cool_down: coolDown,
      go_back_conditions: [
        {
          id: `${id}-go-back`,
          transition_condition: {
            type: "prompt",
            prompt: "Handled the interruption and ready to continue intake",
          },
        },
      ],
    },
    edges: [],
  }
}

export const GLOBAL_NODE_ALREADY_SAID = buildGlobalNode(
  "global-already-said",
  "Already Provided Info",
  FLOW_GLOBAL_ALREADY_SAID,
  "Caller already volunteered information that the current step was about to ask for"
)

export const GLOBAL_NODE_WANTS_HUMAN = buildGlobalNode(
  "global-wants-human",
  "Wants Human",
  FLOW_GLOBAL_WANTS_HUMAN,
  "Caller asks to speak with a manager, owner, technician, or a real person right now"
)

/** Append standard global nodes to a flow node list. */
export function withGlobalNodes(nodes: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...nodes, GLOBAL_NODE_ALREADY_SAID, GLOBAL_NODE_WANTS_HUMAN]
}
