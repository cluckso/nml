import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { business: true },
  })

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        role: UserRole.CUSTOMER,
      },
      include: { business: true },
    })
  }

  return user
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    redirect("/sign-in")
  }

  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { business: true },
  })

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        role: UserRole.CUSTOMER,
      },
      include: { business: true },
    })
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }
  return user
}
