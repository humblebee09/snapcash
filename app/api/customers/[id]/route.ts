import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const customer = await prisma.customer.update({ where: { id }, data: body })
    return NextResponse.json(customer)
  } catch (e) {
    return NextResponse.json({ error: "Gagal update pelanggan" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Gagal hapus pelanggan" }, { status: 500 })
  }
}
