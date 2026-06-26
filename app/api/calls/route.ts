import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    if (!user.businessId) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 400 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const rawLimit = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT
    const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit))
    const emergency = searchParams.get("emergency")
    const search = searchParams.get("search")

    const where: Prisma.CallWhereInput = {
      businessId: user.businessId,
    }

    if (emergency === "true") {
      where.emergencyFlag = true
    }

    if (search?.trim()) {
      where.OR = [
        { callerName: { contains: search.trim(), mode: "insensitive" } },
        { callerPhone: { contains: search.trim(), mode: "insensitive" } },
        { issueDescription: { contains: search.trim(), mode: "insensitive" } },
      ]
    }

    const [calls, total] = await Promise.all([
      db.call.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.call.count({ where }),
    ])

    return NextResponse.json({
      calls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get calls error:", error)
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    )
  }
}
