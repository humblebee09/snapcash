import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { paymentMethod, cashAmount, discountCode, discount } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } }, table: true },
    })
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 })

    const subtotal = order.subtotal
    const disc = discount || 0
    const tax = Math.round((subtotal - disc) * 0.1)
    const total = subtotal - disc + tax
    const change = paymentMethod === "Tunai" ? Math.max(cashAmount - total, 0) : 0

    await prisma.order.update({
      where: { id },
      data: { status: "completed", paymentMethod, cashAmount: cashAmount || 0, change, discount: disc, tax, total, discountCode: discountCode || null },
    })

    // Update stok produk
    for (const item of order.orderItems) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
    }

    // Set meja jadi available
    if (order.tableId) {
      await prisma.table.update({ where: { id: order.tableId }, data: { status: "available", customer: null, startTime: null } })
    }

    return NextResponse.json({ success: true, change })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Gagal bayar" }, { status: 500 })
  }
}
