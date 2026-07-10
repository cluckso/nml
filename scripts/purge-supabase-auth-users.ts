/**
 * Purge all Supabase auth users and app User rows (testing / reset).
 * Usage: npx tsx scripts/purge-supabase-auth-users.ts --confirm
 */
import { createAdminClient } from "../lib/supabase/admin"
import { db } from "../lib/db"

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error("Refusing to run without --confirm")
    console.error("Usage: npx tsx scripts/purge-supabase-auth-users.ts --confirm")
    process.exit(1)
  }

  const admin = createAdminClient()
  let page = 1
  let deletedAuth = 0
  const perPage = 200

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data.users ?? []
    if (users.length === 0) break

    for (const authUser of users) {
      const { error: delErr } = await admin.auth.admin.deleteUser(authUser.id)
      if (delErr) {
        console.error("Failed to delete auth user", authUser.id, delErr.message)
      } else {
        deletedAuth++
      }
    }

    if (users.length < perPage) break
    page++
  }

  const deletedAppUsers = await db.user.deleteMany({})

  console.info("Purge complete:", {
    deletedAuthUsers: deletedAuth,
    deletedAppUsers: deletedAppUsers.count,
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
