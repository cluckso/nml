import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-env"
import { db } from "./db"
import { UserRole, type Prisma } from "@prisma/client"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

/**
 * Business fields needed on the auth user object.
 * Omits zapierApiKeyHash so auth still works if that column is not migrated yet.
 */
const businessAuthSelect = {
  id: true,
  name: true,
  industry: true,
  primaryForwardingNumber: true,
  retellPhoneNumber: true,
  retellAgentId: true,
  stripeCustomerId: true,
  serviceAreas: true,
  businessHours: true,
  departments: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  onboardingComplete: true,
  requiresManualSetup: true,
  status: true,
  testCallVerifiedAt: true,
  crmWebhookUrl: true,
  forwardToEmail: true,
  afterHoursEmergencyPhone: true,
  offersRoadsideService: true,
  voiceSettings: true,
  settings: true,
  trialStartedAt: true,
  trialEndsAt: true,
  trialMinutesUsed: true,
  planType: true,
  stripeSubscriptionId: true,
  subscriptionStatus: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  founderDealRedeemedAt: true,
  referralCode: true,
  referredByBusinessId: true,
  agencyId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BusinessSelect

const userWithBusiness = {
  include: {
    business: { select: businessAuthSelect },
  },
} satisfies Prisma.UserDefaultArgs

/** Resolve DB user from Supabase user (shared logic). */
async function getDbUserFromSupabaseUser(supabaseUserId: string, email: string | undefined) {
  let dbUser = await db.user.findUnique({
    where: { supabaseUserId },
    ...userWithBusiness,
  })
  if (!dbUser && email) {
    const existingByEmail = await db.user.findUnique({
      where: { email },
      ...userWithBusiness,
    })
    if (existingByEmail) {
      dbUser = await db.user.update({
        where: { id: existingByEmail.id },
        data: { supabaseUserId },
        ...userWithBusiness,
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
          termsAcceptedAt: new Date(),
        },
        ...userWithBusiness,
      })
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002" && email) {
        const existingByEmail = await db.user.findUnique({
          where: { email },
          ...userWithBusiness,
        })
        if (existingByEmail) {
          dbUser = await db.user.update({
            where: { id: existingByEmail.id },
            data: { supabaseUserId },
            ...userWithBusiness,
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
    const url = getSupabaseUrl()
    const key = getSupabaseAnonKey()
    if (!url || !key) return null
    const supabase = createSupabaseClient(url, key)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return getDbUserFromSupabaseUser(user.id, user.email ?? undefined)
  }
  return getCurrentUser()
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return getDbUserFromSupabaseUser(user.id, user.email ?? undefined)
  } catch {
    return null
  }
}

export async function requireAuth() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect("/sign-in")
    return getDbUserFromSupabaseUser(user.id, user.email ?? undefined)
  } catch (err: unknown) {
    // Next.js redirect() throws; rethrow so the redirect happens and don't log it
    if (err && typeof err === "object" && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw err
    }
    console.error("requireAuth error:", err)
    redirect("/sign-in")
  }
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== UserRole.ADMIN) {
    redirect("/dashboard")
  }
  return user
}
