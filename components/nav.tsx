"use client"

import Link from "next/link"
import { analytics } from "@heycatch/sdk"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { ChevronDown, Menu, X } from "lucide-react"
import { trialNavCtaLabel } from "@/lib/trial-marketing"
import { getTrialNavBadge, type TrialNavBadge as TrialNavBadgeData } from "@/lib/trial-nav-badge"
import { TrialNavBadge } from "@/components/nav/TrialNavBadge"
import { BrandMark } from "@/components/brand/BrandMark"
import { HOMEPAGE_INDUSTRY_LINKS } from "@/lib/industry-data"

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

const productLinks: NavLink[] = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#features", label: "Features" },
  { href: "/#demo", label: "Demo" },
]

const industryLinks: NavLink[] = HOMEPAGE_INDUSTRY_LINKS.map(({ name, slug }) => ({
  href: `/for/${slug}`,
  label: name,
}))

const resourceLinks: NavLink[] = [
  { href: "/guides", label: "Guides" },
  { href: "/compare", label: "Comparisons" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/docs/faq", label: "Help" },
]

const appLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calls", label: "Calls" },
  { href: "/appointments", label: "Appointments" },
  { href: "/settings", label: "Settings" },
  { href: "/billing", label: "Billing" },
]

const dropdownGroups = [
  { id: "product", label: "Product", links: productLinks },
  { id: "industries", label: "Industries", links: industryLinks },
  { id: "resources", label: "Resources", links: resourceLinks },
]

export function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [trialBadge, setTrialBadge] = useState<TrialNavBadgeData | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
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
    setOpenDropdown(null)
    setOpenMobileGroup(null)
  }, [user])

  useEffect(() => {
    if (!openDropdown && !menuOpen) return

    function handleOutsidePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
        setOpenDropdown(null)
        setMenuOpen(false)
        setOpenMobileGroup(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      event.preventDefault()
      if (openDropdown) {
        dropdownTriggerRefs.current[openDropdown]?.focus()
      } else {
        mobileMenuButtonRef.current?.focus()
      }
      setOpenDropdown(null)
      setMenuOpen(false)
      setOpenMobileGroup(null)
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [menuOpen, openDropdown])

  function closeNavigation() {
    setOpenDropdown(null)
    setMenuOpen(false)
    setOpenMobileGroup(null)
  }

  const handleSignOut = async () => {
    closeNavigation()
    const supabase = createClient()
    await supabase.auth.signOut()
    analytics.resetIdentity()
    router.push("/")
    router.refresh()
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 border-b border-border/60 bg-background"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpenDropdown(null)
        }
      }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4 min-h-14">
        <div className="flex items-center gap-3 min-w-0">
          <BrandMark size="sm" className="shrink-0" />
          <span className="sm:hidden text-base font-bold tracking-tight text-foreground">
            CallGrabbr
          </span>
          <span className="hidden sm:inline border-l border-border pl-3 text-xs font-medium tracking-wide text-muted-foreground whitespace-nowrap">
            AI receptionist
          </span>
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

        <div className="hidden xl:flex items-center gap-1">
          {dropdownGroups.map((group) => {
            const isOpen = openDropdown === group.id
            return (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => setOpenDropdown(group.id)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Button
                  ref={(element) => {
                    dropdownTriggerRefs.current[group.id] = element
                  }}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  aria-controls={`${group.id}-menu`}
                  onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                >
                  {group.label}
                  <ChevronDown
                    className={`ml-1 size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </Button>
                {isOpen && (
                  <div
                    id={`${group.id}-menu`}
                    className="absolute left-0 top-full z-50 min-w-52 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg"
                    hidden={!isOpen}
                  >
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeNavigation}
                        className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {group.id === "resources" && user && (
                      <>
                        <div className="my-2 border-t border-border" />
                        {appLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeNavigation}
                            className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          <Link href="/pricing" onClick={closeNavigation}>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
          </Link>
        </div>

        <div className="hidden xl:flex items-center justify-end gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                  Sign In
              </Link>
              <Link href="/sign-up?next=%2Ftrial%2Fstart">
                <Button size="sm" className="px-4">{trialNavCtaLabel()}</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex xl:hidden items-center gap-2 shrink-0">
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
            className="size-9"
            ref={mobileMenuButtonRef}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => {
              setMenuOpen((open) => !open)
              setOpenMobileGroup(null)
            }}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav-menu"
          className="absolute left-0 right-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background shadow-lg xl:hidden"
        >
          <div className="container mx-auto px-4 py-3">
            {businessName && (
              <p className="px-3 py-2 text-sm text-muted-foreground font-medium truncate">
                {businessName}
              </p>
            )}
            {trialBadge && (
              <div className="md:hidden px-3 py-2">
                <TrialNavBadge badge={trialBadge} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              {dropdownGroups.map((group) => {
                const isOpen = openMobileGroup === group.id
                return (
                  <div key={group.id} className="border-b border-border/60 last:border-0">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between px-3"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-${group.id}-menu`}
                      onClick={() => setOpenMobileGroup(isOpen ? null : group.id)}
                    >
                      {group.label}
                      <ChevronDown
                        className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </Button>
                    {isOpen && (
                      <div
                        id={`mobile-${group.id}-menu`}
                        className="grid gap-1 px-3 pb-3 pl-5"
                        hidden={!isOpen}
                      >
                        {group.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeNavigation}
                            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            {link.label}
                          </Link>
                        ))}
                        {group.id === "resources" && user && (
                          <>
                            <div className="my-2 border-t border-border/60" />
                            {appLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeNavigation}
                                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              <Link
                href="/pricing"
                onClick={closeNavigation}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
              >
                Pricing
              </Link>
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              {user ? (
                <Button variant="outline" className="justify-start" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <Link href="/sign-in" onClick={closeNavigation}>
                  <Button variant="ghost" className="w-full justify-start">
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
