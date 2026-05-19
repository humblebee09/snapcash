import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return NextResponse.json({ id: decoded.id, name: decoded.name, role: decoded.role })
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
