import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } }, table: true, customer: true },
    })
    return NextResponse.json(order)
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const order = await prisma.order.update({ where: { id }, data: body })
    return NextResponse.json(order)
  } catch (e) {
    return NextResponse.json({ error: "Gagal update order" }, { status: 500 })
  }
}
