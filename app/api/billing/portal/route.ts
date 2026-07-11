import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { createBillingPortalSession, stripe } from "@/lib/stripe"
import { SITE_URL } from "@/lib/site-url"
import { captureRouteError } from "@/lib/capture-error"

/** POST /api/billing/portal — Stripe Customer Portal for manage/cancel. */
export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Billing is not configured. Set STRIPE_SECRET_KEY in your environment." },
        { status: 503 }
      )
    }

    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.businessId) {
      return NextResponse.json({ error: "No business on this account" }, { status: 400 })
    }

    const returnUrl = `${SITE_URL}/billing`
    const url = await createBillingPortalSession(user.businessId, returnUrl)
    return NextResponse.json({ url })
  } catch (error) {
    captureRouteError(error, { route: "POST /api/billing/portal" })
    const message = error instanceof Error ? error.message : "Failed to open billing portal"
    const status = message.includes("No Stripe customer") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
