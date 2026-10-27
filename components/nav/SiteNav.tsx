"use client"

import { usePathname } from "next/navigation"
import { Nav } from "@/components/nav"

export function SiteNav() {
  const pathname = usePathname()
  if (pathname === "/sign-in" || pathname === "/sign-up") return null
  return <Nav />
}
