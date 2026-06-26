import { NextRequest, NextResponse } from "next/server"
import { linkBusinessToAgency } from "@/lib/agency"

/** POST /api/agency/join — Link a business to an agency via invite code */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const inviteCode = typeof body.inviteCode === "string" ? body.inviteCode.trim() : ""
  const businessId = typeof body.businessId === "string" ? body.businessId.trim() : ""

  if (!inviteCode || !businessId) {
    return NextResponse.json({ error: "Missing inviteCode or businessId" }, { status: 400 })
  }

  const client = await linkBusinessToAgency(inviteCode, businessId)
  if (!client) {
    return NextResponse.json({ error: "Invalid invite code or already linked" }, { status: 400 })
  }

  return NextResponse.json({ success: true, agencyClientId: client.id })
}
