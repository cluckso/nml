import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Supabase Transaction pooler (PgBouncer) requires ?pgbouncer=true or Prisma uses
 * prepared statements and you get errors like:
 * - prepared statement "s11" does not exist
 * - prepared statement "s20" already exists
 */
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return url

  const isSupabasePooler =
    url.includes("pooler.supabase.com") || (url.includes("supabase.co") && url.includes(":6543"))

  if (!isSupabasePooler || url.includes("pgbouncer=true")) return url

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}pgbouncer=true`
}

const databaseUrl = resolveDatabaseUrl()

// Single PrismaClient instance per process (critical for serverless: avoids "max clients" / connection exhaustion).
export const db =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }))
