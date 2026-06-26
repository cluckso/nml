import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account - CallGrabbr",
  description: "Sign in or sign up for CallGrabbr. Start your 7-day free trial with no card required.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
