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
    return formatDatabaseEnvHint()
  }

  return null
}
