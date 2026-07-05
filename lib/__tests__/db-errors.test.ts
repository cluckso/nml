import { Prisma } from "@prisma/client"
import { describe, expect, it } from "vitest"
import { formatPrismaErrorHint } from "../db-errors"

describe("formatPrismaErrorHint", () => {
  it("explains missing column schema drift", () => {
    const err = new Prisma.PrismaClientKnownRequestError("column missing", {
      code: "P2022",
      clientVersion: "5.22.0",
      meta: { column: "Call.capacityDeclineSmsSent" },
    })
    const hint = formatPrismaErrorHint(err)
    expect(hint).toContain("Call.capacityDeclineSmsSent")
    expect(hint).toContain("migrations")
  })
})
