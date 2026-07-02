import { describe, expect, it } from "vitest"
import { FUNNEL_CONFIGS } from "@/lib/funnel/industry-configs"

describe("funnel demo transcript and SMS preview alignment", () => {
  it.each(FUNNEL_CONFIGS.map((c) => [c.slug, c] as const))(
    "%s sms preview matches transcript and call summary",
    (_slug, config) => {
      expect(config.smsPreview, `${config.slug} missing smsPreview`).toBeDefined()
      const preview = config.smsPreview!
      const transcript = config.exampleTranscript ?? ""
      const summary = config.callSummary ?? ""
      const blob = `${transcript}\n${summary}`.toLowerCase()

      expect(blob).toContain(preview.name.toLowerCase())
      expect(blob).toContain(preview.phone)
      expect(blob).toContain(preview.address.toLowerCase().replace(/\./g, ""))

      const jobKeyword = preview.job.split(/[-–]/)[0].trim().toLowerCase()
      expect(blob).toContain(jobKeyword.slice(0, Math.min(8, jobKeyword.length)))
    }
  )
})
