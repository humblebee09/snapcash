import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

async function getRole() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return decoded.role
  } catch { return null }
}

export async function GET() {
  const role = await getRole()
  if (role !== "owner" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const users = await prisma.user.findMany({ select: { id: true, name: true, username: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const role = await getRole()
  if (role !== "owner" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { name, username, password, role: userRole } = await req.json()
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, username, password: hashed, role: userRole || "karyawan" } })
    return NextResponse.json({ id: user.id, name: user.name, username: user.username, role: user.role })
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Username sudah dipakai" }, { status: 400 })
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 })
  }
}
