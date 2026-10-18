import { NextRequest, NextResponse } from "next/server"
import {
  deleteArticleByExternalId,
  upsertArticlesFromPayload,
} from "@/lib/articles"

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"

/** Health check for GrandRanker / uptime monitors. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "articles-webhook" }, { status: 200 })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

function assertApiKey(req: NextRequest): boolean {
  const secret = process.env.GRANDRANKER_SECRET
  if (!secret) return false
  const key = req.headers.get("x-api-key")
  return !!key && key === secret
}

/**
 * GrandRanker articles webhook.
 * Accepts large JSON bodies (full HTML articles). Auth via X-API-Key === GRANDRANKER_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GRANDRANKER_SECRET) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }
    if (!assertApiKey(req)) {
      return unauthorized()
    }

    // Read raw text so large HTML payloads are accepted (up to platform / proxy limits).
    const raw = await req.text()
    if (raw.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    let body: unknown
    try {
      body = raw ? JSON.parse(raw) : {}
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    const payload = body as {
      event_type?: string
      data?: { articles?: unknown; id?: unknown }
    }
    const eventType = payload.event_type

    if (eventType === "publish_articles") {
      const articles = payload.data?.articles
      const upserted = await upsertArticlesFromPayload(articles)
      return NextResponse.json({ ok: true, upserted }, { status: 200 })
    }

    if (eventType === "unpublish_article") {
      const id = payload.data?.id
      if (typeof id !== "string" || !id.trim()) {
        return NextResponse.json({ error: "Missing data.id" }, { status: 400 })
      }
      await deleteArticleByExternalId(id)
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    return NextResponse.json({ error: "Unknown event_type" }, { status: 400 })
  } catch (error) {
    console.error("articles-webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, X-API-Key",
    },
  })
}
