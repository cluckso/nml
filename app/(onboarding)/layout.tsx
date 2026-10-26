import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { PersistTermsConsent } from "@/components/legal/PersistTermsConsent"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Onboarding has its own layout so we only require auth here.
 * No business/onboarding-complete check — avoids redirect loop when user is on /onboarding.
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return (
    <>
      <PersistTermsConsent />
      {children}
    </>
  )
}
