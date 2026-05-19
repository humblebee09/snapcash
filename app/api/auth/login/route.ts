import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !user.isActive) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET!, { expiresIn: "1d" })
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } })
    res.cookies.set("token", token, { httpOnly: true, maxAge: 86400, path: "/" })
    return res
  } catch (e) {
    return NextResponse.json({ error: "Gagal login" }, { status: 500 })
  }
}
