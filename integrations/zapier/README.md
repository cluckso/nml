# CallGrabbr Zapier Integration

This folder contains the Zapier platform app definition for marketplace submission.

## Setup for Users

1. Go to **Settings → CRM & Integrations** in CallGrabbr
2. Click **Generate Zapier API Key**
3. In Zapier, create a new Zap using Webhooks by Zapier or the CallGrabbr app (once published)
4. Use the API key for authentication

## REST Hook Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations/zapier/hooks` | Sample data / connection test |
| POST | `/api/integrations/zapier/hooks` | Subscribe to new lead trigger |
| DELETE | `/api/integrations/zapier/hooks?id={hookId}` | Unsubscribe |

Authentication: `Authorization: Bearer cgz_<api_key>`

## Trigger: New Lead Captured

Fires when a call ends with captured caller name, phone, or issue description.

### Payload

```json
{
  "event": "new_lead",
  "business": { "id": "...", "name": "Acme HVAC" },
  "lead": {
    "callId": "...",
    "callerName": "John Smith",
    "callerPhone": "+15551234567",
    "issueDescription": "AC not cooling",
    "summary": "...",
    "emergency": false,
    "createdAt": "2026-06-25T12:00:00.000Z"
  }
}
```

## Marketplace Submission

1. Create a Zapier Platform account at https://developer.zapier.com
2. Import `app-definition.json` as the starting point
3. Set `BASE_URL` to `https://callgrabbr.com`
4. Submit for review with:
   - App name: CallGrabbr
   - Category: Phone & SMS
   - Description: AI phone answering for contractors — send captured leads to any app

## Legacy Webhook

Users can also paste a Zapier Catch Hook URL directly in Settings → CRM → Zapier webhook URL.
