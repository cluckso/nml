export type DatabaseEnvIssue = {
  code: string
  message: string
  fix?: string
  severity: "error" | "warning"
}

function parseDatabaseUrl(databaseUrl: string): URL | null {
  try {
    return new URL(databaseUrl.replace(/^postgresql:/, "http:"))
  } catch {
    return null
  }
}

/** Non-secret diagnostics for DATABASE_URL / DIRECT_URL configuration. */
export function getDatabaseEnvIssues(): DatabaseEnvIssue[] {
  const issues: DatabaseEnvIssue[] = []
  const databaseUrl = process.env.DATABASE_URL?.trim()
  const directUrl = process.env.DIRECT_URL?.trim()

  if (!databaseUrl) {
    issues.push({
      code: "missing_database_url",
      message: "DATABASE_URL is not set.",
      fix: "Copy .env.example to .env and add your Supabase Transaction pooler URI (port 6543). See DATABASE.md.",
      severity: "error",
    })
    return issues
  }

  if (!directUrl) {
    issues.push({
      code: "missing_direct_url",
      message: "DIRECT_URL is not set (required for Prisma migrations).",
      fix: "Add the Supabase direct connection URI (port 5432) as DIRECT_URL. See DATABASE.md.",
      severity: "warning",
    })
  }

  const parsed = parseDatabaseUrl(databaseUrl)
  if (!parsed) {
    issues.push({
      code: "invalid_database_url",
      message: "DATABASE_URL is not a valid connection URI.",
      fix: "URL-encode special characters in the password (#, @, ?, /, %). See DATABASE.md.",
      severity: "error",
    })
    return issues
  }

  const host = parsed.hostname
  const port = parsed.port || "5432"
  const user = decodeURIComponent(parsed.username)
  const isPooler = host.includes("pooler.supabase.com") || port === "6543"
  const isDirectHost = host.startsWith("db.") && host.includes("supabase.co")

  if (isDirectHost && port === "5432") {
    issues.push({
      code: "direct_url_as_database_url",
      message: "DATABASE_URL uses the direct Supabase host (port 5432).",
      fix: "Use the Transaction pooler (port 6543, user postgres.[project-ref]) for DATABASE_URL. Keep port 5432 for DIRECT_URL only.",
      severity: "error",
    })
  }

  if (isPooler && user === "postgres") {
    issues.push({
      code: "wrong_pooler_username",
      message: "DATABASE_URL pooler username should be postgres.[project-ref], not postgres.",
      fix: "Copy the Transaction pooler URI from Supabase → Project Settings → Database → Connection pooling.",
      severity: "error",
    })
  }

  if (isPooler && !databaseUrl.includes("pgbouncer=true")) {
    issues.push({
      code: "missing_pgbouncer_param",
      message: "DATABASE_URL is missing ?pgbouncer=true.",
      fix: "Append ?pgbouncer=true (lib/db.ts auto-appends at runtime, but set it in .env and Vercel too).",
      severity: "warning",
    })
  }

  return issues
}

export function getDatabaseEnvSummary(): {
  ok: boolean
  issues: DatabaseEnvIssue[]
  errors: DatabaseEnvIssue[]
  warnings: DatabaseEnvIssue[]
} {
  const issues = getDatabaseEnvIssues()
  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warning")
  return { ok: errors.length === 0, issues, errors, warnings }
}

export function formatDatabaseEnvHint(): string | null {
  const { errors } = getDatabaseEnvSummary()
  if (errors.length === 0) return null
  const first = errors[0]
  return first.fix ? `${first.message} ${first.fix}` : first.message
}
