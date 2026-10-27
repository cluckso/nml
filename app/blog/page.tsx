import type { Metadata } from "next"
import Link from "next/link"
import { unstable_cache } from "next/cache"
import { listArticles } from "@/lib/articles"
import { JsonLd } from "@/components/seo/JsonLd"
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/structured-data"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { keywordsForPath } from "@/lib/seo-keywords"
import { SEO_HUBS } from "@/lib/seo-hubs"
import { formatBlogDate } from "@/lib/blog-date"

export const dynamic = "force-dynamic"

const getCachedArticles = unstable_cache(listArticles, ["blog-articles"], {
  revalidate: 3600,
})

const { title: TITLE, description: DESCRIPTION } = SEO_HUBS.blog

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: keywordsForPath("/blog"),
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/blog",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

export default async function BlogIndexPage() {
  const articles = await getCachedArticles()
  const published = articles.filter((a) => a.slug)

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <JsonLd
        data={[
          webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: "/blog",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />

      <p className="text-sm font-medium text-primary mb-3">Blog</p>
      <h1 className="text-4xl font-bold tracking-tight mb-4">{SEO_HUBS.blog.heading}</h1>
      <p className="text-muted-foreground mb-10 leading-relaxed">{DESCRIPTION}</p>

      {published.length === 0 ? (
        <p className="text-muted-foreground">No articles yet. Check back soon.</p>
      ) : (
        <ul className="space-y-8 list-none">
          {published.map((article) => {
            const href = `/blog/${article.slug}`
            const when = formatBlogDate(article.publishedAt ?? article.updatedAt)
            return (
              <li key={article.id} className="border-b border-border/50 pb-8 last:border-0">
                {article.category && (
                  <p className="text-xs font-medium uppercase tracking-wide text-primary mb-2">
                    {article.category}
                  </p>
                )}
                <h2 className="text-2xl font-semibold tracking-tight mb-2">
                  <Link href={href} className="hover:text-primary transition-colors">
                    {article.title || article.slug}
                  </Link>
                </h2>
                {article.subtitle || article.metaDescription ? (
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {article.subtitle || article.metaDescription}
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  {[article.authorName, when, article.readTime].filter(Boolean).join(" · ")}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
