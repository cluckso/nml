# Retell Setup for NeverMissLead-AI

This app uses [Retell AI](https://www.retellai.com/) for voice agents: when a user clicks **Connect to my call assistant**, the app creates a Retell agent and (optionally) assigns a phone number. Call events (e.g. call ended, call analysis) are sent to your app via webhooks.

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

- **Webhook URL:** Retell sends `call_ended` and `call_analysis` events here.
- **RETELL_WEBHOOK_SECRET:** Your app verifies the `x-retell-signature` header. If unset, the app only skips verification in `NODE_ENV=development`.

**Events the app handles:**

- `call_ended` – saves/updates the call, sends notifications, reports usage to Stripe, checks trial.
- `call_analysis` – same as above (analysis may arrive after call_ended).

---

## 3. Environment variables (summary)

| Variable | Required | Description |
|----------|----------|-------------|
| `RETELL_API_KEY` | Yes | Retell API key from dashboard. |
| `RETELL_WEBHOOK_SECRET` | Yes in production | Webhook signing secret from Retell; in dev, missing = no verification. |
| `RETELL_DEFAULT_AREA_CODE` | No | 3-digit US area code for new numbers (e.g. `608`). Defaults to `415` if unset. |
| `RETELL_EXISTING_PHONE` | No | E.164 number you already own in Retell (e.g. `+14157774444`). If set, the app uses `PATCH /update-phone-number/{phone_number}` to attach this number to the new agent instead of purchasing a new one. In development, a hardcoded number is used when this is unset. |
| `RETELL_API_BASE` | No | API base URL (default `https://api.retellai.com`). Phone-number purchase/update tries `https://api.retellai.com/v2` first, then this base. |

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

## 5. Phone numbers (purchased on demand)

The app **purchases a new phone number from Retell** when the user connects their call assistant. You do not need to stockpile numbers or set an AI number in onboarding.

| What | Where | Notes |
|------|--------|--------|
| Area code | Env `RETELL_DEFAULT_AREA_CODE` | 3-digit US area code (e.g. `608`). If unset, the app uses `415`. |
| Billing | Retell account | Retell charges for numbers; ensure your Retell account has billing set up. |

Onboarding only collects the user’s **existing business line** (optional), which they will forward to the AI number. The AI number is assigned after they click **Connect to my call assistant** and is shown on the dashboard.

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

## 8. Checklist (copy and use)

- [ ] Retell account created.
- [ ] API key created in Retell and set as `RETELL_API_KEY` in your app (local + production).
- [ ] In Retell, webhook URL set to `https://<your-app-domain>/api/webhooks/retell`.
- [ ] Webhook signing secret from Retell set as `RETELL_WEBHOOK_SECRET` in your app (required in production).
- [ ] (Optional) `RETELL_DEFAULT_AREA_CODE` set if you want a specific area code for new numbers (default 415). Retell account has billing set up for number purchases.
- [ ] (If needed) Voices **11labs-Chloe** and **11labs-Adam** available in your Retell account, or `lib/retell.ts` updated to use other voice IDs.
- [ ] Test: In your app, connect the call assistant; then place a test call and confirm a `call_ended` / `call_analysis` webhook hits your app and the call appears in the dashboard.

---

## 9. Troubleshooting

| Symptom | Check |
|--------|--------|
| “RETELL_API_KEY is not configured” | Env var set where the app runs (e.g. Vercel env, restart dev server after changing `.env.local`). |
| “Failed to create Retell conversation flow: …” | Error message from Retell (e.g. invalid nodes, model, or account limit). Fix payload in `lib/retell.ts` or upgrade Retell plan. |
| “Failed to create Retell agent: …” | Same: read the error from Retell (e.g. invalid `conversation_flow_id`, voice, or account). |
| Webhook returns 401 “Invalid signature” | `RETELL_WEBHOOK_SECRET` matches the secret in Retell; no extra spaces; Retell is sending the same body your app verifies. |
| Webhook not called | Webhook URL in Retell is correct and HTTPS; no firewall blocking Retell; deploy is up. |
| Calls not showing in app | Webhook URL correct; `RETELL_WEBHOOK_SECRET` set in production; logs for `call_ended` / `call_analysis` and any 4xx/5xx from your route. |

---

## 10. Retell dashboard links (typical)

- Dashboard: [retellai.com](https://www.retellai.com) (log in).
- API keys: Often under **Settings** → **API Keys** or **Developers**.
- Webhooks: Often under **Settings** → **Webhooks** or **Integrations**.
- Phone numbers: Often under **Phone Numbers** or **Numbers**.
- Voices: Often under **Voices** or **Voice** settings.

If your Retell UI differs, use their docs or in-app help to find the same concepts (API key, webhook URL/secret, numbers, voices).
