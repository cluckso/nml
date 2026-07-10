"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function DeleteAccountControl() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Could not delete account")
        return
      }
      setOpen(false)
      router.push("/sign-in?message=account-deleted")
      router.refresh()
    } catch {
      setError("Could not delete account. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="mt-16 pt-6 border-t border-border/40 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-muted-foreground/70 hover:text-destructive underline-offset-2 hover:underline"
        >
          Delete account
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently removes your CallGrabbr account, business settings, and call assistant number. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Deleting…
                </>
              ) : (
                "Delete account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
