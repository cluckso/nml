import { SUPPORT_EMAIL } from "@/lib/site-contact"
import { SITE_URL } from "@/lib/site-url"

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CallGrabbr",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description:
      "Call answering for local service businesses. Answers missed calls and texts you the lead in seconds.",
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
      contactType: "customer support",
      availableLanguage: "English",
    },
  }
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CallGrabbr",
    url: SITE_URL,
    description:
      "Stop losing jobs to voicemail. CallGrabbr answers when you can't and delivers lead details by text or email.",
    publisher: {
      "@type": "Organization",
      name: "CallGrabbr",
      url: SITE_URL,
    },
  }
}

export type FaqItem = {
  question: string
  answer: string
}

export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CallGrabbr",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "AI call answering for HVAC, plumbing, auto repair, and other local service businesses. Captures lead details and sends instant text or email summaries.",
    offers: {
      "@type": "Offer",
      price: "99",
      priceCurrency: "USD",
      description: "Plans from $99/month with a 7-day free trial",
    },
  }
}
