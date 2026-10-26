/**
 * Durable keyword / search-intent map for CallGrabbr SEO (KAN-6).
 * Primary intents lead with missed-call lead capture; answering-service terms are secondary.
 */

export type SearchIntent = {
  /** Primary query the page should win */
  primary: string
  /** Supporting / long-tail queries */
  secondary: string[]
  /** Canonical path that owns this intent */
  path: string
}

/** Site-wide shared keywords (meta keywords + fallback). */
export const SHARED_SEO_KEYWORDS = [
  "missed call lead capture",
  "after hours lead capture",
  "after hours lead capture HVAC",
  "voicemail alternative for contractors",
  "stop losing jobs to missed calls",
  "contractor lead capture from missed calls",
  "lead capture phone system",
  "missed call text alert",
  "missed call solution",
  "AI answering for trades",
  "HVAC answering service",
  "plumber answering service",
  "local service business",
  "CallGrabbr",
] as const

/** Intent → page ownership. Used for planning and page-specific keyword arrays. */
export const SEARCH_INTENTS: SearchIntent[] = [
  {
    primary: "missed call lead capture",
    secondary: [
      "stop losing jobs to missed calls",
      "voicemail alternative for contractors",
      "contractor lead capture from missed calls",
    ],
    path: "/",
  },
  {
    primary: "missed call lead capture pricing",
    secondary: [
      "AI answering service pricing trades",
      "after hours answering cost contractors",
      "CallGrabbr pricing",
    ],
    path: "/pricing",
  },
  {
    primary: "CallGrabbr vs AI answering",
    secondary: [
      "CallGrabbr vs Rosie",
      "CallGrabbr vs Ruby",
      "CallGrabbr vs Smith.ai",
      "missed call lead capture vs AI answering",
    ],
    path: "/compare",
  },
  {
    primary: "missed call lead capture FAQ",
    secondary: ["call forwarding setup contractors", "after hours lead capture FAQ"],
    path: "/docs/faq",
  },
  {
    primary: "HVAC missed call lead capture",
    secondary: ["after hours lead capture HVAC", "HVAC answering service"],
    path: "/for/hvac",
  },
  {
    primary: "plumbing missed call lead capture",
    secondary: ["plumber answering service", "after hours plumber lead capture"],
    path: "/for/plumbing",
  },
  {
    primary: "electrical missed call lead capture",
    secondary: ["electrician answering service", "missed electrical service calls"],
    path: "/for/electrical",
  },
  {
    primary: "auto repair missed call lead capture",
    secondary: ["auto shop answering service", "missed calls auto repair"],
    path: "/for/auto-repair",
  },
  {
    primary: "handyman missed call lead capture",
    secondary: ["handyman answering service", "solo operator missed calls"],
    path: "/for/handyman",
  },
  {
    primary: "cleaning missed call lead capture",
    secondary: ["cleaning company answering", "speed to lead cleaning"],
    path: "/for/cleaning",
  },
  {
    primary: "landscaping missed call lead capture",
    secondary: ["landscaping answering service", "seasonal missed calls landscaping"],
    path: "/for/landscaping",
  },
  {
    primary: "childcare missed call lead capture",
    secondary: ["daycare tour inquiry capture", "childcare center phone answering"],
    path: "/for/childcare",
  },
  {
    primary: "Zapier CRM webhook missed call leads",
    secondary: ["CallGrabbr Zapier", "send leads to Jobber ServiceTitan"],
    path: "/integrations/zapier",
  },
  {
    primary: "contractor guides missed call lead capture",
    secondary: ["best AI answering HVAC", "AI vs live answering contractors"],
    path: "/guides",
  },
  {
    primary: "missed call lead capture blog",
    secondary: ["contractor phone tips", "after hours answering notes"],
    path: "/blog",
  },
]

export function keywordsForPath(path: string): string[] {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`
  const intent = SEARCH_INTENTS.find((item) => item.path === normalized)
  if (!intent) return [...SHARED_SEO_KEYWORDS]
  return [...SHARED_SEO_KEYWORDS, intent.primary, ...intent.secondary]
}

export function industryIntentKeywords(industryName: string): string[] {
  return [
    ...SHARED_SEO_KEYWORDS,
    `${industryName} missed call lead capture`,
    `${industryName} after hours lead capture`,
    `${industryName} missed calls`,
    `${industryName} answering service`,
  ]
}
