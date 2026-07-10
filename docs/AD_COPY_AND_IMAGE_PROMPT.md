# CallGrabbr — Ad Copy & Ad Image Generation Prompt

> **Keep in sync with the live site** (`app/page.tsx`, `lib/pricing-catalog.ts`). Pricing: Solo $99 / Team $159 / Pro $279. Trial: 7 days, 40 minutes, no card. Lead fields are captured when callers share them — do not promise every field on every call.

## Product summary (for reference)
- **What:** Automated call answering for forwarded business lines; captures intake info and sends summaries.
- **Who:** Local service businesses (HVAC, plumbing, electrician, auto repair, childcare, handyman).
- **Trial:** 7-day free trial, 40 included minutes; ~5-minute setup; no card required to start.
- **Plans:** Solo $99 (300 min), Team $159 (800 min), Pro $279 (1,500 min). Overage $0.22/min.

---

## Ad copy

### Headlines (short)
- Never miss another call.
- Turn missed calls into booked work.
- Your call assistant. 24/7.
- No voicemail. No hold. No lost leads.
- When you don’t answer, they call the next company. We answer.

### Subheads / one-liners
- Call answering for local service businesses. Start your free trial in 5 minutes.
- Answers forwarded calls, captures lead details, sends a summary — usually within seconds.
- 24/7 when your line forwards to CallGrabbr. No voicemail black hole.
- Forward your business line. We answer, qualify, and send you what was captured.

### Short body (social / display)
- When you don’t answer, they call the next company. CallGrabbr answers forwarded calls, captures lead details when callers share them, and sends a summary by text and email — usually within seconds. Plans from $99/mo. Start your 7-day free trial, no card required.

### Long body (landing / email)
- CallGrabbr answers your business line when you forward it to us. Your call assistant greets callers, asks industry-specific questions (HVAC, plumbing, electrician, auto repair, childcare, handyman), and captures name, phone, and job details when provided. Summaries go out by email and SMS based on your settings; CRM webhook on Team and Pro. Setup takes about 5 minutes. Start with a 7-day free trial — no credit card required.

### CTA phrases
- Start free trial
- Activate CallGrabbr
- Get your forwarding number
- Try free — 7-day trial

---

## Visual brand (ad creatives)

Match the approved CallGrabbr poster style — **not** photorealistic contractor job-site photos.

| Element | Spec |
|---------|------|
| **Background** | Deep navy-to-midnight blue gradient (`#0f172a` → `#1e3a8a`), subtle dot grid or circuit pattern |
| **Accent** | Electric / neon blue glow (`#2563eb`, `#3b82f6`), soft lens flare bottom-right |
| **Typography** | Bold modern sans-serif; white headlines with key words in bright blue gradient |
| **Hero graphic** | Glossy 3D blue headset with phone icon, OR smartphone mockup showing a “New Lead” card |
| **Supporting** | Neon blue soundwave across mid-frame; circular glowing blue icon badges (headset, clipboard, chat, calendar) |
| **Mood** | High-tech B2B SaaS, trustworthy, 24/7 AI call assistant — not stock photo tradespeople |
| **Text in image** | Add headlines/CTA in **Canva** after generation; keep AI output mostly visual (or use very short placeholder text only) |

**Prodia:** FLUX.2 Dev + `photographic` or `cinematic` (if too warm, stick to default) · guidance **4–5** · 1024×1024 or 1024×1280 · polish winners on FLUX.2 Pro.

**Negative prompt (SDXL):** `photorealistic contractor, job site, ladder, workshop, warm orange lighting, cartoon, anime, cluttered text, watermark, logo, low quality`

---

## Ad image generation prompt (base style)

Append this block to every variant prompt below:

> CallGrabbr brand style: professional B2B SaaS marketing poster, dark navy blue gradient background with subtle dot grid, neon electric blue glow accents and soundwave graphic, glossy 3D blue headset or smartphone hero, circular glowing blue feature icons, modern clean layout, high contrast white and blue typography area left empty for overlay, lens flare, futuristic trustworthy tech aesthetic, square 1:1 composition, no watermarks

