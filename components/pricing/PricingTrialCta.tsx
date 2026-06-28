"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PricingTrialCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  const href = isLoggedIn ? "/trial/start" : "/sign-up?next=%2Ftrial%2Fstart"

  return (
    <Button size="lg" asChild>
      <Link href={href}>
        {isLoggedIn ? "Start your free trial" : "Sign up to start free trial"}
      </Link>
    </Button>
  )
}
