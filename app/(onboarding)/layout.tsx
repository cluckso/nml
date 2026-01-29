import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

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
  return <>{children}</>
}
