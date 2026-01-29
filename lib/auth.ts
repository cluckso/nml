import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { db } from "./db"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

/** Resolve DB user from Supabase user (shared logic). */
async function getDbUserFromSupabaseUser(supabaseUserId: string, email: string | undefined) {
  let dbUser = await db.user.findUnique({
    where: { supabaseUserId },
    include: { business: true },
  })
  if (!dbUser && email) {
    const existingByEmail = await db.user.findUnique({
      where: { email },
      include: { business: true },
    })
    if (existingByEmail) {
      dbUser = await db.user.update({
        where: { id: existingByEmail.id },
        data: { supabaseUserId },
        include: { business: true },
      })
    }
  }
  if (!dbUser) {
    try {
      dbUser = await db.user.create({
        data: {
          supabaseUserId,
          email: email || "",
          role: UserRole.CUSTOMER,
        },
        include: { business: true },
      })
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002" && email) {
        const existingByEmail = await db.user.findUnique({
          where: { email },
          include: { business: true },
        })
        if (existingByEmail) {
          dbUser = await db.user.update({
            where: { id: existingByEmail.id },
            data: { supabaseUserId },
            include: { business: true },
          })
        } else {
          throw err
        }
      } else {
        throw err
      }
    }
  }
  return dbUser
}

/**
 * Get current user from request: supports cookie (web) or Authorization Bearer token (e.g. Flutter).
 * Use in API routes; returns null if unauthenticated (return 401 in route).
 */
export async function getAuthUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return getDbUserFromSupabaseUser(user.id, user.email ?? undefined)
  }
  return getCurrentUser()
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getDbUserFromSupabaseUser(user.id, user.email ?? undefined)
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/sign-in")
  return getDbUserFromSupabaseUser(user.id, user.email ?? undefined)
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }
  return user
}
