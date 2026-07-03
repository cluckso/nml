/**
 * Canonical CallGrabbr brand tokens.
 * Visual source of truth: public/brand_ref.png — open it before creating any marketing asset.
 */

/** Absolute path to the brand reference board (repo-relative for docs). */
export const BRAND_REF_PATH = "public/brand_ref.png" as const

/** Approved logo files (do not substitute screenshots or redraws). */
export const BRAND_LOGO = {
  /** Full wordmark — marketing, ads, print, email headers */
  fullHd: "/logo_HD.png",
  /** Standard web wordmark */
  full: "/logo.png",
  /** App icon / favicon */
  icon: "/icon.png",
  /** Square mark when space is tight */
  iconMark: "/logo_icon.png",
} as const

/**
 * Core palette — matches app/globals.css (.dark theme) and brand_ref.png.
 * Use HEX in Canva/Figma; HSL in Tailwind/CSS.
 */
export const BRAND_COLORS = {
  /** Page background — deep navy */
  background: { hex: "#050B18", hsl: "224 71% 6%" },
  /** Card / elevated surfaces */
  surface: { hex: "#0A1224", hsl: "224 71% 8%" },
  /** Primary accent — electric blue (buttons, links, highlights) */
  primary: { hex: "#3B8FF6", hsl: "217 91% 60%" },
  /** Body text on dark */
  foreground: { hex: "#F1F5F9", hsl: "210 40% 98%" },
  /** Muted / secondary text */
  muted: { hex: "#94A3B8", hsl: "215 20% 65%" },
  /** Urgency / missed-call warnings */
  destructive: { hex: "#DC2626", hsl: "0 62.8% 50%" },
  /** Hero headline gradient stops (left → right) */
  heroGradient: ["#67E8F9", "#60A5FA", "#A78BFA"] as const,
  /** Subtle border on dark UI */
  border: { hex: "#1E293B", hsl: "224 40% 18%" },
} as const

export const BRAND_TYPOGRAPHY = {
  /** Marketing site uses system UI stack via Tailwind; keep headlines bold, body regular */
  headlineWeight: "700",
  bodyWeight: "400",
  /** Prefer sentence case for tips; title case for short headlines only */
  headlineCase: "sentence" as const,
} as const
