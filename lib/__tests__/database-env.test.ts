import { afterEach, describe, expect, it } from "vitest"
import { getDatabaseEnvIssues } from "../database-env"

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL
const ORIGINAL_DIRECT_URL = process.env.DIRECT_URL

afterEach(() => {
  if (ORIGINAL_DATABASE_URL === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = ORIGINAL_DATABASE_URL
  if (ORIGINAL_DIRECT_URL === undefined) delete process.env.DIRECT_URL
  else process.env.DIRECT_URL = ORIGINAL_DIRECT_URL
})

describe("getDatabaseEnvIssues", () => {
  it("flags missing DATABASE_URL", () => {
    delete process.env.DATABASE_URL
    const issues = getDatabaseEnvIssues()
    expect(issues.some((issue) => issue.code === "missing_database_url")).toBe(true)
  })

  it("flags direct connection used as DATABASE_URL", () => {
    process.env.DATABASE_URL =
      "postgresql://postgres:secret@db.abcdefgh.supabase.co:5432/postgres"
    process.env.DIRECT_URL =
      "postgresql://postgres:secret@db.abcdefgh.supabase.co:5432/postgres"
    const issues = getDatabaseEnvIssues()
    expect(issues.some((issue) => issue.code === "direct_url_as_database_url")).toBe(true)
  })

  it("flags wrong pooler username", () => {
    process.env.DATABASE_URL =
      "postgresql://postgres:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    process.env.DIRECT_URL =
      "postgresql://postgres:secret@db.abcdefgh.supabase.co:5432/postgres"
    const issues = getDatabaseEnvIssues()
    expect(issues.some((issue) => issue.code === "wrong_pooler_username")).toBe(true)
  })

  it("accepts valid pooler configuration", () => {
    process.env.DATABASE_URL =
      "postgresql://postgres.abcdefgh:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    process.env.DIRECT_URL =
      "postgresql://postgres:secret@db.abcdefgh.supabase.co:5432/postgres"
    const issues = getDatabaseEnvIssues().filter((issue) => issue.severity === "error")
    expect(issues).toHaveLength(0)
  })
})