**Short base (token limits):**
> Dark navy SaaS ad poster, neon blue glow, 3D headset or phone mockup, soundwave, glowing blue icons, no watermarks, 1:1

---

## Placement notes
- **Meta (Facebook/Instagram):** Use headline + short body + CTA; image 1:1 or 4:5.
- **Google Search:** Headlines ≤ 30 chars where possible; descriptions ≤ 90 chars.
- **LinkedIn:** More B2B tone; stress “local service businesses” and “lead capture.”
- **Image:** On-brand poster art; **copy lives in Meta fields** — overlay only a short hook in Canva if needed.

---

## Video ad scripts (15 seconds)

### Script 1: Your Phone Is Losing You Jobs (Highest Conversion)

**Format:** Vertical 9:16 for Facebook/Instagram Reels
**Duration:** 15 seconds
**Psychological triggers:** Loss aversion, self-recognition, instant relief

| Time | Visual | Text/Caption | Audio |
|------|--------|--------------|-------|
| 0-2s | Phone ringing, screen flash | YOUR PHONE IS LOSING YOU JOBS (red, bold) | Loud alarm-style ring |
| 2-5s | Contractor on ladder, phone ringing in pocket | You can't answer every call. | Phone keeps ringing |
| 5-7s | Phone leaks flying dollar bills, money flies away | 28% of business calls go unanswered. | Cash flutter sound |
| 7-10s | Competitor phone shows CallGrabbr AI answering | AI: Thanks for calling! What's the address? | AI voice, natural |
| 10-12s | Phone screen: instant lead card | Contractor receives text notification | Notification ding |
| 12-15s | Logo on black | Stop Losing Leads. We answer when you can't. | - |

**Production notes:**
- Fast cuts (0.7-1 sec)
- Bold mobile-readable captions
- Start with money loss, not AI explanation

---

### Script 2: @supasteveman Variant (Viral Hook)

**Format:** Vertical 9:16
**Duration:** 15 seconds
**Psychological triggers:** Competence contrast, humor, loss visualization

| Time | Visual | Text/Caption | Audio |
|------|--------|--------------|-------|
| 0-3s | @supasteveman throwing objects perfectly into targets | THIS GUY NEVER MISSES. | Energetic music |
| 3-5s | Hard cut: Contractor on ladder, phone ringing | BUT YOUR BUSINESS PHONE DOES. | Phone ringing |
| 5-7s | Cash flies out of phone toward competitor | 28% of calls go unanswered. | Cash flutter |
| 7-10s | Competitor phone: AI answering, asks for address | - | AI voice |
| 10-12s | Lead card appears, contractor gets text | - | Notification |
| 12-15s | Logo + CTA | Stop Losing Leads. CallGrabbr.com | - |

**Why this converts:** Pattern interrupt with humor lowers resistance.

---

### Script 3: Competitor Stealing Calls

**Format:** Vertical 9:16
**Duration:** 15 seconds
**Psychological triggers:** Competitor threat, neighbor theft framing

| Time | Visual | Text/Caption | Audio |
|------|--------|--------------|-------|
| 0-2s | Split screen: You on job vs Competitor nearby | When you miss a call... | Phone ringing |
| 2-5s | Your phone goes to voicemail, money birds fly out | ...they don't leave a message. | Voicemail beep |
| 5-8s | Money birds fly to competitor | They call the next listing. | Phone rings |
| 8-11s | Competitor phone: AI captures the lead | Your missed call is their next job. | AI voice |
| 11-15s | Your phone: missed call. His: new lead. | Stop Losing Leads. CallGrabbr.com | - |

**Key message:** Your missed call is their next job.

---

## Static ad image prompts (A/B test variants)

Pair each image with the ad copy from the Meta A/B kit. Add headline + CTA in Canva using brand fonts/colors.

### Image 1 — Problem / loss (pairs with Ad A, H1–H3)

