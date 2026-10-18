-- Blog articles ingested from GrandRanker (external CMS webhook).
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "articles_external_id_key" ON "articles"("external_id");
CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug");
CREATE INDEX IF NOT EXISTS "articles_published_at_idx" ON "articles"("published_at");
CREATE INDEX IF NOT EXISTS "articles_updated_at_idx" ON "articles"("updated_at");
