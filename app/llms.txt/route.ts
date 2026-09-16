import { NextResponse } from "next/server"
import { buildLlmsTxt } from "@/lib/marketing/llms-txt"

export function GET() {
  return new NextResponse(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
