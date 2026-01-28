import { requireAuth } from "@/lib/auth"
import { CallLog } from "@/components/calls/CallLog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

async function CallsList({ searchParams }: { searchParams: { search?: string; emergency?: string } }) {
  const user = await requireAuth()
  
  if (!user.businessId) {
    return <div>Please complete onboarding</div>
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/calls?${new URLSearchParams({
      ...(searchParams.search && { search: searchParams.search }),
      ...(searchParams.emergency && { emergency: searchParams.emergency }),
    })}`,
    {
      cache: "no-store",
      headers: {
        Cookie: "", // Would need to pass auth cookie in real implementation
      },
    }
  )

  const data = await response.json()
  return <CallLog calls={data.calls || []} />
}

export default function CallsPage({
  searchParams,
}: {
  searchParams: { search?: string; emergency?: string }
}) {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Call Log</h1>
        <p className="text-muted-foreground">View and manage all your calls</p>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search calls..."
          defaultValue={searchParams.search}
          className="max-w-sm"
        />
        <Button variant="outline">Filter</Button>
      </div>

      <Suspense fallback={<div>Loading calls...</div>}>
        <CallsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
