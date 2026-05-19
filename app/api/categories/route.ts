import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(categories)
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, icon } = await req.json()
    const category = await prisma.category.create({ data: { name, icon: icon || "" } })
    return NextResponse.json(category)
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 })
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}
