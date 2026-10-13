import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import {
  createAgencyConnectOnboardingLink,
  getAgencyForUser,
  syncAgencyConnectStatus,
} from "@/lib/agency"
import { getAppOrigin } from "@/lib/auth-redirect"
import { stripe } from "@/lib/stripe"

/** POST /api/agency/connect — Start or resume Stripe Connect Express onboarding */
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Payouts are not configured yet. Contact support." },
      { status: 503 }
    )
  }

  const agency = await getAgencyForUser(user.id)
  if (!agency) {
    return NextResponse.json({ error: "Create a partner profile first" }, { status: 400 })
  }

  const origin = getAppOrigin() || req.nextUrl.origin
  const returnUrl = `${origin}/agency?connect=return`
  const refreshUrl = `${origin}/agency?connect=refresh`

  try {
    const { url } = await createAgencyConnectOnboardingLink(
      agency.id,
      returnUrl,
      refreshUrl,
      user.email
    )
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Agency Connect onboarding error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start payout setup" },
      { status: 500 }
    )
  }
}

/** GET /api/agency/connect — Sync Connect status after return from Stripe */
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const agency = await getAgencyForUser(user.id)
  if (!agency) {
    return NextResponse.json({ error: "No agency" }, { status: 404 })
  }

  const synced = await syncAgencyConnectStatus(agency.id)
  return NextResponse.json({
    connected: !!synced?.stripeConnectAccountId,
    payoutsEnabled: !!synced?.payoutsEnabled,
    stripeConnectAccountId: synced?.stripeConnectAccountId ?? null,
  })
}
