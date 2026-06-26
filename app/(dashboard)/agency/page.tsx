import { requireAuth } from "@/lib/auth"
import { AgencyDashboardClient } from "@/components/agency/AgencyDashboardClient"

export default async function AgencyPage() {
  await requireAuth()

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <AgencyDashboardClient />
    </div>
  )
}
