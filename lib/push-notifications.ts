import type { Call } from "@prisma/client"
import * as admin from "firebase-admin"
import { db } from "@/lib/db"
import { sanitizeIssueDescription } from "@/lib/parse-lead-from-transcript"
import type { StructuredIntake } from "@/lib/notifications"

let initAttempted = false

function getMessaging(): admin.messaging.Messaging | null {
  if (initAttempted) {
    return admin.apps.length > 0 ? admin.messaging() : null
  }
  initAttempted = true

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) {
    console.warn("[Push] FIREBASE_SERVICE_ACCOUNT_JSON not configured — push skipped")
    return null
  }

  try {
    const serviceAccount = JSON.parse(raw) as admin.ServiceAccount
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    }
    return admin.messaging()
  } catch (error) {
    console.error("[Push] Failed to initialize Firebase Admin:", error)
    return null
  }
}

function buildPushCopy(intake: StructuredIntake): { title: string; body: string } {
  const name = (intake.name || "Unknown caller").trim()
  const issue = sanitizeIssueDescription(intake.issue_description)
  const issueSnippet = issue ? issue.slice(0, 120) : "Open the app for details."

  if (intake.emergency) {
    return {
      title: `EMERGENCY: ${name}`,
      body: issueSnippet,
    }
  }

  return {
    title: `New call from ${name}`,
    body: issueSnippet,
  }
}

async function clearInvalidToken(token: string): Promise<void> {
  await db.user.updateMany({
    where: { pushToken: token },
    data: { pushToken: null, pushPlatform: null },
  })
}

/** Send FCM push to all registered mobile tokens for a business. */
export async function sendPushNotification(
  businessId: string,
  call: Call,
  intake: StructuredIntake
): Promise<void> {
  const messaging = getMessaging()
  if (!messaging) return

  const users = await db.user.findMany({
    where: {
      businessId,
      pushToken: { not: null },
    },
    select: { id: true, pushToken: true },
  })

  const tokens = users
    .map((u) => u.pushToken?.trim())
    .filter((t): t is string => !!t)

  if (tokens.length === 0) {
    console.info("[Push] Skipped: no push tokens for business", businessId)
    return
  }

  const { title, body } = buildPushCopy(intake)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com"

  for (const token of tokens) {
    try {
      await messaging.send({
        token,
        notification: { title, body },
        data: {
          route: "/calls",
          callId: call.id,
          emergency: intake.emergency ? "true" : "false",
          url: `${appUrl}/calls`,
        },
        android: {
          priority: intake.emergency ? "high" : "normal",
          notification: {
            channelId: intake.emergency ? "emergency" : "calls",
            priority: intake.emergency ? "max" : "default",
          },
        },
      })
      console.info("[Push] Sent", { businessId, userTokenPrefix: token.slice(0, 12) })
    } catch (error) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : ""

      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token"
      ) {
        console.warn("[Push] Clearing invalid token", { tokenPrefix: token.slice(0, 12), code })
        await clearInvalidToken(token)
        continue
      }

      console.error("[Push] Send error:", error)
      throw error
    }
  }
}
