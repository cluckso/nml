# CallGrabbr Brand Voice Guidelines

**Purpose:** Keep marketing, product UI, support, ads, and social content sounding like one company — clear, trade-aware, and honest about what the product does.

**Audience:** Owners and operators of local service businesses (HVAC, plumbing, electrical, auto repair, handyman, and adjacent trades). They are busy, skeptical of hype, and care about lost jobs more than “AI innovation.”

**Last updated:** July 2026 · Align with `lib/trial-marketing.ts` and `docs/AD_COPY_AND_IMAGE_PROMPT.md` for canonical trial/pricing facts.

---

## Brand essence

| | |
|---|---|
| **What we are** | A call answering service that captures leads when you can’t pick up — and texts/emails you what was captured. |
| **What we’re not** | A full receptionist replacement, scheduling guarantee, or magic revenue machine. |
| **Core promise** | **We answer when you can’t and send you the lead in seconds.** |
| **Emotional hook** | Freedom from the phone + fear of losing the next job to whoever answers first. |

Lead with **lost revenue and missed calls**, not technology. AI is the *how*, not the *why*.

---

## Voice in four words

**Direct · Trade-smart · Reassuring · Honest**

### Direct
- Short sentences. Active voice. Say what happens.
- ✅ “We answer forwarded calls and text you the lead.”
- ❌ “Leverage our AI-powered communication solution to optimize lead capture workflows.”

### Trade-smart
- Use their world: job site, ladder, after-hours, emergency call, quote, dispatch, peak season.
- Name industries and scenarios they recognize.
- ✅ “When the AC dies at 95°, homeowners call the next contractor.”
- ❌ “Optimize your omnichannel customer acquisition funnel.”

### Reassuring
- Calm, capable, no panic — like a good front-desk person.
- Acknowledge the problem without shaming them.
- ✅ “You can’t answer every ring while you’re on a job. That’s normal.”
- ❌ “You’re bleeding money because you’re bad at phones.”

### Honest
- Don’t over-promise fields, outcomes, or availability.
- Use “when callers share them,” “usually within seconds,” “based on your settings.”
- Never claim 100% capture, guaranteed bookings, or that every call includes every field.

---

## Tone spectrum

Adjust tone by context — voice stays the same.

| Context | Tone | Example |
|---------|------|---------|
| Homepage / ads | Urgent, punchy, loss-focused | “80% won’t leave voicemail — they call the next business.” |
| Funnel / industry pages | Specific, empathetic, ROI-aware | “28% of HVAC calls go unanswered during peak season.” |
| Product UI / dashboard | Clear, instructional, neutral | “Forward unanswered calls to your CallGrabbr number.” |
| Help / FAQ | Patient, factual, step-by-step | “You keep your existing number. Set up forwarding from your carrier.” |
| Support / email | Human, solution-oriented | “Here’s how to confirm forwarding is working.” |
| Social (Phone Slave campaign) | Blunt, relatable, slightly irreverent | “You wanted to be your own boss. Now you’re a slave to your phone.” |

**Social can be edgier than the website.** The site and product should stay trustworthy and plain-spoken.

---

## Messaging hierarchy

When space is tight, lead in this order:

1. **Pain** — missed calls, voicemail, competitor gets the job  
2. **Mechanism** — answers forwarded calls, asks trade-relevant questions  
3. **Outcome** — lead summary by text/email (what was captured)  
4. **Proof / specificity** — industry, urgency, address, example transcript  
5. **CTA** — free trial, no card, ~5-minute setup  

**Hero formula (proven on site):**  
`[Pain headline]` → `[What we do in one line]` → `[How it works briefly]` → `[Who it’s for]` → `[CTA + trial terms]`

---

## Words we use

### Product & feature language
| Use | Avoid |
|-----|-------|
| Call assistant / call answering | Virtual assistant, bot, AI receptionist (in customer-facing copy) |
| Answers (when you forward / when you miss) | Replaces your phone, answers all your calls (unless true for their routing) |
| Captures / collects lead details | Scrapes, mines data |
| Text or email summary | Real-time intelligence dashboard |
| Forward your existing line | Get a new business number (they keep their number) |
| Industry-specific intake / questions | Generic script, one-size-fits-all |
| Lead, job, call, customer | User, prospect, conversion event |
| After-hours, on the job, emergency | Off-peak engagement window |

### Stats (use consistently — cite source in long-form only)
- **80%** of callers won’t leave voicemail (they call the next business)
- **28%** of business calls go unanswered (general / peak-season HVAC context)
- **5–15%** leave voicemail vs **80–95%** answered live (voicemail vs live comparison on homepage)
- Voicemail captures **5–15%** of callers

Don’t invent new stats in ads without adding them here first.

