import { analytics } from "@heycatch/sdk"
import * as Sentry from "@sentry/nextjs"

analytics.init({
  projectKey: "hck_pk_3uUHMRH03dhr5PXfK-q07Tn5yhD5tMeV",
  install: {
    framework: "nextjs",
    frameworkVersion: "16",
    agent: "cursor",
  },
})

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && process.env.NODE_ENV === "production",
  tracesSampleRate: 0.1,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
})
