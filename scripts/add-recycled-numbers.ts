/**
 * Add specific Retell phone numbers to the recycled pool.
 * Run: npm run db:add-recycled-numbers  (or npx tsx scripts/add-recycled-numbers.ts)
 *
 * Requires DATABASE_URL in .env. Numbers must be E.164 (e.g. +14155285675).
 */

import { readFileSync, existsSync } from "fs"
import { resolve } from "path"
import { PrismaClient } from "@prisma/client"

// Load .env then .env.local from project root (no dotenv dependency)
const root = process.cwd()
for (const file of [".env", ".env.local"]) {
  const path = resolve(root, file)
  if (existsSync(path)) {
    const content = readFileSync(path, "utf8")
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim()
      }
    }
  }
}

const NUMBERS = [
  "+14155285675",
  "+14159653498",
  "+14155982098",
  "+14159914067",
  "+14159682320",
  "+14159972506",
]

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Add it to .env (or .env.local).")
    console.error("Supabase: use the connection string from Dashboard → Settings → Database → Connection string (URI). Use your database password, not the pooler token.")
    process.exit(1)
  }
  const db = new PrismaClient()
  let added = 0
  let skipped = 0
  for (const phoneNumber of NUMBERS) {
    try {
      await db.recycledRetellNumber.upsert({
        where: { phoneNumber },
        create: { phoneNumber },
        update: {},
      })
      added++
      console.log("Added/kept:", phoneNumber)
    } catch (e) {
      skipped++
      const msg = (e as Error).message
      console.warn("Skip (duplicate or error):", phoneNumber, msg)
      if (added === 0 && skipped === 1 && (msg.includes("credentials") || msg.includes("Authentication failed"))) {
        console.error("\n→ Fix: Use Supabase Transaction pooler URI in .env (username must be postgres.[project-ref], not postgres). See DATABASE.md.")
      }
    }
  }
  console.log("\nDone. Added/kept:", added, "Skipped:", skipped)
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  const msg = (e as Error).message
  if (msg.includes("credentials") || msg.includes("Authentication failed")) {
    console.error("\n→ See DATABASE.md for Supabase: use Transaction pooler URI with postgres.[project-ref] as username.")
  }
  process.exit(1)
})
