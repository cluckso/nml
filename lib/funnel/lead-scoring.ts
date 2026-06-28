/** Simple weighted lead scoring from funnel questionnaire answers. */

export function calculateLeadScore(
  responses: Record<string, string>,
  weights?: Record<string, Record<string, number>>
): number {
  if (!weights) return 0

  let score = 0
  for (const [fieldId, value] of Object.entries(responses)) {
    const fieldWeights = weights[fieldId]
    if (fieldWeights && value in fieldWeights) {
      score += fieldWeights[value] ?? 0
    }
  }
  return score
}

export function scoreFromFieldOptions(
  responses: Record<string, string>,
  steps: { fields: { id: string; options?: { value: string; score?: number }[] }[] }[]
): number {
  let score = 0
  for (const step of steps) {
    for (const field of step.fields) {
      const value = responses[field.id]
      if (!value || !field.options) continue
      const option = field.options.find((o) => o.value === value)
      if (option?.score) score += option.score
    }
  }
  return score
}
