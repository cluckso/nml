"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
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

export function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [trialBadge, setTrialBadge] = useState<TrialNavBadgeData | null>(null)
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

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BrandMark size="sm" />
          {businessName && (
            <span
              className="text-sm text-muted-foreground border-l border-border/60 pl-3 font-medium truncate max-w-[120px] sm:max-w-[200px] md:max-w-[280px]"
              title={businessName}
            >
              {businessName}
            </span>
          )}
          {trialBadge && <TrialNavBadge badge={trialBadge} />}
        </div>
        <div className="flex gap-4 items-center shrink-0">
          <Link href="/guides">
            <Button variant="ghost">Guides</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost">Pricing</Button>
          </Link>
          <Link href="/docs/faq">
            <Button variant="ghost">Help</Button>
          </Link>
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/calls">
                <Button variant="ghost">Calls</Button>
              </Link>
              <Link href="/appointments">
                <Button variant="ghost">Appointments</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
              <Link href="/billing">
                <Button variant="ghost">Billing</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up?next=%2Ftrial%2Fstart">
                <Button>{trialNavCtaLabel()}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
