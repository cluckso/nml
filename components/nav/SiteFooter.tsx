"use client"

import { usePathname } from "next/navigation"

export function SiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/sign-in" || pathname === "/sign-up") return null
  return <>{children}</>
}
