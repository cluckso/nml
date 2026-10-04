"use client"

import Link from "next/link"
import { analytics } from "@heycatch/sdk"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Menu, X } from "lucide-react"
import { trialNavCtaLabel } from "@/lib/trial-marketing"
import { getTrialNavBadge, type TrialNavBadge as TrialNavBadgeData } from "@/lib/trial-nav-badge"
import { TrialNavBadge } from "@/components/nav/TrialNavBadge"
import { BrandMark } from "@/components/brand/BrandMark"

type DashboardNavPayload = {
  business?: { name?: string } | null
  hasAgent?: boolean
  trial?: {
    isOnTrial: boolean
    minutesRemaining: number
    daysRemaining: number
    isExhausted: boolean
    isExpired: boolean
    minutesUsed: number
  } | null
}

type NavLink = { href: string; label: string }

export function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [trialBadge, setTrialBadge] = useState<TrialNavBadgeData | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setBusinessName(null)
      setTrialBadge(null)
      return
    }
    let cancelled = false
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DashboardNavPayload | null) => {
        if (cancelled) return
        setBusinessName(data?.business?.name ?? null)
        const trial = data?.trial
        if (trial?.isOnTrial) {
          setTrialBadge(
            getTrialNavBadge({
              isOnTrial: trial.isOnTrial,
              hasAgent: !!data?.hasAgent,
              minutesRemaining: trial.minutesRemaining,
              daysRemaining: trial.daysRemaining,
              isExhausted: trial.isExhausted,
              isExpired: trial.isExpired,
              minutesUsed: trial.minutesUsed,
            })
          )
        } else {
          setTrialBadge(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBusinessName(null)
          setTrialBadge(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    setMenuOpen(false)
  }, [user])

  const handleSignOut = async () => {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    analytics.resetIdentity()
    router.push("/")
    router.refresh()
  }

  const marketingLinks: NavLink[] = [
    ...(!user ? [{ href: "/#demo", label: "Demo" }] : []),
    { href: "/guides", label: "Guides" },
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
    { href: "/docs/faq", label: "Help" },
  ]

  const appLinks: NavLink[] = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/calls", label: "Calls" },
        { href: "/appointments", label: "Appointments" },
        { href: "/settings", label: "Settings" },
        { href: "/billing", label: "Billing" },
      ]
    : []

  const allMenuLinks = [...marketingLinks, ...appLinks]

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3 min-h-14">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <BrandMark size="sm" className="shrink-0" />
          {businessName && (
            <span
              className="hidden sm:inline text-sm text-muted-foreground border-l border-border/60 pl-3 font-medium truncate max-w-[100px] md:max-w-[160px] lg:max-w-[220px]"
              title={businessName}
            >
              {businessName}
            </span>
          )}
          {trialBadge && (
            <span className="hidden md:inline-flex min-w-0">
              <TrialNavBadge badge={trialBadge} />
            </span>
          )}
        </div>

        {/* Desktop links — only when there is room */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          {allMenuLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm">
                {link.label}
              </Button>
            </Link>
          ))}
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up?next=%2Ftrial%2Fstart">
                <Button size="sm">{trialNavCtaLabel()}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Tablet/mobile: primary CTA + menu toggle */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/sign-up?next=%2Ftrial%2Fstart">
              <Button size="sm">{trialNavCtaLabel()}</Button>
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav-menu"
          className="lg:hidden border-t border-border/50 bg-background/98"
        >
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {businessName && (
              <p className="sm:hidden px-3 py-2 text-sm text-muted-foreground font-medium truncate">
                {businessName}
              </p>
            )}
            {trialBadge && (
              <div className="md:hidden px-3 py-2">
                <TrialNavBadge badge={trialBadge} />
              </div>
            )}
            {allMenuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border/50 mt-2 pt-2 flex flex-col gap-1">
              {user ? (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
