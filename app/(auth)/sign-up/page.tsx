import { SignUpForm } from "@/components/auth/SignUpForm"
import { getSafeRedirectPath } from "@/lib/safe-redirect"

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams
  return (
    <SignUpForm
      initialNext={getSafeRedirectPath(firstParam(params.next))}
      initialRef={firstParam(params.ref)}
      initialAgency={firstParam(params.agency)}
    />
  )
}