### Canonical trial & pricing (single source: `lib/trial-marketing.ts`, `lib/plans.ts`)
- **7-day** free trial  
- **40** included call minutes on trial  
- **No credit card** required to start trial  
- **~5 minutes** setup (forward your line)  
- Plans from **$99/mo** (Solo Owner)  
- **30-day** money-back guarantee (paid subscribers — support/marketing policy)

Use helpers like `trialSummaryShort()` in code — don’t hardcode “14-day” or old minute caps in new copy.

---

## Words & phrases to avoid

| Avoid | Why | Say instead |
|-------|-----|-------------|
| AI / artificial intelligence (customer-facing) | Trades don’t buy “AI”; it triggers skepticism | “Call assistant,” “answers your line,” “natural conversation” |
| Virtual assistant, automated system | Same — also banned in live call scripts | “Thanks for calling [business]” |
| Guaranteed bookings / appointments | We intake; we don’t promise scheduling | “Captures appointment preferences when callers ask” |
| Never miss a call (absolute) | Depends on forwarding setup | “Stop losing jobs to voicemail,” “answer when you can’t” |
| Every field, every time | Callers don’t always share everything | “Captures name, phone, and job details **when provided**” |
| Disruptive, revolutionary, game-changing | Empty SaaS speak | Show the mechanic: answer → ask → text |
| Synergy, leverage, optimize, solution | Corporate noise | Plain verbs: answer, capture, send, forward |
| Cheap / free forever | Undermines value | “Free trial,” “plans from $99/mo” |

**In-product AI disclosure:** Follow legal/policy requirements; marketing voice still prefers “call assistant” over “AI bot.”

---

## Grammar & style

- **American English** — color, forward, license.
- **Headlines:** Sentence case or title case; be consistent within a page. Prefer strong verbs: *Stop*, *Capture*, *Answer*, *Turn*.
- **Numbers:** Use numerals for stats and prices (`7-day`, `$99`, `28%`). Spell out one–nine only in flowing prose when it reads better.
- **Contractions:** Yes in marketing and social (“you’re,” “we’ll,” “don’t”). Fine in UI for warmth; avoid in legal/billing fine print.
- **Emoji:** Sparingly on social (👋 ✅ 👉). Rarely on homepage, never in dashboard or transactional email.
- **Oxford comma:** Yes.
- **Exclamation points:** One per post max. Never stack!!!

---

## Industry-specific copy

Speak **their** emergency, not generic “customer service.”

| Industry | Pain hooks | Example scenario |
|----------|------------|------------------|
| HVAC | No heat, no AC, peak season, on a roof | “AC out at 95° — they call the next guy.” |
| Plumbing | 2 AM leak, active drip, no voicemail | “Burst pipe can’t wait for you to finish a job.” |
| Electrical | Burning smell, partial outage, safety | “Sparking outlet — urgency matters.” |
| Auto repair | Under the hood, roadside, won’t start | “Capture year/make/model while techs are busy.” |
| Handyman | On a ladder, solo operator | “Three to five missed calls a day adds up.” |

Industry funnel pages (`/funnel/[industry]`) should keep **transcript, lead summary, and SMS preview aligned** — same names, addresses, and job types.

---

## CTAs

**Primary:** Start free trial / Start free 7-day trial  
**Secondary:** View pricing / Subscribe from $99/mo / Try a demo call  
**Funnel close:** Free trial (no card) + Subscribe — 30-day guarantee  

CTA rules:
- Pair trial CTA with **no card** when space allows.
- Don’t use “Buy now” for trial — use **Start** or **Try**.
- “Activate CallGrabbr” is OK post-signup, not cold traffic.

---

## Channel cheat sheet

### Website & funnels
- Pain-first headline, trade-specific subhead.
- Short paragraphs (2–3 lines max on mobile).
- Bullet lists for setup steps and captured fields.
- Always include trial terms near primary CTA.

### Paid ads (Meta, Google)
- Hook in first line: money lost or competitor wins.
- One clear CTA URL: `callgrabbr.com/sign-up` or industry funnel with UTMs.
- Image text optional: `STOP LOSING JOBS TO VOICEMAIL` — not required if caption carries message.

### Social
- First line must work as a scroll-stopper alone.
- “Phone Slave” campaign tone: self-deprecating trade humor → pivot to fix → trial.
- End with link + “drop your trade in the comments” for engagement posts.

### Email & lifecycle
- Subject lines: specific outcome or question (“Still losing after-hours calls?”).
- Body: one problem, one solution, one CTA.
- Sign-off: human name when possible, not “The CallGrabbr Team” every time.

### In-app / dashboard
- Instructional, second person (“Forward calls to this number”).
- Errors: what happened + what to do next — no blame.
- Empty states: one sentence of context + one action button.

### Support
- Mirror customer urgency without matching panic.
- Confirm setup facts (forwarding, number, plan) before troubleshooting AI behavior.
- Escalate billing with guarantee policy language from `moneyBackGuaranteeLabel()`.

---

## Live call voice (product behavior)

