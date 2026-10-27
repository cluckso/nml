import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { SiteNav } from "@/components/nav/SiteNav"
import { SiteFooter } from "@/components/nav/SiteFooter"
import { BrandMark } from "@/components/brand/BrandMark"
import { SUPPORT_EMAIL } from "@/lib/site-contact"
import { VS_PAGE_LINKS } from "@/lib/marketing/comparisons"
import { GOOGLE_PLAY_STORE_URL } from "@/lib/mobile-app"
import { HOMEPAGE_INDUSTRY_LINKS } from "@/lib/industry-data"
import {
  GA4_MEASUREMENT_ID,
  googleSiteVerificationToken,
} from "@/lib/seo-monitoring"
import { SITE_URL } from "@/lib/site-url"
import { siteMetaDescription } from "@/lib/trial-marketing"
import { JsonLd } from "@/components/seo/JsonLd"
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data"

const inter = Inter({ subsets: ["latin"], display: "swap" })

const googleSiteVerification = googleSiteVerificationToken()

// Google Tag Manager — set NEXT_PUBLIC_GTM_ID in your host env (e.g. GTM-XXXXXXX).
const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim()

/** Google Analytics (gtag.js) — measurement ID for all pages. */
const GA_MEASUREMENT_ID = GA4_MEASUREMENT_ID

/** Spotify Ads Manager pixel — PAGE_VIEW on load. */
const SPOTIFY_PIXEL_KEY = "8b593790e34b49699d8e5caa3c54f20d"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CallGrabbr - Stop Losing Jobs to Missed Calls",
  description: siteMetaDescription(),
  icons: { icon: "/icon.webp" },
  verification: { google: googleSiteVerification },
  openGraph: {
    title: "CallGrabbr - Stop Losing Jobs to Missed Calls",
    description: siteMetaDescription(),
    url: SITE_URL,
    siteName: "CallGrabbr",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CallGrabbr — Stop losing jobs to missed calls",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CallGrabbr - Stop Losing Jobs to Missed Calls",
    description: siteMetaDescription(),
    images: ["/opengraph-image"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-background text-foreground`}>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height={0}
              width={0}
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
            `.trim(),
          }}
        />
        {/* Google Tag Manager — dataLayer events from lib/funnel/analytics.ts */}
        {gtmId && (
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer=window.dataLayer||[];
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');
              `.trim(),
            }}
          />
        )}
        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2020653371834861');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height={1}
            width={1}
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2020653371834861&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* Roku Pixel — PAGE_VIEW on load; subscription events via lib/analytics */}
        <Script
          id="roku-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(e,r){if(!e.rkp){var t=e.rkp=function(){
var e=Array.prototype.slice.call(arguments);
e.push(Date.now()),t.eventProcessor?t.eventProcessor.apply(t,e):t.queue.push(e)
};t.initiatorVersion="1.0",t.queue=[],t.load=function(e){
var t=r.createElement("script");t.async=!0,t.src=e;
var n=r.getElementsByTagName("script")[0];
(n?n.parentNode:r.body).insertBefore(t,n)},rkp.load("https://cdn.ravm.tv/ust/dist/rkp.loader.js")}
}(window,document);
rkp("init","PaccPmsytSiq");rkp("event","PAGE_VIEW");
            `,
          }}
        />
        {/* Spotify Ads Manager — view on load; purchase via lib/analytics.ts */}
        <Script
          id="spotify-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(w,d){
  var id='spdt-capture',n='script';
  if(!d.getElementById(id)){
    w.spdt=w.spdt||function(){(w.spdt.q=w.spdt.q||[]).push(arguments);};
    var e=d.createElement(n);e.id=id;e.async=1;
    e.src='https://pixel.byspotify.com/ping.min.js';
    var s=d.getElementsByTagName(n)[0];
    s.parentNode.insertBefore(e,s);
  }
  w.spdt('conf',{key:'${SPOTIFY_PIXEL_KEY}'});
  w.spdt('view');
})(window,document);
            `.trim(),
          }}
        />
        <Providers>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter>
            <footer className="border-t border-border/70 bg-muted/25">
              <div className="container mx-auto px-4 py-12 md:py-14">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-8">
                  <div className="flex flex-col items-start gap-4">
                    <BrandMark size="md" />
                    <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                      AI-powered missed-call lead capture for local service businesses.
                    </p>
                    <a
                      href={GOOGLE_PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Get the Android app
                    </a>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>

                  <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">Product</h2>
                    <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                      <li><Link href="/#how-it-works" className="transition-colors hover:text-primary">How It Works</Link></li>
                      <li><Link href="/#features" className="transition-colors hover:text-primary">Features</Link></li>
                      <li><Link href="/#demo" className="transition-colors hover:text-primary">Demo</Link></li>
                      <li><Link href="/pricing" className="transition-colors hover:text-primary">Pricing</Link></li>
                      <li><Link href="/integrations/zapier" className="transition-colors hover:text-primary">Zapier</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">Industries</h2>
                    <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                      {HOMEPAGE_INDUSTRY_LINKS.map(({ name, slug }) => (
                        <li key={slug}>
                          <Link href={`/for/${slug}`} className="transition-colors hover:text-primary">
                            {name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">Resources</h2>
                    <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                      <li><Link href="/guides" className="transition-colors hover:text-primary">Guides</Link></li>
                      <li><Link href="/compare" className="transition-colors hover:text-primary">Comparisons</Link></li>
                      <li><Link href="/blog" className="transition-colors hover:text-primary">Blog</Link></li>
                      <li><Link href="/docs/faq" className="transition-colors hover:text-primary">Help &amp; FAQ</Link></li>
                      <li><Link href="/changelog" className="transition-colors hover:text-primary">Changelog</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">Company</h2>
                    <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                      <li><Link href="/about" className="transition-colors hover:text-primary">About</Link></li>
                      <li><Link href="/sign-in" className="transition-colors hover:text-primary">Sign In</Link></li>
                      <li><Link href="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
                      <li><Link href="/terms" className="transition-colors hover:text-primary">Terms of Service</Link></li>
                      <li><Link href="/sms-terms" className="transition-colors hover:text-primary">SMS Terms</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="mt-10 border-t border-border/70 pt-6">
                  <div className="flex flex-col gap-4 text-center text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:text-left">
                    <p>
                      © {new Date().getFullYear()} CallGrabbr. Missed-call lead capture for local service businesses.
                    </p>
                    <p>
                      Compare:{" "}
                      {VS_PAGE_LINKS.map((item, i) => (
                        <span key={item.href}>
                          {i > 0 && <span className="px-1 text-muted-foreground/60">·</span>}
                          <Link href={item.href} className="transition-colors hover:text-primary">
                            {item.shortLabel}
                          </Link>
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </SiteFooter>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
