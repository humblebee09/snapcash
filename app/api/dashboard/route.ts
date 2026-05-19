import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { orderItems: { include: { product: true } }, customer: true },
      orderBy: { createdAt: "desc" },
    })

    const totalPendapatan = orders.reduce((sum, o) => sum + o.total, 0)
    const totalTransaksi = orders.length
    const totalProduk = await prisma.product.count()
    const totalPelanggan = await prisma.customer.count()

    const grafik = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateEnd = new Date(date)
      dateEnd.setHours(23, 59, 59, 999)
      const dayOrders = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= date && d <= dateEnd
      })
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
      grafik.push({ day: days[date.getDay()], total: dayOrders.reduce((sum, o) => sum + o.total, 0) })
    }

    const recentOrders = orders.slice(0, 5).map(o => ({
      id: o.id,
      customer: o.customer?.name || "Pelanggan Umum",
      email: o.customer?.email || "",
      total: o.total,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }))

    return NextResponse.json({ totalPendapatan, totalTransaksi, totalProduk, totalPelanggan, grafik, recentOrders })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}
