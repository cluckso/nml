/** sessionStorage key set at signup when user agrees to Terms + Privacy */
export const TERMS_ACCEPTED_STORAGE_KEY = "callgrabbr_terms_accepted"

export type UserTermsRecord = {
  termsAcceptedAt: Date | null
}

export function hasAcceptedTerms(user: UserTermsRecord | null | undefined): boolean {
  return user?.termsAcceptedAt != null
}
