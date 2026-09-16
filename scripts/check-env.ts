import "dotenv/config"
import { getDatabaseEnvSummary } from "../lib/database-env"

const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
] as const

const SUPABASE_KEY_ALIASES = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const

function main() {
  let failed = false

  for (const key of REQUIRED) {
    if (!process.env[key]?.trim()) {
      console.error(`✗ ${key} is not set`)
      failed = true
    } else {
      console.log(`✓ ${key}`)
    }
  }

  if (!SUPABASE_KEY_ALIASES.some((key) => process.env[key]?.trim())) {
    console.error(`✗ Set ${SUPABASE_KEY_ALIASES.join(" or ")}`)
    failed = true
  } else {
    const present = SUPABASE_KEY_ALIASES.filter((key) => process.env[key]?.trim())
    console.log(`✓ ${present.join(", ")}`)
  }

  const db = getDatabaseEnvSummary()
  for (const issue of db.errors) {
    console.error(`✗ [${issue.code}] ${issue.message}`)
    if (issue.fix) console.error(`  → ${issue.fix}`)
    failed = true
  }
  for (const issue of db.warnings) {
    console.warn(`⚠ [${issue.code}] ${issue.message}`)
    if (issue.fix) console.warn(`  → ${issue.fix}`)
  }

  if (failed) {
    console.error("\nFix the issues above. See .env.example and DATABASE.md.")
    process.exit(1)
  }

  console.log("\nEnvironment looks good for local development.")
}

main()
