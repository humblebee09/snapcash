import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { orderItems: { include: { product: true } }, table: true, customer: true },
    })
    return NextResponse.json(orders)
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customerId, tableId, customerName, orderType, ...orderData } = body
    console.log('ORDER ITEMS:', JSON.stringify(items))

    if (orderType === "dinein" && tableId) {
      // Cek apakah meja sudah punya order open
      const existingOrder = await prisma.order.findFirst({
        where: { tableId, status: "open" }
      })
      if (existingOrder) {
        // Tambah item ke order yang sudah ada
        for (const item of items) {
          const existing = await prisma.orderItem.findFirst({ where: { orderId: existingOrder.id, productId: item.originalId || item.id } })
          if (existing) {
            await prisma.orderItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } })
          } else {
            await prisma.orderItem.create({ data: { orderId: existingOrder.id, productId: item.originalId || item.id, quantity: item.quantity, price: item.price } })
          }
        }
        const updated = await prisma.order.findUnique({ where: { id: existingOrder.id }, include: { orderItems: true } })
        const subtotal = updated!.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        const tax = Math.round(subtotal * 0.1)
        await prisma.order.update({ where: { id: existingOrder.id }, data: { subtotal, tax, total: subtotal + tax, customerName: customerName || existingOrder.customerName } })
        return NextResponse.json({ id: existingOrder.id, merged: true })
      }

      // Buat order baru dengan status open
      const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
      const tax = Math.round(subtotal * 0.1)
      const order = await prisma.order.create({
        data: {
          orderType: "dinein",
          status: "open",
          subtotal,
          tax,
          total: subtotal + tax,
          customerName: customerName || null,
          ...(tableId && { table: { connect: { id: tableId } } }),
          ...(customerId && { customer: { connect: { id: customerId } } }),
          orderItems: {
            create: items.map((item: any) => ({ quantity: item.quantity, price: item.price, product: { connect: { id: item.originalId || item.id } } }))
          },
        },
      })

      // Update status meja
      await prisma.table.update({ where: { id: tableId }, data: { status: "occupied", customer: customerName || "Tamu", startTime: new Date() } })

      return NextResponse.json({ id: order.id })
    }

    // Take away — langsung completed
    const subtotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
    const disc = orderData.discount || 0
    const tax = Math.round((subtotal - disc) * 0.1)
    const total = subtotal - disc + tax

    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderType: "takeaway",
        status: "completed",
        subtotal,
        tax,
        total,
        customerName: customerName || null,
        ...(customerId && { customer: { connect: { id: customerId } } }),
        orderItems: {
          create: items.map((item: any) => ({ quantity: item.quantity, price: item.price, product: { connect: { id: item.originalId || item.id } } }))
        },
      },
    })

    for (const item of items) {
      await prisma.product.update({ where: { id: item.originalId || item.id }, data: { stock: { decrement: item.quantity } } })
    }
    if (customerId) {
      await prisma.customer.update({ where: { id: customerId }, data: { totalSpent: { increment: total }, lastVisit: new Date() } })
    }

    return NextResponse.json({ id: order.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Gagal membuat order" }, { status: 500 })
  }
}
