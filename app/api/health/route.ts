import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getDatabaseEnvSummary } from "@/lib/database-env"

export async function GET() {
  const env = getDatabaseEnvSummary()

  if (!env.ok) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database environment misconfigured",
        issues: env.errors.map((issue) => ({
          code: issue.code,
          message: issue.message,
          fix: issue.fix,
        })),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }

  try {
    await db.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: "healthy",
      warnings: env.warnings.map((issue) => ({
        code: issue.code,
        message: issue.message,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Database connection failed",
        hint: "Confirm DATABASE_URL uses the Supabase Transaction pooler (port 6543). See DATABASE.md.",
        warnings: env.warnings.map((issue) => ({
          code: issue.code,
          message: issue.message,
        })),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
