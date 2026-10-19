import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { TrialStartClient } from "./TrialStartClient"
import {
  trialNavCtaLabel,
  trialStartMetaDescription,
  trialDisclosureLine,
  trialConversionLine,
} from "@/lib/trial-marketing"
import { JsonLd } from "@/components/seo/JsonLd"
import { webPageJsonLd } from "@/lib/structured-data"
import { siteUrl } from "@/lib/site-url"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/brand/BrandMark"

const TRIAL_TITLE = "Start your CallGrabbr free trial"
const TRIAL_PATH = "/trial/start"

export const metadata: Metadata = {
  title: TRIAL_TITLE,
  description: trialStartMetaDescription(),
  alternates: { canonical: siteUrl(TRIAL_PATH) },
  openGraph: {
    title: TRIAL_TITLE,
    description: trialStartMetaDescription(),
    url: siteUrl(TRIAL_PATH),
    type: "website",
  },
}

export const dynamic = "force-dynamic"

function TrialStartGate() {
  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
        <BrandMark className="mb-2" />
        <h1 className="text-2xl font-semibold leading-tight tracking-tight">{TRIAL_TITLE}</h1>
        <p className="text-sm text-muted-foreground">{trialConversionLine()}</p>
        <p className="text-sm text-muted-foreground">{trialDisclosureLine()}</p>
        <h2 className="text-base font-semibold pt-2">What you get in the trial</h2>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Keep your business number — forward unanswered calls</li>
          <li>Get name, callback number, and job details by text</li>
          <li>No card required to start</li>
        </ul>
        <Button asChild className="w-full">
          <Link href={`/sign-up?next=${encodeURIComponent(TRIAL_PATH)}`}>
            {trialNavCtaLabel()}
          </Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/sign-in?next=${encodeURIComponent(TRIAL_PATH)}`} className="text-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

/**
 * Start free trial: public gate for crawlers/logged-out users (canonical + H1).
 * Logged-in users without a business see the form; completed onboarding goes to dashboard.
 */
export default async function TrialStartPage() {
  const user = await getCurrentUser()
  const description = trialStartMetaDescription()
  const jsonLd = (
    <JsonLd
      data={webPageJsonLd({
        name: TRIAL_TITLE,
        description,
        path: TRIAL_PATH,
      })}
    />
  )

  const headTags = (
    <>
      <link rel="canonical" href={siteUrl(TRIAL_PATH)} />
      <meta property="og:url" content={siteUrl(TRIAL_PATH)} />
      {jsonLd}
    </>
  )

  if (!user) {
    return (
      <>
        {headTags}
        <TrialStartGate />
      </>
    )
  }

  if (!user.businessId) {
    return (
      <Suspense fallback={<div className="container mx-auto max-w-md py-12 text-center text-muted-foreground">Loading…</div>}>
        {headTags}
        <TrialStartClient />
      </Suspense>
    )
  }

  const business = await db.business.findUnique({
    where: { id: user.businessId! },
  })
  if (business?.onboardingComplete) {
    redirect("/dashboard")
  }
  redirect("/onboarding")
}
