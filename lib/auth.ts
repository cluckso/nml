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

  if (!dbUser && user.email) {
    // Link existing user by email (e.g. same email, supabaseUserId was missing or different)
    const existingByEmail = await db.user.findUnique({
      where: { email: user.email },
      include: { business: true },
    })
    if (existingByEmail) {
      dbUser = await db.user.update({
        where: { id: existingByEmail.id },
        data: { supabaseUserId: user.id },
        include: { business: true },
      })
    }
  }

  if (!dbUser) {
    try {
      dbUser = await db.user.create({
        data: {
          supabaseUserId: user.id,
          email: user.email || "",
          role: UserRole.CUSTOMER,
        },
        include: { business: true },
      })
    } catch (err: unknown) {
      // P2002 = unique constraint (e.g. email already exists from race or prior sign-up)
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002" && user.email) {
        const existingByEmail = await db.user.findUnique({
          where: { email: user.email },
          include: { business: true },
        })
        if (existingByEmail) {
          dbUser = await db.user.update({
            where: { id: existingByEmail.id },
            data: { supabaseUserId: user.id },
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

  if (!dbUser && user.email) {
    // Link existing user by email (e.g. same email, supabaseUserId was missing or different)
    const existingByEmail = await db.user.findUnique({
      where: { email: user.email },
      include: { business: true },
    })
    if (existingByEmail) {
      dbUser = await db.user.update({
        where: { id: existingByEmail.id },
        data: { supabaseUserId: user.id },
        include: { business: true },
      })
    }
  }

  if (!dbUser) {
    try {
      dbUser = await db.user.create({
        data: {
          supabaseUserId: user.id,
          email: user.email || "",
          role: UserRole.CUSTOMER,
        },
        include: { business: true },
      })
    } catch (err: unknown) {
      // P2002 = unique constraint (e.g. email already exists from race or prior sign-up)
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002" && user.email) {
        const existingByEmail = await db.user.findUnique({
          where: { email: user.email },
          include: { business: true },
        })
        if (existingByEmail) {
          dbUser = await db.user.update({
            where: { id: existingByEmail.id },
            data: { supabaseUserId: user.id },
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

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }
  return user
}
