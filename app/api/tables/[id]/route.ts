import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const table = await prisma.table.update({ where: { id }, data: body })
    return NextResponse.json(table)
  } catch (e) {
    return NextResponse.json({ error: "Gagal update meja" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.table.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Gagal hapus meja" }, { status: 500 })
  }
}
