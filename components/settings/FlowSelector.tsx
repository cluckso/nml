"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FLOW_OPTIONS, getFlowOptionsForPlan, industryToFlowCategory, type FlowOption, type FlowCategoryId } from "@/lib/flow-types"
import { FlowPreview } from "./FlowPreview"
import { Industry } from "@prisma/client"
import { PlanType } from "@prisma/client"
import { Lock } from "lucide-react"

interface FlowSelectorProps {
  planType: PlanType | null | undefined
  currentIndustry: Industry
  currentOffersRoadside?: boolean | null
  onSelect: (industry: Industry, offersRoadside?: boolean) => void
  disabled?: boolean
}

export function FlowSelector({
  planType,
  currentIndustry,
  currentOffersRoadside = false,
  onSelect,
  disabled,
}: FlowSelectorProps) {
  const { selectable, locked } = getFlowOptionsForPlan(planType)
  const canSelectPro = selectable.some((f) => f.requiresPro)
  const currentCategory = industryToFlowCategory(currentIndustry)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Conversation flow</Label>
        <p className="text-sm text-muted-foreground">
          Basic plans use the simple name / number / reason flow. Pro and Local Plus can choose an industry flow.
        </p>
      </div>

      <div className="grid gap-4">
        {FLOW_OPTIONS.map((flow) => {
          const isLocked = locked.some((l) => l.id === flow.id)
          const homeServiceIndustries: Industry[] = [Industry.HVAC, Industry.PLUMBING, Industry.ELECTRICIAN, Industry.HANDYMAN]
          const isSelected =
            flow.id === "barebones"
              ? currentIndustry === Industry.GENERIC
              : flow.id === "home_service"
                ? homeServiceIndustries.includes(currentIndustry)
                : flow.id === "automotive"
                  ? currentIndustry === Industry.AUTO_REPAIR
                  : flow.id === "childcare"
                    ? currentIndustry === Industry.CHILDCARE
                    : false

          return (
            <div key={flow.id} className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {isLocked ? (
                    <>
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-muted-foreground">{flow.label}</span>
                      <Link href="/billing">
                        <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                          Upgrade to Pro
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="radio"
                        name="flow"
                        id={`flow-${flow.id}`}
                        checked={isSelected}
                        onChange={() => {
                          if (flow.id === "barebones") onSelect(Industry.GENERIC)
                          else if (flow.id === "childcare") onSelect(Industry.CHILDCARE)
                          else if (flow.id === "automotive") onSelect(Industry.AUTO_REPAIR, currentOffersRoadside ?? false)
                          else if (flow.id === "home_service") {
                            const sub = flow.subOptions?.find((s) => "industry" in s && s.industry === currentIndustry)
                            onSelect((sub as { industry?: Industry })?.industry ?? Industry.HVAC)
                          }
                        }}
                        disabled={disabled}
                        className="rounded-full"
                      />
                      <label htmlFor={`flow-${flow.id}`} className="font-medium cursor-pointer">
                        {flow.label}
                      </label>
                      {flow.subOptions && flow.id === "home_service" && isSelected && (
                        <select
                          className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"
                          value={currentIndustry}
                          onChange={(e) => onSelect(e.target.value as Industry)}
                          disabled={disabled}
                        >
                          {flow.subOptions.map((sub) => (
                            <option key={sub.value} value={(sub as { industry?: Industry }).industry ?? sub.value}>
                              {sub.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {flow.subOptions && flow.id === "automotive" && isSelected && (
                        <select
                          className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"
                          value={currentOffersRoadside ? "roadside" : "no_roadside"}
                          onChange={(e) => onSelect(Industry.AUTO_REPAIR, e.target.value === "roadside")}
                          disabled={disabled}
                        >
                          {flow.subOptions.map((sub) => (
                            <option key={sub.value} value={sub.value}>
                              {sub.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
                <FlowPreview flow={flow} locked={isLocked} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
