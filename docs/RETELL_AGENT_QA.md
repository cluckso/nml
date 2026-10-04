# Retell agent setup and QA — 2026-09-27

## Account and routing verified

- Seven industry template agents (HVAC, Plumbing, Electrician, Handyman, Auto Repair, Childcare, Generic) have valid version 0 flows. Each agent is an unpublished draft and none has a phone number assigned in this account.
- The only listed phone number is demo line `+12029526890`, bound to `agent_a44e62c554838d1ef3e8ee9cac`. The number's inbound webhook is `https://www.callgrabbr.com/api/webhooks/retell`.
- Demo agent version 11 is published and points to flow version 11. Agent version 12 and flow version 12 are drafts. Do not infer that a simulation of version 12 describes what phone callers hear on version 11.
- A production webhook ping returned HTTP 204. This only verifies reachability; signed inbound routing, call completion, SMS, and tenant assignment were not exercised.
- The local `.env` now contains `NEXT_PUBLIC_DEMO_NUMBER=+12029526890` and `RETELL_DEMO_AGENT_ID`. Its `RETELL_EXISTING_PHONE` is stale (Retell returns 404). Deployment environment values were not inspected.

## Code changes in this working tree

- Unknown, paused, and known spam inbound calls now return Retell's explicit `call_inbound.reject=true`; they cannot fall back to a number's agent.
- Removed the arbitrary active-business fallback. Business lookup uses the dialed Retell number or an explicit forwarded business number, never the caller's number.
- Demo completion recognizes the configured demo agent ID even without demo metadata. Signup inbound requires an ACTIVE business.
- Ring delay is planned after auth, lookup, capacity checks, and override construction. Elapsed processing time counts against the 10-second webhook deadline and the requested ring time, leaving 800 ms response headroom. A 10-second setting can yield about 9.2 seconds of webhook wait plus processing; carrier behavior still needs a real call.
- Shared prompt source now requires a read-back and caller response before ordinary closing. Property-service prompts tell callers reporting a gas smell to leave, avoid ignition/switches, and contact 911 or the gas utility from a safe distance before further intake.

## Text simulations

| Agent / version | Case | Result | Observation |
| --- | --- | --- | --- |
| Demo draft v12, original Flex prompt | Happy path, all details upfront, phone correction | 1/3 passed | Happy path skipped the summary; correction caller did not make a correction. |
| Demo draft v12, revised Flex prompt | Six saved cases excluding correction | 4/6 passed | Happy path, upfront details, pricing pressure, and reluctant caller passed. Auto and vague-reason cases sometimes closed without a summary; the reluctant caller was incorrectly promised a callback after refusing a number. |
| Demo draft v12, node mode trial | Four core cases | 2/4 passed | Improved auto summary, but regressed upfront details. Restored Flex Mode. |
| HVAC template draft v0 | Gas smell, before prompt edit | Failed | Did not clearly direct the caller to leave and contact emergency services. |
| HVAC template draft v0 | Gas smell, after prompt edit | Passed | Told caller to leave, avoid switches/flames, and call 911 or utility from outside; then gathered details. |
| Childcare template draft v0 | Opening for a three-year-old | Passed | Captured age, full-time care, name, and number without promising availability. |
| Auto Repair template draft v0 | No-start Honda, corrected test | Passed | Collected vehicle, issue, and phone; gave a summary without a street service address, diagnosis, or price. The original test had treated a parked-location question as a street address request. |

The two correction simulations were inconclusive: the simulated caller affirmed the agent's correct read-back despite explicit instructions to supply a correction. The newly added unreliable correction definition was removed; the pre-existing conditional definition remains. These simulations do not test speech recognition, voice quality, phone ring timing, call webhooks, or notifications.

## Release checks

1. Deploy the webhook and prompt-source changes after reviewing the working tree. Confirm deployed `NEXT_PUBLIC_DEMO_NUMBER`, `RETELL_DEMO_AGENT_ID`, and webhook signature secret/API key. Local `.env` is not proof of deployment configuration.
2. Keep demo agent v12 unpublished while the summary and no-contact cases are inconsistent. Re-run the six saved cases and conduct a controlled call to the demo line, checking opening, read-back, correction, closing, `demo_call` metadata, one labeled demo SMS, and no customer trial usage.
3. Test one number for an ACTIVE customer and one unknown/PAUSED number after deployment. Verify signed webhook response, correct tenant and agent, explicit reject for unknown/paused, ring duration, call completion, dashboard assignment, and notification delivery. No customer number exists in this Retell account today.
4. Before onboarding industry agents, verify their draft/publish status, assigned number, dynamic variables, voice, business hours, service area, and capacity overrides. Retest gas smell, flooding, sparking, no-start vehicle, and childcare availability with voice calls.
5. Do not run `setup-retell-agents.ts` or `sync-retell-agents.ts` casually against this account; they create or update flows, and stale `RETELL_EXISTING_PHONE` can misdirect setup. Review and version each change.

For each controlled call record agent and flow version, call ID, scenario, transcript, ring time, notification delivery, and resolved tenant. Retell text simulations incur usage charges; the batches above were intentionally small.