**Concept:** “Every call is an opportunity” — opportunity slipping away, 24/7 answer.

**Full prompt:**
> Professional CallGrabbr B2B SaaS marketing poster, dark navy blue gradient background with subtle dot grid and neon electric blue soundwave across center, large glossy 3D blue wireless headset with glowing phone icon inside a circular blue ring on the right, soft blue lens flare lower right, left side reserved for bold headline typography (leave text area clean), four small circular glowing blue icon badges stacked vertically suggesting never miss a call and instant notifications, futuristic trustworthy tech aesthetic, high contrast white and electric blue color scheme, square 1:1, no watermarks, no readable body copy baked in

**Canva overlay:** `Stop losing $500 jobs to voicemail` · CTA `Start Your Free Trial Today!`

---

### Image 2 — Benefit / ROI (pairs with Ad B)

**Concept:** “Never miss another lead” — phone mockup with captured lead details.

**Full prompt:**
> Professional CallGrabbr B2B SaaS marketing poster, dark navy gradient background with digital network grid and neon blue soundwave, centered modern smartphone mockup showing a clean “New Lead” notification card UI with fields for name phone address service needed and urgency high, glowing electric blue accent on key UI elements, four circular glowing blue icon badges in a row below phone (headset AI answers, clipboard captures details, chat bubble instant text, calendar follow up on your schedule), bold headline area at top left empty for overlay, neon blue glow and lens flare, square 1:1, no watermarks, no tiny illegible text

**Canva overlay:** `One captured job pays for months` · subline `24/7 AI Call Assistant`

---

### Image 3 — Competitor steal (pairs with H2: “Your missed call = their next job”)

**Concept:** Split-panel — missed call vs lead captured.

**Full prompt:**
> CallGrabbr branded split-panel SaaS ad poster, dark navy blue background, LEFT panel dimmer with red-tinted missed call notification on smartphone and fading opportunity metaphor, RIGHT panel bright with electric blue glow showing smartphone “New Lead” success state and glowing checkmark, neon blue soundwave connecting both panels, glossy 3D blue headset icon centered between panels, circular glowing blue icons, modern B2B tech marketing style, square 1:1, high contrast, no watermarks, headline area blank for Canva text

**Canva overlay:** `Your missed call = their next job`

---

### Image 4 — Voicemail graveyard / scroll-stopper (pairs with Ad A short, Reels thumbnail)

**Concept:** Voicemail failure vs AI answer — still on-brand, not photorealistic.

**Full prompt:**
> CallGrabbr branded dark SaaS ad poster, navy blue gradient background, stylized smartphone showing voicemail inbox filling with cobweb and dust metaphor on left half in muted gray, right half bright electric blue glow with AI headset icon and incoming call answered state, neon blue soundwave divider, circular glowing blue feature icons, dramatic contrast between dead voicemail and active AI assistant, futuristic marketing graphic not photorealistic, square 1:1, no watermarks

**Canva overlay:** `80% won't leave voicemail` · `We answer when you can't`

---

### Image 5 — Feature grid / trust (pairs with Advantage+ headline tests H4–H6)

**Concept:** Matches second reference creative — icon row + 24/7 banner.

**Full prompt:**
> CallGrabbr B2B SaaS marketing poster, dark navy background with subtle grid, large bold headline zone at top (empty for overlay), row of four circular glowing electric blue icons with soft 3D depth (headset, clipboard, chat bubble, calendar), neon blue soundwave behind icons, smartphone mockup on right showing lead summary notification, bottom banner area with rounded blue border glow reserved for CTA button overlay, lens flare, square 1:1, no watermarks

**Canva overlay:** `Built for HVAC & plumbing shops` · `7-day free trial — no card`

---

### Image 6 — Vertical Reels end card (9:16)

**Full prompt:**
> Vertical 9:16 CallGrabbr branded end card, dark navy gradient, large glowing 3D blue headset with phone icon center frame, neon blue soundwave, electric blue lens flare, minimal clean space at bottom third for CTA text overlay, futuristic B2B SaaS style, no watermarks

