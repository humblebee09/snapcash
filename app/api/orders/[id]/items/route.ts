import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { productId, quantity, price } = await req.json()

    const existing = await prisma.orderItem.findFirst({ where: { orderId: id, productId } })
    if (existing) {
      await prisma.orderItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } })
    } else {
      await prisma.orderItem.create({ data: { orderId: id, productId, quantity, price } })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    })

    const subtotal = order!.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const tax = Math.round(subtotal * 0.1)
    await prisma.order.update({ where: { id }, data: { subtotal, tax, total: subtotal + tax } })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Gagal tambah item" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { itemId } = await req.json()
    await prisma.orderItem.delete({ where: { id: itemId } })

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    })
    const subtotal = order!.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const tax = Math.round(subtotal * 0.1)
    await prisma.order.update({ where: { id }, data: { subtotal, tax, total: subtotal + tax } })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Gagal hapus item" }, { status: 500 })
  }
}
