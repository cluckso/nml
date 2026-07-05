import { Industry } from "@prisma/client"
import { buildDedicatedGlobalPrompt, type DedicatedPromptOptions } from "./receptionist-prompt"

export type BusinessHoursInput = {
  open?: string
  close?: string
  days?: string[]
} | null

export type { DedicatedPromptOptions }

/**
 * Builds the agent global prompt for per-business dedicated agents.
 * Core personality is in lib/receptionist-prompt.ts; owner-editable industry blocks in config/agent-prompt.ts.
 */
export function generatePrompt(
  businessName: string,
  industry: Industry,
  serviceAreas: string[],
  options?: DedicatedPromptOptions
): string {
  return buildDedicatedGlobalPrompt(businessName, industry, serviceAreas, options)
}
