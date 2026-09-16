# Lead Capture Product Wishlist

> **Planning doc only** — no committed roadmap dates. Items below extend missed-call lead capture; they are not in active development unless promoted to a sprint.

## Positioning guardrail

CallGrabbr is **missed-call lead capture** for trades — not a generic AI receptionist. New surfaces should recover jobs (name, address, urgency, callback-ready summary), not compete on “best AI answering service.”

---

## 1. English + Spanish (EN/ES)

**Why:** Many HVAC, plumbing, and auto shops serve bilingual markets; callers hang up if they cannot explain the job in their language.

**Wishlist scope:**

- Caller-facing conversation in Spanish (and Spanglish handoff)
- Owner summaries in English (or owner-preferred language)
- Marketing site + trial/onboarding copy in ES
- SMS/email lead summaries unchanged format — language tag on lead record

**Open questions:**

- Per-business language toggle vs auto-detect
- Retell/voice provider Spanish voice quality
- Compliance copy for SMS consent in ES

---

## 2. iOS app parity

**Why:** Android/Capacitor dashboard exists; owners live on iPhone in the field.

**Wishlist scope:**

- App Store build with feature parity to `dashboard_capacitor` (leads, summaries, forwarding status, trial usage)
- Push notification on new captured lead (APNs)
- Tap-to-call back from lead card
- Same auth as web (Supabase)

**Out of scope for wishlist:** Replacing carrier forwarding setup — still web/onboarding for number provisioning.

---

## 3. ServiceTitan / Jobber / Housecall Pro — one-click

**Why:** Shops already run jobs in FSM tools; manual copy-paste from SMS summaries loses speed.

**Wishlist scope:**

- OAuth connect from CallGrabbr settings
- On each captured lead: create **lead or customer + job draft** with mapped fields:
  - Name, phone, address, issue description, urgency, preferred time (when captured)
- Idempotent webhook — no duplicate jobs on retry
- Growth/Platinum tier gate (align with existing CRM webhook positioning)

**Priority integrations:**

| Platform | Primary value |
|----------|----------------|
| ServiceTitan | Enterprise HVAC/plumbing |
| Jobber | SMB trades |
| Housecall Pro | Home services |

**Open questions:**

- Lead vs booked job — default to lead only until owner confirms
- Which plan includes which integration

---

## 4. Website widget (phone + web lead capture)

**Why:** Not every shopper calls; some submit forms after hours. Same owner inbox as phone leads.

**Wishlist scope:**

- Embeddable script / iframe for contractor sites
- Fields: name, phone, address, job description, urgency, photos (optional)
- After-hours mode: “We’ll text you a confirmation; shop will call back”
- **Click-to-call** prominent — widget reinforces phone as primary for emergencies
- Leads land in same dashboard feed as phone captures
- UTM + page URL stored on lead

**Non-goals:**

- Live chat replacement for human office staff during business hours
- Competing with full CRM web forms — minimal trade-focused intake only

---

## How to promote an item

1. Add customer quotes or support ticket volume (“N requests for Jobber”)
2. Estimate eng + compliance cost
3. Move to `PLAN_AND_IMPROVEMENTS.md` or a GitHub issue with acceptance criteria
4. Ship behind plan tier if it affects COGS (integrations, SMS, voice minutes)

---

## Related docs

- [`lib/marketing/positioning.ts`](../lib/marketing/positioning.ts) — category language
- [`docs/CASE_STUDY_BRIEF.md`](./CASE_STUDY_BRIEF.md) — proof stories (missed calls → booked jobs)
- [`docs/META_INSTANT_FORM.md`](./META_INSTANT_FORM.md) — current paid acquisition funnel
