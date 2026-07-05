/**
 * Flex-mode node tasks — minimal labels + exit criteria only.
 * All tone, empathy, phrasing, and skip-if-already-said rules live in the global prompt playbook.
 */

export const TRANSITION_NAME_PROVIDED =
  "Caller gave their name or how they'd like to be addressed"

export const TRANSITION_PHONE_PROVIDED =
  "Caller gave a callback number or confirmed the number they're calling from works"

export const TRANSITION_REASON_CLEAR =
  "Caller described the reason with enough actionable detail, or one follow-up was enough"

export const TRANSITION_CONFIRM_DONE =
  "Caller responded after hearing the summary — including yes, correct, sounds good, that's all, nothing else, okay, yep, sure, or a correction you already acknowledged. Proceed immediately; do not re-read or re-confirm details."

// ─── Live business tasks ───────────────────────────────────────────────────

export const TASK_GREET = "Task Greet: Capture caller name."

export const TASK_REASON = "Task Reason: Capture reason for call."

export const TASK_REASON_AUTO = "Task Reason: Capture call type — new issue, maintenance, status check, or scheduling."

export const TASK_URGENCY = "Task Urgency: Mark priority if emergency; continue intake."

export const TASK_CITY = "Task City: Capture property city."

export const TASK_VERIFY_AREA = (serviceAreas: string) =>
  `Task VerifyArea: Check city against ${serviceAreas}. In-area → Address; out-of-area → NotSupported.`

export const TASK_ADDRESS = "Task Address: Capture full service address."

export const TASK_PHONE = "Task Phone: Capture callback number."

export const TASK_VEHICLE = "Task Vehicle: Capture year, make, model."

export const TASK_DROPOFF = "Task Dropoff: Capture drop-off date or time."

export const TASK_APPOINTMENT = "Task Appointment: Capture preferred day or time."

export const TASK_CHILD_REASON = "Task ChildReason: Capture enrollment vs existing vs other."

export const TASK_CHILD_AGE = "Task ChildAge: Capture child age or range."

export const TASK_CHILD_CARE = "Task ChildCare: Capture care type needed."

export const TASK_CHILD_TOUR = "Task Tour: Capture preferred tour times."

export const TASK_CONFIRM = "Task Confirm: One read-back. Done when caller responds."

export const TASK_NOT_SUPPORTED = "Task NotSupported: Decline out-of-area service."

export const TASK_END = "Task End: Close call."

// ─── Demo tasks ────────────────────────────────────────────────────────────

export const TASK_GREET_DEMO = "Task Greet: Mention demo once; capture name."

export const TASK_REASON_DEMO = "Task Reason: Capture reason; note city, vehicle, or appointment if offered."

export const TASK_CONFIRM_DEMO =
  "Task Confirm: Invoke store_lead_details silently, then one read-back. Done when caller responds."

export const TASK_SAVE_DEMO = "Task Save: Invoke store_lead_details with all gathered fields."

// ─── Steve personal tasks ──────────────────────────────────────────────────

export const TASK_CALLER_TYPE =
  "Task CallerType: Capture employee, customer, vendor, applicant, corporate, or other."

export const TASK_FOLLOWUP_EMPLOYEE = "Task FollowUp: Capture shift/call-off topic."

export const TASK_FOLLOWUP_CUSTOMER = "Task FollowUp: Capture order/visit/feedback summary."

export const TASK_FOLLOWUP_VENDOR = "Task FollowUp: Capture company name and purpose."

export const TASK_FOLLOWUP_APPLICANT = "Task FollowUp: Capture role interest."

export const TASK_FOLLOWUP_CORPORATE = "Task FollowUp: Capture department and message."

export const TASK_FOLLOWUP_OTHER = "Task FollowUp: Capture message for Steve."

export const TASK_CHECK_URGENCY = "Task Urgency: Flag priority if store emergency."

export const TASK_PRIORITY_NOTE = "Task Priority: Note priority; continue to phone."

export const TASK_PHONE_STEVE = "Task Phone: Capture callback number for Steve."

export const TASK_SAVE_STEVE = "Task Save: Invoke store_message_details with all fields."
