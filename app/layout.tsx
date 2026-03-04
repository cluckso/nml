import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Nav } from "@/components/nav"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.callgrabbr.com"

export const metadata: Metadata = {
  title: "CallGrabbr - Stop Losing Jobs to Voicemail",
  description: "80% of callers won't leave voicemail — they call the next business. CallGrabbr answers missed calls and texts you the lead in seconds. 7-day free trial.",
  icons: { icon: "/icon.png" },
  openGraph: {
    title: "CallGrabbr - Stop Losing Jobs to Voicemail",
    description: "80% of callers won't leave voicemail. AI captures 80-95% of leads vs voicemail's 5-15%. We answer when you can't and text you the lead instantly.",
    url: siteUrl,
    siteName: "CallGrabbr",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CallGrabbr - Stop Losing Jobs to Voicemail",
    description: "80% of callers won't leave voicemail. CallGrabbr answers missed calls and texts you the lead in seconds. 7-day free trial.",
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
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground/80 mt-4">
                © {new Date().getFullYear()} CallGrabbr. AI call answering for local service businesses.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
