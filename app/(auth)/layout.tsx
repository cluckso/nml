import type { Metadata } from "next"
import { authDocumentTitle, authMetaDescription } from "@/lib/trial-marketing"

export const metadata: Metadata = {
  title: authDocumentTitle(),
  description: authMetaDescription(),
  robots: { index: false, follow: true },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
