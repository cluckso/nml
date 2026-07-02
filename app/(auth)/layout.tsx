import type { Metadata } from "next"
import { authMetaDescription } from "@/lib/trial-marketing"

export const metadata: Metadata = {
  title: "Account - CallGrabbr",
  description: authMetaDescription(),
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
