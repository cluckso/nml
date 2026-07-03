# Buffer MCP — Cursor setup & campaign scheduling

Schedule **Phone Slave** and **Owner Tips** campaigns from Cursor via Buffer’s MCP server, or fall back to the npm scripts.

## 1. MCP configuration (done in repo)

Project file: [`.cursor/mcp.json`](../.cursor/mcp.json)

```json
{
  "mcpServers": {
    "buffer": {
      "type": "http",
      "url": "https://mcp.buffer.com/mcp"
    }
  }
}
```

## 2. Connect in Cursor (required once)

1. **Cursor Settings** → **Tools & MCP**
2. Find **buffer** → click **Connect**
3. Sign in to Buffer and approve access (OAuth)

Alternative (API key instead of OAuth): add to user or project MCP config:

```json
"buffer": {
  "type": "http",
  "url": "https://mcp.buffer.com/mcp",
  "headers": {
    "Authorization": "Bearer ${env:BUFFER_API_KEY}"
  }
}
```

Get a key: [publish.buffer.com/settings/api](https://publish.buffer.com/settings/api)

## 3. Verify MCP

After connecting, ask in chat:

> List all my connected Buffer channels

Or:

> Show my upcoming scheduled Buffer posts

## 4. Schedule campaigns via MCP (natural language)

Export first (generates `buffer-schedule.json` with copy + UTC times):

```bash
npm run campaign:export-tips
# or
npm run campaign:export
```

Then in Cursor (with Buffer MCP connected):

> Read `campaign-exports/owner-tips/buffer-schedule.json` and schedule each post to the matching Buffer channel at the scheduled time. Skip Google Business rows.

Or schedule a single tip:

> Schedule this to Facebook and Instagram for tomorrow 7am ET: [paste caption from playbook]

## 5. Schedule campaigns via script (Buffer MCP — recommended)

Uses **Publish API** token (`BUFFER_ACCESS_TOKEN` from [publish.buffer.com/settings/api](https://publish.buffer.com/settings/api)). The legacy REST script (`campaign:schedule-tips`) does **not** work with Publish API tokens.

```bash
npm run campaign:export-tips

# Preview
npm run campaign:schedule-mcp -- --dry-run

# Schedule (respects Buffer plan slot limit, auto-maps connected channels)
npm run campaign:schedule-mcp

# Phone Slave campaign
npm run campaign:schedule-mcp -- --json=campaign-exports/phone-slave/buffer-schedule.json
```

### Plan limits

Free Buffer plans allow **10 scheduled posts** at a time. Re-run after posts publish to queue the next batch.

### Instagram

Instagram requires at least one image. The MCP script attaches `https://www.callgrabbr.com/logo_HD.png` when scheduling Instagram rows.

### Connected channels only

Rows for LinkedIn/X are skipped until those channels are connected in Buffer. Google Business posts use the `googlebusiness` channel when connected.

## 6. Legacy REST script (deprecated)

Uses `api.bufferapp.com` — requires an **old** Buffer developer token, not the Publish API key.

```bash
npm run campaign:buffer-profiles
npm run campaign:schedule-tips -- --dry-run
```

## References

- [Buffer MCP guide](https://developers.buffer.com/guides/integrations/mcp.html)
- [Buffer + Cursor](https://developers.buffer.com/guides/integrations/cursor.html)
- [Owner Tips campaign](./OWNER_TIPS_CAMPAIGN.md)
- [Phone Slave automation](./PHONE_SLAVE_CAMPAIGN_AUTOMATION.md)
