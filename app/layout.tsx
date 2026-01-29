import type { Metadata } from "next"
import Link from "next/link"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Nav } from "@/components/nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NeverMissLead-AI - Never Miss Another Call",
  description: "AI-powered call answering and lead intake for local service businesses",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6">
            <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
