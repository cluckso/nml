import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth"
import { db } from "@/lib/db"

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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const emergency = searchParams.get("emergency")
    const search = searchParams.get("search")

    const where: any = {
      businessId: user.businessId,
    }

    if (emergency === "true") {
      where.emergencyFlag = true
    }

    if (search) {
      where.OR = [
        { callerName: { contains: search, mode: "insensitive" } },
        { callerPhone: { contains: search, mode: "insensitive" } },
        { issueDescription: { contains: search, mode: "insensitive" } },
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
