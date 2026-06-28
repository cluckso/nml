"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Calendar, CreditCard, Settings, Handshake } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/agency", label: "Partner", icon: Handshake },
] as const

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-border/50 bg-card/40 p-1 backdrop-blur-sm">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
