import * as Sentry from "@sentry/nextjs"

/** Report production errors from API routes, crons, and webhooks. */
export function captureRouteError(error: unknown, context?: Record<string, unknown>): void {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) return

  Sentry.withScope((scope) => {
    if (context) scope.setContext("route", context)
    Sentry.captureException(error)
  })
}
