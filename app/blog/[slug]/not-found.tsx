import Link from "next/link"

export default function BlogArticleNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-xl text-center">
      <h1 className="text-3xl font-bold tracking-tight mb-3">Article not found</h1>
      <p className="text-muted-foreground mb-8">
        That post is not published here, or the link is out of date.
      </p>
      <Link href="/blog" className="text-primary underline underline-offset-2">
        Back to blog
      </Link>
    </div>
  )
}
