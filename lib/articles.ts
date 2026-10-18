import { db } from "@/lib/db"
import type { Article, Prisma } from "@prisma/client"

let articlesTableReady: Promise<void> | null = null

/**
 * Ensure the GrandRanker `articles` table exists (pooler-safe DDL).
 * Vercel builds cannot reach Supabase direct :5432, so we create at runtime.
 */
export async function ensureArticlesTable(): Promise<void> {
  if (!articlesTableReady) {
    articlesTableReady = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "articles" (
          "id" TEXT NOT NULL,
          "external_id" TEXT NOT NULL,
          "title" TEXT,
          "slug" TEXT,
          "content_html" TEXT,
          "content_markdown" TEXT,
          "meta_title" TEXT,
          "meta_description" TEXT,
          "subtitle" TEXT,
          "category" TEXT,
          "author_name" TEXT,
          "image_url" TEXT,
          "read_time" TEXT,
          "word_count" INTEGER,
          "tags" JSONB,
          "faqs" JSONB,
          "json_ld_schema" JSONB,
          "language_code" TEXT,
          "published_at" TIMESTAMP(3),
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
        )
      `)
      await db.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "articles_external_id_key" ON "articles"("external_id")`
      )
      await db.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug")`
      )
      await db.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "articles_published_at_idx" ON "articles"("published_at")`
      )
      await db.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "articles_updated_at_idx" ON "articles"("updated_at")`
      )
    })().catch((err) => {
      articlesTableReady = null
      throw err
    })
  }
  await articlesTableReady
}

export type ArticleListItem = Pick<
  Article,
  | "id"
  | "title"
  | "slug"
  | "subtitle"
  | "category"
  | "authorName"
  | "imageUrl"
  | "readTime"
  | "publishedAt"
  | "updatedAt"
  | "metaDescription"
>

/** Newest articles first (published_at, then updated_at). */
export async function listArticles(): Promise<ArticleListItem[]> {
  await ensureArticlesTable()
  return db.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      category: true,
      authorName: true,
      imageUrl: true,
      readTime: true,
      publishedAt: true,
      updatedAt: true,
      metaDescription: true,
    },
  })
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await ensureArticlesTable()
  return db.article.findUnique({ where: { slug } })
}

export async function listArticleSitemapEntries(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  await ensureArticlesTable()
  const rows = await db.article.findMany({
    where: { slug: { not: null } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })
  return rows.filter((r): r is { slug: string; updatedAt: Date } => !!r.slug)
}

type IncomingArticle = Record<string, unknown>

function asString(value: unknown): string | null {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return null
}

function asInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Math.trunc(Number(value))
  }
  return null
}

function asJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined
  return value as Prisma.InputJsonValue
}

function asDate(value: unknown): Date | null {
  if (value == null || value === "") return null
  const d = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d
}

type ArticleWriteData = {
  externalId: string
  title: string | null
  slug: string | null
  contentHtml: string | null
  contentMarkdown: string | null
  metaTitle: string | null
  metaDescription: string | null
  subtitle: string | null
  category: string | null
  authorName: string | null
  imageUrl: string | null
  readTime: string | null
  wordCount: number | null
  tags: Prisma.InputJsonValue | undefined
  faqs: Prisma.InputJsonValue | undefined
  jsonLdSchema: Prisma.InputJsonValue | undefined
  languageCode: string | null
  publishedAt: Date | null
  updatedAt: Date
}

/** Map a GrandRanker article payload into known columns only. */
export function mapIncomingArticle(item: IncomingArticle): ArticleWriteData | null {
  const externalId = asString(item.id)?.trim()
  if (!externalId) return null

  return {
    externalId,
    title: asString(item.title),
    slug: asString(item.slug),
    contentHtml: asString(item.content_html),
    contentMarkdown: asString(item.content_markdown),
    metaTitle: asString(item.meta_title),
    metaDescription: asString(item.meta_description),
    subtitle: asString(item.subtitle),
    category: asString(item.category),
    authorName: asString(item.author_name),
    imageUrl: asString(item.image_url),
    readTime: asString(item.read_time),
    wordCount: asInt(item.word_count),
    tags: asJsonValue(item.tags),
    faqs: asJsonValue(item.faqs),
    jsonLdSchema: asJsonValue(item.json_ld_schema),
    languageCode: asString(item.language_code),
    publishedAt: asDate(item.publish_date ?? item.published_at),
    updatedAt: asDate(item.updated_at) ?? new Date(),
  }
}

function toPrismaData(data: ArticleWriteData): Prisma.ArticleUncheckedCreateInput {
  return {
    externalId: data.externalId,
    title: data.title,
    slug: data.slug,
    contentHtml: data.contentHtml,
    contentMarkdown: data.contentMarkdown,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    subtitle: data.subtitle,
    category: data.category,
    authorName: data.authorName,
    imageUrl: data.imageUrl,
    readTime: data.readTime,
    wordCount: data.wordCount,
    ...(data.tags !== undefined ? { tags: data.tags } : {}),
    ...(data.faqs !== undefined ? { faqs: data.faqs } : {}),
    ...(data.jsonLdSchema !== undefined ? { jsonLdSchema: data.jsonLdSchema } : {}),
    languageCode: data.languageCode,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
  }
}

export async function upsertArticlesFromPayload(articles: unknown): Promise<number> {
  await ensureArticlesTable()
  if (!Array.isArray(articles)) return 0
  let count = 0
  for (const raw of articles) {
    if (!raw || typeof raw !== "object") continue
    const mapped = mapIncomingArticle(raw as IncomingArticle)
    if (!mapped) continue
    const row = toPrismaData(mapped)
    await db.article.upsert({
      where: { externalId: mapped.externalId },
      create: row,
      update: {
        title: row.title,
        slug: row.slug,
        contentHtml: row.contentHtml,
        contentMarkdown: row.contentMarkdown,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        subtitle: row.subtitle,
        category: row.category,
        authorName: row.authorName,
        imageUrl: row.imageUrl,
        readTime: row.readTime,
        wordCount: row.wordCount,
        ...(mapped.tags !== undefined ? { tags: mapped.tags } : {}),
        ...(mapped.faqs !== undefined ? { faqs: mapped.faqs } : {}),
        ...(mapped.jsonLdSchema !== undefined ? { jsonLdSchema: mapped.jsonLdSchema } : {}),
        languageCode: row.languageCode,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
      },
    })
    count += 1
  }
  return count
}

export async function deleteArticleByExternalId(externalId: string): Promise<boolean> {
  await ensureArticlesTable()
  const id = externalId.trim()
  if (!id) return false
  try {
    await db.article.delete({ where: { externalId: id } })
    return true
  } catch {
    return false
  }
}
