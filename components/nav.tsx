import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          NeverMissLead-AI
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/pricing">
            <Button variant="ghost">Pricing</Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  )
}
