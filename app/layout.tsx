import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Nav } from "@/components/nav"
import { SUPPORT_EMAIL } from "@/lib/site-contact"
import { GOOGLE_PLAY_STORE_URL } from "@/lib/mobile-app"
import { SITE_URL } from "@/lib/site-url"
import { JsonLd } from "@/components/seo/JsonLd"
import { organizationJsonLd, webSiteJsonLd } from "@/lib/structured-data"

const inter = Inter({ subsets: ["latin"] })

const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION || "vbp7kMaN9FYqtyLddH0hqILwUGQLAq6l8XbER6JwCJ0"

// Google Tag Manager — set NEXT_PUBLIC_GTM_ID in your host env (e.g. GTM-XXXXXXX).
const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim()

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CallGrabbr - Stop Losing Jobs to Voicemail",
  description: "80% of callers won't leave voicemail — they call the next business. CallGrabbr answers missed calls and texts you the lead in seconds. 7-day free trial.",
  icons: { icon: "/icon.png" },
  verification: { google: googleSiteVerification },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CallGrabbr - Stop Losing Jobs to Voicemail",
    description: "80% of callers won't leave voicemail. Live answering captures 80-95% of leads vs voicemail's 5-15%. We answer when you can't and text you the lead instantly.",
    url: SITE_URL,
    siteName: "CallGrabbr",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CallGrabbr — Stop losing jobs to voicemail",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CallGrabbr - Stop Losing Jobs to Voicemail",
    description: "80% of callers won't leave voicemail. CallGrabbr answers missed calls and texts you the lead in seconds. 7-day free trial.",
    images: ["/opengraph-image"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
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
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/50 py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <Link href="/pricing" className="hover:text-foreground font-medium">
                  Pricing
                </Link>
                <Link href="/docs/faq" className="hover:text-foreground font-medium">
                  Help &amp; FAQ
                </Link>
                <a
                  href={GOOGLE_PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground font-medium"
                >
                  Android app
                </a>
                <Link href="/funnel/hvac" className="hover:text-foreground text-xs opacity-70">
                  Funnel demo
                </Link>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="/sms-terms" className="hover:text-foreground">
                  SMS Terms
                </Link>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <p className="text-center text-xs text-muted-foreground/80 mt-4">
                © {new Date().getFullYear()} CallGrabbr. Call answering for local service businesses.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
