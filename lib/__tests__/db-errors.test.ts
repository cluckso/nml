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

  it("explains wrong pooler username from Prisma init error", () => {
    const err = new Prisma.PrismaClientInitializationError(
      "Authentication failed against database server at pooler.supabase.com, the provided database credentials for `postgres` are not valid.",
      "P1000"
    )
    const hint = formatPrismaErrorHint(err)
    expect(hint).toContain("postgres.[project-ref]")
  })
})
