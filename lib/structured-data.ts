import { AUTHOR_PATH, GUIDE_AUTHOR_NAME } from "@/lib/guides/authorship"
import { GOOGLE_PLAY_STORE_URL } from "@/lib/mobile-app"
import { SUPPORT_EMAIL } from "@/lib/site-contact"
import { SITE_URL } from "@/lib/site-url"
import { pricingSchemaTrialDescription } from "@/lib/trial-marketing"
import {
  organizationDescription,
  softwareApplicationDescription,
  webSiteDescription,
} from "@/lib/marketing/positioning"

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CallGrabbr",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: organizationDescription(),
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
      contactType: "customer support",
      availableLanguage: "English",
    },
    sameAs: [GOOGLE_PLAY_STORE_URL],
  }
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CallGrabbr",
    url: SITE_URL,
    description: webSiteDescription(),
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

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  }
}

export function webPageJsonLd(input: {
  name: string
  description: string
  path: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`,
    isPartOf: {
      "@type": "WebSite",
      name: "CallGrabbr",
      url: SITE_URL,
    },
  }
}

export function personAuthorJsonLd() {
  const url = `${SITE_URL}${AUTHOR_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: GUIDE_AUTHOR_NAME,
    jobTitle: "Service Business Expert",
    url,
    image: `${SITE_URL}/marketing/founder.jpg`,
    worksFor: {
      "@type": "Organization",
      name: "CallGrabbr",
      url: SITE_URL,
    },
  }
}

export function articleJsonLd(input: {
  headline: string
  description: string
  path: string
  datePublished: string
  dateModified: string
}) {
  const url = `${SITE_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`
  const authorUrl = `${SITE_URL}${AUTHOR_PATH}`
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      "@type": "Person",
      "@id": `${authorUrl}#person`,
      name: GUIDE_AUTHOR_NAME,
      url: authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "CallGrabbr",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: url,
    image: `${SITE_URL}/opengraph-image`,
  }
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CallGrabbr",
    applicationCategory: "BusinessApplication",
    operatingSystem: ["Web", "Android"],
    url: SITE_URL,
    downloadUrl: GOOGLE_PLAY_STORE_URL,
    description: softwareApplicationDescription(),
    offers: {
      "@type": "Offer",
      price: "99",
      priceCurrency: "USD",
      description: pricingSchemaTrialDescription(),
    },
  }
}
