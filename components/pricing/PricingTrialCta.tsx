"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function PricingTrialCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  const href = isLoggedIn ? "/trial/start" : "/sign-up?next=%2Ftrial%2Fstart"

  return (
    <Button size="lg" asChild className="gap-2">
      <Link href={href}>
        {isLoggedIn ? "Start your free trial" : "Try free with real calls"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Button>
  )
}