**Canva overlay:** `7-day free trial · No card · callgrabbr.com`

---

## Meta A/B Reels — 15s video prompts (3 angles)

Pairs with the three static creatives: **Voicemail loss**, **Competitor steal**, **Family time**.

**Shared specs**

| Setting | Value |
|---------|--------|
| Format | Vertical **9:16** (1080×1920) |
| Duration | **15 seconds** |
| Pace | Fast cuts **0.7–1.0s** per scene |
| Captions | Bold white text, **red accent** on hook line only; mobile-readable, centered lower third |
| Brand | Dark navy UI (`#0f172a`), electric blue glow (`#3b82f6`) on CallGrabbr moments |
| Style | Stylized / motion-graphic — **not** photorealistic job-site footage |
| Audio | Phone ring → cash flutter (loss scenes) → notification ding → subtle upbeat outro |
| End card | CallGrabbr logo + `7-day free trial · No card` |

**Shared negative prompt (video gen):**
`photorealistic contractor, job site, ladder, workshop, warm orange lighting, cartoon anime, shaky handheld, cluttered tiny text, watermark, logo distortion, low quality, stock footage people`

**Base style suffix (append to every scene prompt):**
`Vertical 9:16, dark navy CallGrabbr B2B SaaS aesthetic, electric blue neon accents, stylized motion graphics not photorealistic, bold caption-safe lower third, no watermarks`

---

### Reels 1 — Voicemail loss (pairs with static Creative 1)

**Hook:** Stop losing leads to voicemail  
**Meta headline:** Stop Losing Leads to Voicemail  
**UTM content:** `h1-reels`

| Time | Visual | On-screen caption |
|------|--------|-------------------|
| 0–2s | Phone ringing, red screen flash | **YOUR PHONE IS LOSING YOU JOBS** |
| 2–5s | Stylized silhouette on ladder, phone vibrating in pocket | You can't answer every call. |
| 5–7s | Voicemail inbox filling with cobweb/dust metaphor; dollar bills drift away | 80% won't leave voicemail. |
| 7–10s | Split: dead voicemail (gray) vs CallGrabbr answering (blue glow) | AI: Thanks for calling! What's the address? |
| 10–12s | Smartphone: clean New Lead card (name, phone, urgency) | Lead texted in seconds. |
| 12–15s | Logo end card on navy | Stop Losing Leads to Voicemail |

**Full generative prompt (Runway / Kling / Pika — paste as one block or per scene):**
```
Vertical 9:16, 15 seconds total, fast cuts 0.7s each, CallGrabbr ad. Scene 1: smartphone ringing alarm red pulse, bold caption zone YOUR PHONE IS LOSING YOU JOBS. Scene 2: stylized trade worker silhouette on ladder phone vibrating pocket not photorealistic. Scene 3: voicemail inbox UI with cobweb dust metaphor muted gray-red dollar bills floating away. Scene 4: split screen left gray dead voicemail right bright electric blue glow glossy headset AI answering speech bubble Thanks for calling whats the address. Scene 5: smartphone New Lead notification card name phone urgency high. Scene 6: dark navy end card CallGrabbr logo glow 7-day free trial no card. Dark navy and electric blue brand, bold white captions red hook accent, motion graphic SaaS style not photorealistic job site, no watermarks.
```

---

### Reels 2 — Competitor steal (pairs with static Creative 2)

**Hook:** Your missed call = their next job  
**Meta headline:** They Called. You Didn't Answer.  
**UTM content:** `h4-reels`

| Time | Visual | On-screen caption |
|------|--------|-------------------|
| 0–2s | Split screen: you on job (left) vs competitor van/logo (right) | When you miss a call... |
| 2–5s | Your phone → voicemail; stylized money/opportunity birds fly out | ...they don't leave a message. |
| 5–8s | Birds fly to competitor's phone; Google search "HVAC near me" scroll | They call the next listing. |
| 8–11s | Competitor phone: blue AI glow, lead captured checkmark | **Your missed call is their next job.** |
| 11–13s | Side-by-side: your phone missed call / their phone New Lead | Stop losing jobs to voicemail. |
| 13–15s | Logo end card | 7-day free trial · callgrabbr.com |