Marketing voice and **phone voice** should feel like the same company. The receptionist persona in `config/agent-prompt.ts`:

- Warm, calm, human — “smile in the voice”
- One question at a time; brief acknowledgments (“Got it,” “Thanks”)
- Never says “virtual assistant,” “AI,” or “automated system”
- Does not quote prices, promise schedules, or give repair advice
- Collects reason for call **before** address when possible
- Pushes back on vague answers (“something’s wrong”) with one polite follow-up

Website copy should not promise behavior the agent prompt forbids.

---

## Compliance & claims checklist

Before publishing, verify:

- [ ] Trial length and minutes match `TRIAL_DAYS` / `FREE_TRIAL_MINUTES`
- [ ] Pricing matches `lib/pricing-catalog.ts` / live pricing page
- [ ] Lead capture claims use “when provided” / “when callers share” where appropriate
- [ ] No guaranteed outcomes (bookings, revenue, response times as absolutes)
- [ ] “24/7” only when describing availability **after forwarding is set up**
- [ ] Testimonials are labeled honestly (real customer or clearly marked example)
- [ ] Competitor comparisons are factual, not defamatory

---

## Examples

### ✅ On-brand
> **Headline:** Stop Losing HVAC Jobs to Voicemail  
> **Sub:** When the AC goes out, homeowners call the next contractor. CallGrabbr answers forwarded calls 24/7 and texts you name, phone, address, and urgency — usually within seconds.  
> **CTA:** Start free 7-day trial · No card required

### ❌ Off-brand
> **Headline:** Revolutionary AI-Powered Virtual Receptionist  
> **Sub:** Our cutting-edge NLP platform leverages machine learning to optimize your customer journey and maximize ROI across all touchpoints.  
> **CTA:** Deploy Now

### ✅ On-brand (social)
> You didn’t start your business to stare at your phone all day.  
> Miss one call on a job site and you might lose a $500 job to whoever picks up first.  
> CallGrabbr answers when you can’t. 7-day trial, no card. → callgrabbr.com

### ❌ Off-brand (social)
> 🚀 Excited to announce our AI SaaS is LIVE!!! Disrupting the $47B telecom industry with blockchain-ready voice agents!!! DM for alpha access 🔥🔥🔥

---

## Brand colors & logo

**Visual source of truth:** `public/brand_ref.png` — open this file before creating any marketing graphic. If anything in this doc disagrees with the reference image, **the image wins**.

Canonical tokens live in `lib/brand.ts`. Cursor rule: `.cursor/rules/callgrabbr-brand.mdc`.

### Colors (dark marketing default)

| Role | HEX | Use |
|------|-----|-----|
| Background | `#050B18` | Social cards, ad canvas, slide backgrounds |
| Surface | `#0A1224` | Quote/tip cards, elevated panels |
| Primary | `#3B8FF6` | CTAs, links, key numbers |
| Text | `#F1F5F9` | Headlines and body on dark |
| Muted | `#94A3B8` | Secondary lines, captions |
| Urgent | `#DC2626` | Missed-call / loss stats (sparingly) |
| Hero gradient | `#67E8F9` → `#60A5FA` → `#A78BFA` | Accent words in headlines only |

Site UI also has a light theme (`app/globals.css`), but **paid social and ads use dark navy** to match `brand_ref.png`.

### Logo files (strict)

| File | Use |
|------|-----|
| `public/brand_ref.png` | **Reference board only** — not for publication |
| `public/logo_HD.png` | Ads, print, large placements |
| `public/logo.png` | Web, email headers |
| `public/icon.png` / `public/logo_icon.png` | Favicon, avatars, small marks |

**Rules:** Official PNGs only · dark navy background · no recolor/stretch/crop · clear space around wordmark · spell **CallGrabbr** (one word, capital C and G).

---

## Quick reference card

```
WHO:     Local service business owners (trades first)
PAIN:    Missed calls → competitor gets the job
PROMISE: Answer when you can't → text the lead in seconds
PROOF:   Industry scenarios, stats, sample transcripts
TONE:    Direct, trade-smart, reassuring, honest
SAY:     Call assistant, capture, forward, lead, job
DON'T:   AI bot, guaranteed bookings, corporate jargon
CTA:     7-day free trial · No card · ~5 min setup
```

---

## Related docs

- `docs/AD_COPY_AND_IMAGE_PROMPT.md` — headlines, bodies, image prompts  
- `docs/SOCIAL_MEDIA_LAUNCH_PLAN.md` — post templates and cadence  
- `docs/OWNER_TIPS_CAMPAIGN.md` — daily educational social campaign  
- `lib/trial-marketing.ts` — canonical trial/guarantee strings (use in code)  
- `config/agent-prompt.ts` — live call persona and guardrails  
- `lib/funnel/industry-configs.ts` — industry funnel copy  
- `lib/brand.ts` — colors, logo paths, brand reference  

When copy conflicts, **product/legal truth wins** — then update this doc.
