# Meta Instant Form → Industry Funnel

Use this when leads come from a **Meta Lead Ad instant form** and should land on the matching `/funnel/[industry]` page.

## Flow

1. **Meta form Q1** — industry multiple choice (first custom question after contact fields).
2. **Thank-you URL** — `https://www.callgrabbr.com/start` with industry + contact query params.
3. **`/start`** — resolves industry → redirects to `/funnel/{slug}?from=meta&...`.
4. **Website funnel** — skips steps Meta already collected; user only answers call volume + pain (and contact if missing).

```
Meta form (industry + contact)
        ↓
   /start?industry=hvac&name=...&email=...
        ↓
/funnel/hvac?from=meta&name=...&email=...
        ↓
 Volume → Pain → ROI / trial CTA
```

## Meta Instant Form setup

### Screen 1 — Contact (standard)

- Full name
- Email
- Phone
- Company name

### Screen 2 — Q1: Industry (custom multiple choice)

Use these **exact** answer labels (source: `META_FORM_INDUSTRY_OPTIONS` in `lib/meta-lead-routing.ts`):

| Answer label |
|--------------|
| HVAC |
| Plumbing |
| Electrical |
| Auto repair |
| Handyman |
| Roofing |
| Law firm |
| Real estate |
| Dental practice |
| Salon |
| Other home or service business |

### Thank-you screen — Website URL

Set the thank-you link to:

```text
https://www.callgrabbr.com/start?utm_source=meta&utm_medium=instant_form&utm_campaign={{campaign.name}}&industry={{What type of business do you run?}}&name={{full_name}}&email={{email}}&phone={{phone_number}}&company={{company_name}}
```

Replace `{{What type of business do you run?}}` with the **exact custom question text** from your form if Meta uses the question label as the merge token.

**If Meta does not pass custom answers in the thank-you URL:** use one of these fallbacks:

1. **Industry picker** — thank-you URL `https://www.callgrabbr.com/start?utm_source=meta&utm_medium=instant_form` (user picks industry on site).
2. **Per-industry forms** — duplicate the instant form per ad set; each thank-you URL hardcodes `industry=hvac`, `industry=plumbing`, etc.
3. **Webhook** — Meta Leads webhook → email/SMS with `buildMetaFunnelUrl()` link (future).

### Privacy / description (contact screen)

> CallGrabbr is an AI phone assistant for home and service businesses. We use your info to show a personalized missed-call ROI estimate and help you start a free trial. See our Privacy Policy at callgrabbr.com/privacy.

## Website routes

| URL | Purpose |
|-----|---------|
| `/start` | Meta router; redirects when `industry` is present, else industry picker |
| `/funnel/hvac` (etc.) | Industry-specific funnel |
| `/funnel/hvac?from=meta&...` | Skips confirm (+ contact if prefilled) |

## Query parameters

| Param | Aliases | Purpose |
|-------|---------|---------|
| `industry` | `business_type`, `vertical` | Routes to funnel slug |
| `name` | `full_name`, `contact_name` | Prefill contact |
| `email` | `contact_email` | Prefill contact |
| `phone` | `phone_number`, `contact_phone` | Prefill contact |
| `company` | `company_name`, `business_name` | Prefill business name |
| `from=meta` | — | Enables skip/prefill on funnel |

UTM params are preserved through `/start` → `/funnel/...`.

## Tests

```bash
npm test -- lib/funnel/__tests__/meta-lead-routing.test.ts
```
