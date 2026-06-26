import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CallLog } from "@/components/calls/CallLog"
import type { Prisma } from "@prisma/client"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export default async function CallsPage({
  searchParams,
}: {
  searchParams: { search?: string; emergency?: string; page?: string }
}) {
  const user = await requireAuth()

  if (!user.businessId) {
    return (
      <div className="container mx-auto max-w-7xl py-8">
        <p className="text-muted-foreground">Please complete onboarding to view calls.</p>
      </div>
    )
  }

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT))
  const search = searchParams.search?.trim()
  const emergencyOnly = searchParams.emergency === "true"

  const where: Prisma.CallWhereInput = { businessId: user.businessId }
  if (emergencyOnly) where.emergencyFlag = true
  if (search) {
    where.OR = [
      { callerName: { contains: search, mode: "insensitive" } },
      { callerPhone: { contains: search, mode: "insensitive" } },
      { issueDescription: { contains: search, mode: "insensitive" } },
    ]
  }

  const [calls, total] = await Promise.all([
    db.call.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.call.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (emergencyOnly) params.set("emergency", "true")
    params.set("page", String(p))
    return `/calls?${params.toString()}`
  }

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Calls</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Name, time, reason, and appointment preference for each call
        </p>
      </div>

      <form method="get" className="mb-6 flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Search</span>
          <input
            name="search"
            type="search"
            placeholder="Name, phone, or reason..."
            defaultValue={searchParams.search}
            className="flex h-10 w-72 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            name="emergency"
            type="checkbox"
            value="true"
            defaultChecked={emergencyOnly}
            className="rounded border-input"
          />
          <span className="text-sm">Urgent only</span>
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Filter
        </button>
      </form>

      <CallLog calls={calls} />

      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {total} calls
          </span>
          <div className="flex gap-4">
            {page > 1 && (
              <a href={buildPageUrl(page - 1)} className="text-primary hover:underline font-medium">
                Previous
              </a>
            )}
            {page < totalPages && (
              <a href={buildPageUrl(page + 1)} className="text-primary hover:underline font-medium">
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
