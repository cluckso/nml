import { createClient } from "@/lib/supabase/server"
import { db } from "./db"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  let dbUser = await db.user.findUnique({
    where: { supabaseUserId: user.id },
    include: { business: true },
  })

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        supabaseUserId: user.id,
        email: user.email || "",
        role: UserRole.CUSTOMER,
      },
      include: { business: true },
    })
  }

  return dbUser
}

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/sign-in")
  }

  let dbUser = await db.user.findUnique({
    where: { supabaseUserId: user.id },
    include: { business: true },
  })

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        supabaseUserId: user.id,
        email: user.email || "",
        role: UserRole.CUSTOMER,
      },
      include: { business: true },
    })
  }

  return dbUser
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }
  return user
}
