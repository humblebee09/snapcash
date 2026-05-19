import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tables = await prisma.table.findMany({ orderBy: { number: "asc" } })
    return NextResponse.json(tables)
  } catch (e) {
    return NextResponse.json({ error: "Gagal mengambil data meja" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const table = await prisma.table.create({ data: body })
    return NextResponse.json(table)
  } catch (e) {
    return NextResponse.json({ error: "Gagal menambah meja" }, { status: 500 })
  }
}
