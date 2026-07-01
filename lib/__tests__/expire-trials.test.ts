import { describe, it, expect, vi, beforeEach } from "vitest"
import { ClientStatus } from "@prisma/client"
import { FREE_TRIAL_MINUTES } from "../plans"

vi.mock("../db", () => ({
  db: {
    business: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock("../retell", () => ({
  releaseRetellNumber: vi.fn(),
}))

const { db } = await import("../db")
const { releaseRetellNumber } = await import("../retell")
const { expireEndedTrials } = await import("../expire-trials")

describe("expireEndedTrials", () => {
  beforeEach(() => {
    vi.mocked(db.business.findMany).mockReset()
    vi.mocked(db.business.update).mockReset()
    vi.mocked(releaseRetellNumber).mockReset()
    vi.mocked(db.business.update).mockResolvedValue({} as never)
    vi.mocked(releaseRetellNumber).mockResolvedValue(undefined)
  })

  it("returns zero when no trial businesses need pausing", async () => {
    vi.mocked(db.business.findMany).mockResolvedValue([])

    const result = await expireEndedTrials()

    expect(result).toEqual({ scanned: 0, expired: 0, errors: 0 })
    expect(db.business.update).not.toHaveBeenCalled()
  })

  it("pauses expired businesses and releases their Retell numbers", async () => {
    vi.mocked(db.business.findMany).mockResolvedValue([
      { id: "b1", name: "Joe's Plumbing" },
      { id: "b2", name: "AC Pros" },
    ] as never)

    const result = await expireEndedTrials(new Date("2026-07-01T12:00:00Z"))

    expect(db.business.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ClientStatus.ACTIVE,
          OR: [
            { trialEndsAt: { lt: new Date("2026-07-01T12:00:00Z") } },
            { trialMinutesUsed: { gte: FREE_TRIAL_MINUTES } },
          ],
        }),
      })
    )
    expect(db.business.update).toHaveBeenCalledTimes(2)
    expect(releaseRetellNumber).toHaveBeenCalledWith("b1")
    expect(releaseRetellNumber).toHaveBeenCalledWith("b2")
    expect(result).toEqual({ scanned: 2, expired: 2, errors: 0 })
  })

  it("counts errors when pause fails but continues processing", async () => {
    vi.mocked(db.business.findMany).mockResolvedValue([
      { id: "b1", name: "Fail Co" },
      { id: "b2", name: "OK Co" },
    ] as never)
    vi.mocked(db.business.update)
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce({} as never)

    const result = await expireEndedTrials()

    expect(result).toEqual({ scanned: 2, expired: 1, errors: 1 })
    expect(releaseRetellNumber).toHaveBeenCalledTimes(1)
    expect(releaseRetellNumber).toHaveBeenCalledWith("b2")
  })
})
