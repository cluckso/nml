# Retell Setup for CallGrabbr

This app uses [Retell AI](https://www.retellai.com/) with a **shared agent and one intake number**. All clients forward their missed calls to the same number; the app routes each call to the correct client by the **forwarded-from** number. Call events (call_inbound, call_ended, call_analysis) are sent to your app via webhooks.

Below is a full breakdown of tasks and configuration in Retell and in your app.

---

## 1. Retell account and API key

| Task | Where | What to do |
|------|--------|------------|
| Create Retell account | [retellai.com](https://www.retellai.com) | Sign up if you don’t have an account. |
| Get API key | Retell Dashboard → **API Keys** (or **Integrations** / **Developers**) | Create or copy an API key. It’s a secret (starts with `key_` or similar). |
| Add to env | Your app (e.g. `.env.local`, Vercel) | Set `RETELL_API_KEY=<your_key>`. |

**Used for:** All Retell API calls from your app (create conversation flow, create agent, update agent, get agent).

---

## 2. Webhook URL and secret

Your app receives Retell events at:

`https://<your-app-domain>/api/webhooks/retell`

Examples:

- Production: `https://yourapp.vercel.app/api/webhooks/retell`
- Local (with tunnel): `https://your-ngrok-url.ngrok.io/api/webhooks/retell`

| Task | Where | What to do |
|------|--------|------------|
| Set webhook URL in Retell | Retell Dashboard → **Webhooks** (or **Integrations** / **Settings**) | Set the **Webhook URL** to your app’s URL above. Must be HTTPS in production. |
| Get webhook secret | Same place in Retell | Retell may show a **Signing secret** or **Webhook secret** (used to sign payloads). Copy it. |
| Add to env | Your app | Set `RETELL_WEBHOOK_SECRET=<secret>`. |

**Used for:**

- **Webhook URL:** Retell sends `call_ended` and `call_analyzed` events here.
- **RETELL_WEBHOOK_SECRET:** Your app verifies the `x-retell-signature` header. If unset, the app only skips verification in `NODE_ENV=development`.

**Events the app handles:**

- `call_inbound` – resolves client by forwarded-from number (only **ACTIVE** businesses). Returns override_agent_id (shared agent), **metadata** (`client_id`, `forwarded_from_number`) so Retell echoes it back on call_ended/call_analyzed, **dynamic_variables** (see below), and **agent_override** (begin_message, voice_speed, interruption_sensitivity, max_call_duration_ms, model_temperature). If no client or not active, returns empty `call_inbound` so **Retell rejects the call** — no connection, no Retell usage.

**Settings → Retell (per call):** When a business has saved settings (Dashboard → Settings), the app sends them to Retell on every inbound call so the agent behavior matches:

- **agent_override:** `begin_message` (custom greeting), `voice_speed`, `interruption_sensitivity`, `max_call_duration_ms`, `model_temperature` (from voice/conciseness).
- **dynamic_variables:** `business_name`, `tone`, `question_depth`, `after_hours_behavior`, `voice_style`, `voice_gender`, `intake_fields`, `intake_template`, `booking_*`, `lead_tags`, `priority_rules`, `always_say`, `never_say`, `compliance_phrases`, `max_call_length_minutes`, `question_retry_count`, `emergency_forward`, `spam_handling`, etc.

To have the Retell agent *use* these, reference them in your agent’s prompt in the Retell dashboard (e.g. “Use a {{tone}} tone”, “Only collect: {{intake_fields}}”, “Keep calls under {{max_call_length_minutes}} minutes”).
- `call_ended` – creates/updates **Call** (correct business via metadata.client_id or forwarded_from_number), **usage** (trial minutes or Stripe); minimum **1 billable minute per call**; sends notifications; sets testCallVerifiedAt when first call completes for that client.
- `call_analyzed` – same as call_ended (Retell sends `call_analyzed` with full call + call_analysis; we handle both so we never miss completion).

---

### No call logs or usage on client dashboard?

1. **Webhook URL** – In Retell Dashboard → Webhooks, set URL to exactly your app (e.g. `https://callback-liart.vercel.app/api/webhooks/retell`). Must be HTTPS.
2. **Secrets in Vercel** – In Vercel → Project → Settings → Environment Variables, set `RETELL_WEBHOOK_SECRET` and `RETELL_API_KEY` for the same environment (Production/Preview) you’re testing. Redeploy after changing env.
3. **Metadata** – Call logs are tied to the business by **metadata** we send on `call_inbound` (`client_id`, `forwarded_from_number`). Retell must echo this back on `call_ended`/`call_analyzed`. If your Retell webhook config doesn’t pass through metadata, business won’t be found and the call won’t be stored.
4. **Business status** – Only **ACTIVE** businesses get calls answered and get metadata. If the business is **PAUSED**, call_inbound returns empty and no call is created. In the DB, set `status = 'ACTIVE'` for the business (and ensure `primaryForwardingNumber` is the number that forwards to the AI).
5. **primaryForwardingNumber** – Must match the number Retell sends as `forwarded_from_number` (or the number that forwards to your intake number). E.164 format (e.g. +16086421459). Check Retell’s webhook payload or logs for the value they send.
6. **Vercel logs** – In Vercel → Project → Logs (or Deployments → … → View Function Logs), look for “Retell webhook” messages. “Client not found for call” means metadata was missing or business wasn’t resolved. “Missing call_id” means payload shape changed.
7. **Billable minutes** – Each call is charged at least **1 minute** (rounded up). Usage appears in Billing and in the dashboard trial card.

---

### Caller hears unavailable tone (call not connected)?

When the app returns **no** `override_agent_id` in the `call_inbound` response, Retell **rejects** the call and the caller typically hears an unavailable tone or disconnect. Check the following:

1. **RETELL_AGENT_ID (required)** – In Vercel (or your host) → Environment Variables, set `RETELL_AGENT_ID` to a valid Retell agent ID (e.g. from `npx tsx scripts/setup-retell-agents.ts`). If this is missing, the webhook returns empty `call_inbound` and the call is rejected.
2. **Inbound webhook URL** – In Retell Dashboard → Phone Numbers → select the number → **Inbound** / **Webhook**: set the URL to `https://<your-domain>/api/webhooks/retell`. Enable “Inbound Webhook” and leave “Inbound Call Agent” unset (or set only as fallback). If the webhook URL is wrong or the request never reaches your app, Retell may disconnect after timeout.
3. **Webhook signature** – If your app returns **401** (invalid signature), Retell may retry then give up. Set `RETELL_WEBHOOK_SECRET` (or `RETELL_API_KEY`) in env so verification succeeds. In development, verification is skipped if the secret is missing.
4. **Business and number mapping** – The app finds a business by: (a) **to_number** = `Business.retellPhoneNumber` (the number being called), or (b) **forwarded_from_number** = `Business.primaryForwardingNumber`, or (c) fallback = any ACTIVE business. If you’re calling a number that isn’t stored as `retellPhoneNumber` for any business and there’s no ACTIVE business for fallback, the app returns empty `call_inbound`. Fix: complete onboarding so the business has a Retell number assigned, or ensure at least one business has `status = 'ACTIVE'`.
5. **Logs** – In Vercel → Logs, search for **“Retell inbound rejected”**. The log will say whether the cause is “No agent ID configured” or “No business found for this call”.

---

## 3. Environment variables (summary)

| Variable | Required | Description |
|----------|----------|-------------|
| `RETELL_API_KEY` | Yes | Retell API key from dashboard. |
| `RETELL_WEBHOOK_SECRET` | Yes in production | Webhook signing secret from Retell; in dev, missing = no verification. |
| **Industry routing (two numbers)** | | |
| `NML_INTAKE_NUMBER_SERVICE` or `RETELL_INTAKE_SERVICE` | Yes* | E.164 of the **service-industry** intake number (HVAC, plumbing, electrician, handyman, auto repair, generic). Clients in these industries forward to this number. |
| `NML_INTAKE_NUMBER_CHILDCARE` or `RETELL_INTAKE_CHILDCARE` | Yes* | E.164 of the **childcare** intake number. Childcare clients forward to this number. |
| `RETELL_AGENT_ID` | Yes | Retell agent ID used when no industry-specific agent is set. Fallback for all industries. |
| `RETELL_AGENT_ID_CHILDCARE` | No | Childcare agent (also used when **to_number** is the childcare intake number). |
| **One agent per industry** | | Optional. If set, the app uses the business's industry to pick the agent (overrides number-based routing). |
| `RETELL_AGENT_ID_HVAC` | No | Agent for HVAC businesses. |
| `RETELL_AGENT_ID_PLUMBING` | No | Agent for plumbing. |
| `RETELL_AGENT_ID_AUTO_REPAIR` | No | Agent for auto repair. |
| `RETELL_AGENT_ID_ELECTRICIAN` | No | Agent for electricians. |
| `RETELL_AGENT_ID_HANDYMAN` | No | Agent for handyman. |
| `RETELL_AGENT_ID_GENERIC` | No | Agent for generic / other. |
| **Legacy (single number)** | | |
| `NML_SHARED_INTAKE_NUMBER` or `RETELL_SHARED_NUMBER` | No | Fallback single intake number if industry-specific numbers are not set. |
| `RETELL_API_BASE` | No | API base URL (default `https://api.retellai.com`). |

\* Use either industry-specific intake numbers (service + childcare) or the legacy shared number. The webhook picks the agent by **business industry first** (if `RETELL_AGENT_ID_<INDUSTRY>` is set), then by to_number, then `RETELL_AGENT_ID`. The dashboard shows each business the intake number for their industry.

Add these to:

- Local: `.env.local`
- Hosting (e.g. Vercel): Project → **Settings** → **Environment Variables**

---

## 4. What the app does with the Retell API (no extra Retell UI needed)

These are done in code; you don’t configure them in the Retell UI, but they show what Retell must support:

| Step | API | Purpose |
|------|-----|--------|
| 1 | `POST /create-conversation-flow` | Creates a conversation flow (nodes, global prompt, model). |
| 2 | `POST /create-agent` | Creates a voice agent with `response_engine: { type: "conversation-flow", conversation_flow_id, version }`, voice, language, etc. |
| 3 | Phone number | If `RETELL_EXISTING_PHONE` is set (or in dev, a hardcoded number): `PATCH /update-phone-number/{phone_number}` to attach that number to the new agent. Otherwise: `POST /create-phone-number` to purchase a new number (area code from `RETELL_DEFAULT_AREA_CODE`, default 415). |
| 4 | (Optional) `GET /get-agent/:agentId` | Used elsewhere in the app to fetch agent details. |

So in Retell you don’t need to manually create agents or flows; the app creates them per business when the user clicks **Connect to my call assistant**.

---

## 4a. Set up agents via API with correct variable formatting (recommended)

You can **create one Retell agent per industry via the API** so that prompts and flow nodes use **`{{variable_name}}`** placeholders. The inbound webhook then supplies these per call from saved business settings (e.g. `{{business_name}}`, `{{tone}}`, `{{question_depth}}`).

**What it does**

- Creates one **conversation flow** per industry (HVAC, PLUMBING, AUTO_REPAIR, CHILDCARE, ELECTRICIAN, HANDYMAN, GENERIC) with a **global prompt template** that references `{{business_name}}`, `{{tone}}`, `{{question_depth}}`, `{{after_hours_behavior}}`, `{{max_call_length_minutes}}`, etc.
- Flow node text uses `{{business_name}}` and `{{Name}}` (caller name) so each call gets the right context from the webhook **dynamic_variables**.
- Creates one **agent** per industry and prints the env vars to add (`RETELL_AGENT_ID`, `RETELL_AGENT_ID_HVAC`, etc.).

**Variable reference**

- Single source of truth: **`lib/retell-agent-template.ts`** (`RETELL_DYNAMIC_VARIABLE_NAMES`, `RETELL_GLOBAL_PROMPT_TEMPLATE`).
- The webhook in `app/api/webhooks/retell/route.ts` sends the same variable names in `dynamic_variables` on every `call_inbound`. Use **double curly braces** in Retell prompts: `{{business_name}}`, `{{tone}}`, `{{service_areas}}`, etc.

**How to run**

1. Set `RETELL_API_KEY` in `.env` or `.env.local`.
2. From the project root: **`npx tsx scripts/setup-retell-agents.ts`**
3. Copy the printed `RETELL_AGENT_ID=...` and `RETELL_AGENT_ID_<INDUSTRY>=...` lines into your env.

**Using the result**

- Add the printed env vars to `.env.local` or Vercel. Attach your intake phone number(s) to the desired agent(s) in the Retell dashboard (or via API).
- On each inbound call, the app sends `dynamic_variables` and `agent_override` (e.g. `begin_message`, `voice_speed`, `max_call_duration_ms`) so saved settings modify the agent without editing the saved agent in Retell.

---

## 5. Phone numbers (shared intake)

The app uses **one shared intake number**; all clients forward to it. You configure that number in Retell and set `NML_SHARED_INTAKE_NUMBER` or `RETELL_SHARED_NUMBER`. You do not need to stockpile numbers or set an AI number in onboarding.

Purchase or configure **one** intake number in Retell, attach it to the shared agent, and set `NML_SHARED_INTAKE_NUMBER` or `RETELL_SHARED_NUMBER`. The dashboard shows this shared number; clients set their **primary forwarding number** in onboarding and forward their business line to the shared number at their carrier.

Onboarding only collects the user’s **existing business line** (optional), 
---

## 6. How call forwarding works (not automatic)

**Forwarding calls to Retell is not automatic.** The app does not configure your phone carrier for you.

| Who | What happens |
|-----|----------------|
| **App** | Creates a Retell agent and, if the business has a phone number in onboarding, sends that number to Retell (`update-agent` with `phone_number`). The dashboard shows that number as the “AI number” and tells the user to “forward your business line to this AI number.” |
| **User (business owner)** | Must set up call forwarding **at their phone carrier** (or VoIP provider): “When someone calls my business number, forward the call to &lt;AI number&gt;.” That way when a customer calls the business, the carrier forwards the call to the Retell number, and Retell answers with the AI agent. |

**Typical flow:**

1. Business connects the call assistant in the app → app creates a Retell agent.
2. The “AI number” shown is either (a) a number you bought in Retell and set in onboarding, or (b) the business’s existing number that you’ve linked in Retell (e.g. via Retell’s number provisioning/porting).
3. The business owner goes to their **phone carrier / VoIP** (e.g. Verizon, Vonage, RingCentral) and sets **call forwarding**: “Forward calls from my business line to &lt;AI number&gt;.”
4. When a customer calls the business number → carrier forwards the call to the AI number → Retell receives the call and the agent answers.

So: **Retell does not pull or forward calls by itself.** Either callers dial a number that Retell already owns (the “AI number”), or the business owner must configure forwarding from their existing business number to that AI number at their carrier. The app does not do that step.

---

## 7. Voices

The app uses:

- **11labs-Chloe** (default)
- **11labs-Adam** (for “Local Plus” / branded voice)

These are Retell voice IDs. They’re usually available by default in Retell. If your account doesn’t have them, check Retell Dashboard → **Voices** (or equivalent) and either enable 11labs voices or change the voice IDs in `lib/retell.ts` to ones your account supports.

---

## 8. Post-call data extraction

The app consumes post-call analysis from Retell via the `call_analysis` webhook. It expects fields such as name, phone, address, city, issue description, lead tag, appointment preference, department, and summary/transcript. The app does **not** configure extraction in code; it only reads what Retell sends.

**Configure extraction in the Retell Dashboard** for your shared agent:

1. Open the agent used as the shared agent (the one in `RETELL_AGENT_ID`).
2. Go to the **Post-Call Analysis** tab for that agent.
3. Add analysis categories (Text for free-form, Selector for fixed options). Use names the app expects: e.g. caller name, caller phone, service_address/address, city, issue_description, appointment_preference, department, and a summary. Optionally add a Selector for lead_tag (e.g. EMERGENCY, ESTIMATE, FOLLOW_UP, GENERAL).

Retell sends these in the `call_analysis` webhook; the app maps both top-level and `extracted_variables`. See [Retell: Define the information you want to extract](https://docs.retellai.com/features/post-call-analysis-create).

---

## 9. Checklist (copy and use)

- [ ] Retell account created.
- [ ] API key created in Retell and set as `RETELL_API_KEY` in your app (local + production).
- [ ] In Retell, webhook URL set to `https://<your-app-domain>/api/webhooks/retell`.
- [ ] Webhook signing secret from Retell set as `RETELL_WEBHOOK_SECRET` in your app (required in production).
- [ ] Post-Call Analysis configured on the shared agent (section 8) so name, phone, address, issue, etc. are extracted.
- [ ] (Optional) `RETELL_DEFAULT_AREA_CODE` set if you want a specific area code for new numbers (default 415). Retell account has billing set up for number purchases.
- [ ] (If needed) Voices **11labs-Chloe** and **11labs-Adam** available in your Retell account, or `lib/retell.ts` updated to use other voice IDs.
- [ ] Test: In your app, connect the call assistant; then place a test call and confirm a `call_ended` / `call_analysis` webhook hits your app and the call appears in the dashboard.

---

## 10. Troubleshooting

| Symptom | Check |
|--------|--------|
| “RETELL_API_KEY is not configured” | Env var set where the app runs (e.g. Vercel env, restart dev server after changing `.env.local`). |
| “Failed to create Retell conversation flow: …” | Error message from Retell (e.g. invalid nodes, model, or account limit). Fix payload in `lib/retell.ts` or upgrade Retell plan. |
| “Failed to create Retell agent: …” | Same: read the error from Retell (e.g. invalid `conversation_flow_id`, voice, or account). |
| Webhook returns 401 “Invalid signature” | `RETELL_WEBHOOK_SECRET` matches the secret in Retell; no extra spaces; Retell is sending the same body your app verifies. |
| Webhook not called | Webhook URL in Retell is correct and HTTPS; no firewall blocking Retell; deploy is up. |
| Calls not showing in app | Webhook URL correct; `RETELL_WEBHOOK_SECRET` set in production; logs for `call_ended` / `call_analysis` and any 4xx/5xx from your route. |
| **AI says "business underscore name"** | See section 10a below. |

---

### 10a. Fixing "business underscore name" greeting

If the AI literally says "business underscore name" instead of the actual business name (e.g. "Thanks for calling business underscore name"), the **shared agent's greeting placeholder isn't being substituted**.

**Root cause:** The shared agent (`RETELL_AGENT_ID`) has a greeting with a placeholder like `{{business_name}}`, but either:
1. The placeholder key doesn't match what the webhook sends, OR
2. For **conversation flow** agents, `begin_message` override doesn't replace the start node instruction

**Fix (choose one):**

**Option A: Update the shared agent's greeting to use the correct placeholder**

1. Go to **Retell Dashboard** → **Agents** → select your shared agent (`RETELL_AGENT_ID`).
2. If it's a **conversation flow** agent:
   - Edit the **conversation flow** → find the **start node** (usually "Welcome Node").
   - Change the greeting text to use `{{business_name}}` (lowercase, with underscore):
     ```
     Thanks for calling {{business_name}}! Who am I speaking with today?
     ```
   - **Save** the conversation flow.
3. If it's a **Retell LLM** (single/multi prompt) agent:
   - Edit the agent's **Begin Message** field to:
     ```
     Thanks for calling {{business_name}}! Who am I speaking with today?
     ```
   - Save the agent.
4. Test a call — the webhook sends `dynamic_variables: { business_name: "Actual Business Name" }` which Retell substitutes into `{{business_name}}`.

**Option B: Remove the greeting placeholder entirely**

If dynamic variable substitution still doesn't work, remove the placeholder and let the webhook's `begin_message` override handle it:

1. For conversation flow agents:
   - Edit the start node instruction to be **generic** (no placeholder):
     ```
     Thanks for calling! Who am I speaking with today?
     ```
   - The webhook sends `agent_override.conversation_flow.begin_message` with the actual business name. Note: this override may not work for all conversation flow configurations — test to confirm.

2. For Retell LLM agents:
   - Clear the Begin Message field or set it to empty.
   - The webhook's `agent_override.retell_llm.begin_message` will be used.

**Option C: Create a new shared agent with correct config**

1. Run `npm run create-retell-agents` to create agents per industry (see section 4a).
2. The generated agents have the business name baked into the flow (not as a placeholder).
3. For a true shared agent with dynamic names, create a new agent in Retell Dashboard with the greeting set to `{{business_name}}` and set `RETELL_AGENT_ID` to its ID.

**Debugging:**

Check Vercel logs for `Retell inbound response for business:` — this shows the business name being sent. If the name is correct there, the issue is in the Retell Dashboard agent config.

---

## 11. Retell dashboard links (typical)

- Dashboard: [retellai.com](https://www.retellai.com) (log in).
- API keys: Often under **Settings** → **API Keys** or **Developers**.
- Webhooks: Often under **Settings** → **Webhooks** or **Integrations**.
- Phone numbers: Often under **Phone Numbers** or **Numbers**.
- Voices: Often under **Voices** or **Voice** settings.

If your Retell UI differs, use their docs or in-app help to find the same concepts (API key, webhook URL/secret, numbers, voices).
