import { db } from "./db"
import { createAdminClient } from "./supabase/admin"
import { releaseRetellNumber } from "./retell"
import { cancelStripeSubscriptionForBusiness } from "./stripe"

export type DeleteAccountResult = {
  businessId: string | null
  releasedRetellNumber: boolean
  canceledStripe: boolean
}

/** Delete the signed-in user's business data, app user row, and Supabase auth user. */
export async function deleteAccountForUser(params: {
  userId: string
  supabaseUserId: string | null | undefined
  businessId: string | null | undefined
}): Promise<DeleteAccountResult> {
  const { userId, supabaseUserId, businessId } = params
  let releasedRetellNumber = false
  let canceledStripe = false

  if (businessId) {
    try {
      await releaseRetellNumber(businessId)
      releasedRetellNumber = true
    } catch (err) {
      console.error("deleteAccountForUser: releaseRetellNumber failed:", businessId, err)
    }

    try {
      canceledStripe = await cancelStripeSubscriptionForBusiness(businessId)
    } catch (err) {
      console.error("deleteAccountForUser: cancelStripeSubscriptionForBusiness failed:", businessId, err)
    }

    await db.business.delete({ where: { id: businessId } })
  } else {
    await db.user.delete({ where: { id: userId } })
  }

  if (supabaseUserId) {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(supabaseUserId)
    if (error) {
      throw new Error(`Failed to delete auth user: ${error.message}`)
    }
  }

  return { businessId: businessId ?? null, releasedRetellNumber, canceledStripe }
}