**Full generative prompt:**
```
Vertical 9:16, 15 second Meta ad, split-screen competitor narrative. Scene 1: split panel stylized worker on job left competitor shop right phone ringing. Scene 2: missed call notification red tint money birds flying away from smartphone. Scene 3: birds fly toward second phone Google listing scroll stylized. Scene 4: competitor smartphone electric blue glow AI headset New Lead success checkmark captured lead card. Scene 5: side by side your phone missed call their phone new lead green check. Scene 6: CallGrabbr logo end card navy background 7-day free trial no card. Bold captions each beat, dark navy electric blue CallGrabbr brand, motion graphic not photorealistic, no watermarks.
```

---

### Reels 3 — Family time (pairs with static Creative 3)

**Hook:** Get your family time back  
**Meta headline:** Get Your Family Time Back  
**UTM content:** `h2-reels`

| Time | Visual | On-screen caption |
|------|--------|-------------------|
| 0–3s | Family dinner table, phone buzzing on counter (stylized, warm but not stock photo) | **YOU'RE AT DINNER. YOUR BUSINESS LINE ISN'T.** |
| 3–6s | Owner glances at phone — conflicted; notification badges pile up | Miss it = lost job. Answer it = never off. |
| 6–10s | Phone forwards to CallGrabbr — blue glow, AI answers calmly | CallGrabbr answers. Captures the lead. |
| 10–13s | Single clean lead text; owner smiles, puts phone face-down | Lead texted in seconds. You stay present. |
| 13–15s | Logo end card | Get Your Family Time Back · Free trial |

**Full generative prompt:**
```
Vertical 9:16, 15 second emotional relief ad for local service business owners. Scene 1: stylized family dinner table warm tones phone buzzing on counter many notification badges not photorealistic. Scene 2: conflicted glance at phone stress captions Miss it lost job Answer it never off. Scene 3: transition to dark navy CallGrabbr UI electric blue glow headset AI answering call smoothly. Scene 4: calm single New Lead notification owner smiles puts phone face down relief. Scene 5: CallGrabbr logo end card Get Your Family Time Back 7-day free trial no card. Bold mobile captions, trustworthy not corporate, stylized motion graphic not stock photo tradespeople, no watermarks.
```

---

### Reels production checklist

1. Generate clips **per scene** (6 scenes × ~2.5s) if your tool caps at 5s — stitch in CapCut/DaVinci.
2. Burn in captions in CapCut (white bold, black stroke, red on hook only).
3. Add SFX: ring (0s), voicemail tone (5s), cash flutter (5–7s), notification ding (10–12s).
4. Optional voiceover on 7–10s only — keep music low under VO.
5. Export **H.264**, 1080×1920, under 4GB for Meta.
6. Use same primary text + CTA as static ads; only swap creative + `utm_content` to `h1-reels` / `h4-reels` / `h2-reels`.

**Defer Reels in Ads Manager until a static winner emerges** (Week 3+ per lean $15/day plan) — produce these now so they're ready to drop in.

---

## A/B pairing guide

| Ad | Headline | Static image | Reels | Canva overlay focus |
|----|----------|--------------|-------|---------------------|
| A (voicemail) | Stop Losing Leads to Voicemail | Creative 1 / Image 4 | Reels 1 | Loss + trial CTA |
| D (competition) | They Called. You Didn't Answer. | Creative 2 / Image 3 | Reels 2 | Competitor steal |
| B (family) | Get Your Family Time Back | Creative 3 | Reels 3 | We answer. You live. |
| C (short/Reels) | Never miss another lead | Image 6 + video script | — | Minimal end card |
| Headline test | H1–H6 | Image 1, 3, or 5 | — | Swap headline only |
