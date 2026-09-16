# Case Study Brief — CallGrabbr

> **Do not ship live counters, revenue totals, or customer quotes without verified first-party data.** This doc is for outreach and a future page template only — no fabricated testimonials or metrics.

## Purpose

Document real customer outcomes for **missed-call lead capture** — not “AI receptionist” positioning. Each story follows:

**Missed calls → booked jobs → $ recovered**

## Target verticals (priority)

| Vertical | Typical missed-call moment | Job value range |
|----------|---------------------------|-----------------|
| HVAC | No-heat / no-AC after hours, on a roof mid-install | $300–$2,500+ |
| Plumbing | Burst pipe, sewer backup, wet hands / crawl space | $350–$3,000+ |
| Auto repair | Tow-in, won’t-start, shop line busy with bay full | $200–$1,500+ |

## Outreach — who to ask

- Trial users who forwarded their line and received at least one captured lead summary
- Paying customers on Basic+ with ≥30 days active
- Shops that explicitly mention a job they would have lost without CallGrabbr

**Ask (email or call):**

1. Roughly how many calls you miss per week when on jobs or after hours
2. One specific call CallGrabbr captured — what was the job, did you book it?
3. Permission to use business name, city, and trade (logo optional)
4. Whether they will share a redacted lead summary screenshot (optional)

**Do not ask for:** fabricated ROI multiples, competitor bashing, or quotes we cannot verify.

## Story structure (page template)

Use this outline when a real customer approves participation. Leave metrics blank until confirmed.

### 1. Headline (outcome-first)

`[Trade] in [City]: [X] missed-call leads captured → [Y] booked jobs`

Example pattern (fill with real numbers only):  
*“Phumbing shop in Phoenix: 12 after-hours leads in 60 days → 4 booked jobs”*

### 2. The shop (2–3 sentences)

- Trade, crew size, service area
- How they handled missed calls before (voicemail, callback chaos, spouse answering)

### 3. The problem (missed calls)

- When calls get missed (on job, ladder, after 5 PM, weekends)
- What happens today: hang-up rate, competitor dial, voicemail black hole
- **No invented stats** — use industry-typical language or their own words (with permission)

### 4. What changed (lead capture)

- Forwarding setup (delay / always-on — their choice)
- What CallGrabbr captures (name, phone, address, urgency when shared)
- How fast summaries arrive (text/email — their experience)

### 5. Booked jobs (proof)

- 1–3 specific jobs with permission to describe (e.g. “Sunday burst pipe — booked Monday AM”)
- Optional: redacted SMS summary screenshot

### 6. $ recovered (conservative)

- Sum **only confirmed booked job revenue** they agree to share
- Label as customer-reported, not CallGrabbr guarantee
- Compare to monthly plan cost if helpful — one job pays for months

### 7. CTA

- 14-day free trial · no card · `/trial/start` or `/sign-up?next=%2Ftrial%2Fstart`
- Demo: site demo line (see `DemoUnlock`)

## Page components (when ready)

| Block | Notes |
|-------|--------|
| Hero | Trade + city + outcome headline |
| Stats row | **Real counts only** — e.g. leads captured, jobs booked, $ recovered |
| Quote | **Verified quote only** — name, role, business |
| Timeline | Missed call → text summary → callback → booked |
| CTA | Trial + demo |

### ⚠️ Live counter rule

Do **not** publish sitewide “$X recovered for customers” or “X leads captured” counters until:

- Data comes from production analytics with customer consent, **or**
- Aggregates are audited and labeled “across participating customers”

Until then, use static case study pages with per-customer numbers only.

## Legal / compliance checklist

- [ ] Written permission (email reply is fine) for name, city, trade, story details
- [ ] No PII from lead summaries in public assets without redaction
- [ ] No guarantee language (“you will recover $X”) — past results only
- [ ] FTC-style disclosure if any compensation offered for participation

## File naming (future)

```
app/case-studies/[slug]/page.tsx   — one page per approved customer
docs/case-studies/[slug]-brief.md  — internal notes + approvals
```

## Status tracker (internal)

| Business | Trade | Contact | Permission | Draft | Live |
|----------|-------|---------|------------|-------|------|
| — | HVAC | — | — | — | — |
| — | Plumbing | — | — | — | — |
| — | Auto | — | — | — | — |
