import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "open", orderType: "dinein" },
      include: { orderItems: { include: { product: true } }, table: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}
