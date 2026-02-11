# Testing email reports

## Weekly report (Local Plus)

The weekly report is sent to **Local Plus** businesses with an active subscription. It includes usage, leads by tag, and recent calls.

### 1. Prerequisites

- **RESEND_API_KEY** in `.env.local` (get from [Resend](https://resend.com)).
- A **business** in your DB (the report uses its name and data; the recipient is set below).

**Without a verified domain:** Resend only allows sending to your **Resend account email** (the one you signed up with). Set **RESEND_TEST_TO** to that address so the test report is delivered:

```env
RESEND_TEST_TO=your-resend-account@example.com
```

**With a verified domain:** You can send to any recipient. Set **RESEND_FROM_EMAIL** to an address on your verified domain (e.g. `reports@yourdomain.com`). Then the report goes to the business owner’s email (or you can still override with `RESEND_TEST_TO` in test mode).

### 2. Test in development (no cron secret)

In development you can trigger a single report with **test mode** (bypasses auth and plan check; subject is prefixed with `[TEST]`):

**PowerShell (Windows):**
```powershell
# Replace YOUR_BUSINESS_ID with a real business id (e.g. from Prisma Studio or your DB)
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/reports/weekly?businessId=YOUR_BUSINESS_ID&test=1"
```

**Bash / cmd (curl.exe):**
```bash
curl -X POST "http://localhost:3000/api/reports/weekly?businessId=YOUR_BUSINESS_ID&test=1"
```

Example response:

```json
{
  "sent": true,
  "test": true,
  "to": "owner@example.com",
  "hint": "Check inbox for [TEST] Weekly report"
}
```

If `sent` is `false`, check server logs. Without a verified domain, set **RESEND_TEST_TO** to your Resend account email (e.g. `ststeinhoff80@gmail.com`) so the test is sent to an allowed address.

### 3. Test with cron secret (production-like)

To test the same endpoint as Vercel Cron (requires **CRON_SECRET** in env):

**PowerShell:**
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/reports/weekly?businessId=YOUR_BUSINESS_ID" -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" }
```

**Bash / cmd:**
```bash
curl -X POST "http://localhost:3000/api/reports/weekly?businessId=YOUR_BUSINESS_ID" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Without `?businessId=...`, it sends to **all** Local Plus businesses (same as cron).

### 4. Environment variables

| Variable            | Purpose |
|---------------------|--------|
| `RESEND_API_KEY`    | Required for sending (Resend dashboard). |
| `RESEND_FROM_EMAIL` | Optional. From address (e.g. verified domain). Default: `CallGrabbr <notifications@callgrabbr.com>`. |
| `RESEND_TEST_TO`    | Optional. In test mode, send the report to this email instead of the business owner. **Use your Resend account email** when you don’t have a verified domain (Resend only allows sending to that address in sandbox). |
| `CRON_SECRET`       | Required for non-test calls; set when using cron or production-like testing. |
