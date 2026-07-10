import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { deleteAccountForUser } from "@/lib/account-deletion"
import { createClient } from "@/lib/supabase/server"

/** DELETE /api/account — permanently delete the signed-in user's account and business data. */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const result = await deleteAccountForUser({
      userId: user.id,
      supabaseUserId: user.supabaseUserId,
      businessId: user.businessId,
    })

    try {
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {
      // Auth user already deleted; cookie cleanup is best-effort.
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("DELETE /api/account error:", error)
    const message = error instanceof Error ? error.message : "Failed to delete account"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
