import { Prisma } from "@prisma/client"
import { formatDatabaseEnvHint } from "./database-env"

/** User-safe hint for common Prisma failures (no secrets). */
export function formatPrismaErrorHint(err: unknown): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2022") {
      const column = (err.meta as { column?: string } | undefined)?.column
      return column
        ? `Database schema is out of date (missing ${column}). Apply pending migrations to production — see DEPLOYMENT.md.`
        : "Database schema is out of date. Apply pending migrations to production — see DEPLOYMENT.md."
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.message.includes("credentials for `postgres` are not valid")) {
      return "DATABASE_URL uses username postgres on the Supabase pooler. Use postgres.[project-ref] from Supabase → Database → Connection pooling → Transaction URI."
    }
    if (err.message.includes("Authentication failed")) {
      return "Database authentication failed. Verify DATABASE_URL password and pooler username (postgres.[project-ref]) in Vercel env for the callgrabbr project."
    }
    return formatDatabaseEnvHint()
  }

  return null
}
