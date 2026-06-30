"use client"

import { useEffect } from "react"
import Link from "next/link"
import { PlanType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trackPurchaseSuccess } from "@/lib/analytics"
import { getPlanDisplayName } from "@/lib/plan-labels"
import { getIncludedMinutes, getMonthlyPrice } from "@/lib/plans"
import { formatIncludedUsageShort } from "@/lib/plan-usage"
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"

type PurchaseSuccessClientProps =
  | {
      state: "success"
      planType: PlanType
      onboardingComplete: boolean
      isUpgrade: boolean
    }
  | {
      state: "error"
      message: string
    }

export function PurchaseSuccessClient(props: PurchaseSuccessClientProps) {
  useEffect(() => {
    if (props.state === "success") {
      trackPurchaseSuccess(getPlanDisplayName(props.planType))
    }
  }, [props])

  if (props.state === "error") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <CardTitle className="text-2xl">We couldn&apos;t confirm your purchase</CardTitle>
            <CardDescription className="text-base">{props.message}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href="/billing">Go to billing</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/pricing">View plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planName = getPlanDisplayName(props.planType)
  const monthlyPrice = getMonthlyPrice(props.planType)
  const includedMinutes = getIncludedMinutes(props.planType)
  const continueHref = props.onboardingComplete ? "/dashboard" : "/onboarding"
  const continueLabel = props.onboardingComplete ? "Go to dashboard" : "Finish setup"

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {props.isUpgrade ? "Plan updated!" : "You're subscribed!"}
          </CardTitle>
          <CardDescription className="text-base">
            {props.isUpgrade
              ? "Your subscription has been updated. Changes may take a moment to appear on your billing page."
              : "Payment received. Your CallGrabbr plan is active — here's what you have."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Monthly</p>
                <p className="text-lg font-semibold">${monthlyPrice}/mo</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Included usage</p>
              <p className="font-medium">
                {includedMinutes.toLocaleString()} minutes/month
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatIncludedUsageShort(includedMinutes)}
              </p>
            </div>
          </div>

          {!props.onboardingComplete && !props.isUpgrade && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-medium mb-1">Next step: set up your business</p>
              <p className="text-muted-foreground">
                Add your industry and business details so we can configure your AI call assistant.
              </p>
            </div>
          )}

          <Button asChild className="w-full min-h-11">
            <Link href={continueHref}>
              {continueLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Receipt and billing details are in{" "}
            <Link href="/billing" className="text-primary underline">
              Billing &amp; Usage
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
