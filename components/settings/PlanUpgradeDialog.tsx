"use client"

import Link from "next/link"
import { Lock, Sparkles } from "lucide-react"
import { PlanType } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  SECTION_LABELS,
  SECTION_MIN_TIER,
  SECTION_UPGRADE_DESCRIPTIONS,
  type SettingsSection,
} from "@/lib/business-settings"
import { getPlanDisplayName, getUpgradeTierLabel } from "@/lib/plan-labels"

interface PlanUpgradeDialogProps {
  section: SettingsSection | null
  currentPlan: PlanType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanUpgradeDialog({
  section,
  currentPlan,
  open,
  onOpenChange,
}: PlanUpgradeDialogProps) {
  if (!section) return null

  const requiredTier = SECTION_MIN_TIER[section]
  const requiredLabel = getUpgradeTierLabel(requiredTier)
  const currentLabel = getPlanDisplayName(currentPlan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{SECTION_LABELS[section]}</DialogTitle>
          <DialogDescription className="text-left pt-1">
            {SECTION_UPGRADE_DESCRIPTIONS[section]}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Your plan</span>
            <span className="font-medium">{currentLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Required plan</span>
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {requiredLabel}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Upgrade to unlock {SECTION_LABELS[section].toLowerCase()} and the rest of the {requiredLabel}{" "}
          feature set.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild>
            <Link href="/billing">Upgrade Now</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
