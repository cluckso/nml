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

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Call Log</h1>
        <p className="text-muted-foreground">View and manage all your calls</p>
      </div>

      <form method="get" className="mb-6 flex flex-wrap gap-4 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Search</span>
          <input
            name="search"
            type="search"
            placeholder="Name, phone, or issue..."
            defaultValue={searchParams.search}
            className="flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            name="emergency"
            type="checkbox"
            value="true"
            defaultChecked={emergencyOnly}
            className="rounded border-input"
          />
          <span className="text-sm">Emergency only</span>
        </label>
        <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
          Filter
        </button>
      </form>

      <CallLog calls={calls} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({total} calls)
          </span>
          {page > 1 && (
            <a href={`/calls?${new URLSearchParams({ ...(search && { search }), ...(emergencyOnly && { emergency: "true" }), page: String(page - 1) })}`} className="text-primary hover:underline">
              Previous
            </a>
          )}
          {page < totalPages && (
            <a href={`/calls?${new URLSearchParams({ ...(search && { search }), ...(emergencyOnly && { emergency: "true" }), page: String(page + 1) })}`} className="text-primary hover:underline">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
