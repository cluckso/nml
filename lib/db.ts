import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Single PrismaClient instance per process (critical for serverless: avoids "max clients" / connection exhaustion).
// In production we still attach to global so warm invocations reuse the same client.
export const db =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }))
