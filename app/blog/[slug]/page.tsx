import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getArticleBySlug } from "@/lib/articles"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"
import { SITE_URL } from "@/lib/site-url"

export const dynamic = "force-dynamic"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) {
    return { title: "Article not found" }
  }

  const title = article.metaTitle || article.title || "CallGrabbr Blog"
  const description =
    article.metaDescription || article.subtitle || article.title || "CallGrabbr blog article"
  const url = `${SITE_URL}/blog/${article.slug}`
  const images = article.imageUrl
    ? [{ url: article.imageUrl }]
    : [DEFAULT_OG_IMAGE]

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images,
      ...(article.publishedAt ? { publishedTime: article.publishedAt.toISOString() } : {}),
      ...(article.updatedAt ? { modifiedTime: article.updatedAt.toISOString() } : {}),
      ...(article.authorName ? { authors: [article.authorName] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.imageUrl ? [article.imageUrl] : [DEFAULT_OG_IMAGE.url],
    },
  }
}

function formatDate(value: Date | null | undefined): string | null {
  if (!value) return null
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article || !article.slug) {
    notFound()
  }

  const title = article.title || article.metaTitle || "Untitled"
  const when = formatDate(article.publishedAt ?? article.updatedAt)
  const canonical = `${SITE_URL}/blog/${article.slug}`

  let jsonLdHtml: string | null = null
  if (article.jsonLdSchema != null) {
    try {
      jsonLdHtml = JSON.stringify(article.jsonLdSchema)
    } catch {
      jsonLdHtml = null
    }
  }

  return (
    <>
      {/* Explicit head tags for crawlers (canonical / OG / JSON-LD). */}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={article.metaTitle || title} />
      <meta
        property="og:description"
        content={article.metaDescription || article.subtitle || title}
      />
      {article.imageUrl ? <meta property="og:image" content={article.imageUrl} /> : null}
      <meta property="og:url" content={canonical} />
      {jsonLdHtml ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
        />
      ) : null}

      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <p className="text-sm mb-6">
          <Link href="/blog" className="text-primary hover:underline underline-offset-2">
            ← Blog
          </Link>
        </p>

        {article.category && (
          <p className="text-sm font-medium text-primary mb-3">{article.category}</p>
        )}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{title}</h1>
        {article.subtitle ? (
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{article.subtitle}</p>
        ) : null}
        <p className="text-sm text-muted-foreground mb-10">
          {[article.authorName, when, article.readTime].filter(Boolean).join(" · ")}
        </p>

        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt={title}
            className="w-full h-auto rounded-xl mb-10 border border-border/40"
          />
        ) : null}

        {article.contentHtml ? (
          <div
            className="blog-article-body space-y-4 text-foreground/90 leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:mb-4 [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_img]:rounded-lg [&_img]:my-6"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        ) : (
          <p className="text-muted-foreground">This article has no content yet.</p>
        )}
      </article>
    </>
  )
}
