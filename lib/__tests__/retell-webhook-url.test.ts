import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { getRetellInboundWebhookUrl } from "../retell"

describe("getRetellInboundWebhookUrl", () => {
  const original = { ...process.env }

  beforeEach(() => {
    delete process.env.RETELL_INBOUND_WEBHOOK_URL
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  afterEach(() => {
    process.env = { ...original }
  })

  it("prefers RETELL_INBOUND_WEBHOOK_URL when set", () => {
    process.env.RETELL_INBOUND_WEBHOOK_URL = "https://example.com/hook"
    expect(getRetellInboundWebhookUrl()).toBe("https://example.com/hook")
  })

  it("derives from NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.callgrabbr.com/"
    expect(getRetellInboundWebhookUrl()).toBe("https://www.callgrabbr.com/api/webhooks/retell")
  })

  it("returns undefined when no URL is configured", () => {
    expect(getRetellInboundWebhookUrl()).toBeUndefined()
  })
})
