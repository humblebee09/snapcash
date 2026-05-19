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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getRole()
  if (role !== "owner" && role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  if (body.password) body.password = await bcrypt.hash(body.password, 10)
  else delete body.password
  const user = await prisma.user.update({ where: { id }, data: body })
  return NextResponse.json(user)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = await getRole()
  if (role !== "owner") return NextResponse.json({ error: "Hanya owner yang bisa hapus user" }, { status: 401 })
  const { id } = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
