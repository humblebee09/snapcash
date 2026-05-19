import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "today"
    const view = searchParams.get("view") || "summary"

    const now = new Date()
    let startDate = new Date()

    if (period === "today") {
      startDate.setHours(0, 0, 0, 0)
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1)
    }

    const orders = await prisma.order.findMany({
      where: { status: "completed", createdAt: { gte: startDate } },
      include: { orderItems: { include: { product: true } }, customer: true, table: true },
      orderBy: { createdAt: "desc" },
    })

    const totalPenjualan = orders.reduce((sum, o) => sum + o.total, 0)
    const totalTransaksi = orders.length
    const rataRata = totalTransaksi > 0 ? Math.round(totalPenjualan / totalTransaksi) : 0
    const totalProdukTerjual = orders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0)

    // Grafik harian
    const grafikHarian = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const dateEnd = new Date(date)
      dateEnd.setHours(23, 59, 59, 999)
      const dayOrders = orders.filter(o => { const d = new Date(o.createdAt); return d >= date && d <= dateEnd })
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
      grafikHarian.push({
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        day: days[date.getDay()],
        total: dayOrders.reduce((sum, o) => sum + o.total, 0),
        count: dayOrders.length,
      })
    }

    // Grafik bulanan (12 bulan terakhir)
    const grafikBulanan = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const dateEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const allOrders = await prisma.order.findMany({ where: { status: "completed", createdAt: { gte: date, lte: dateEnd } } })
      const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"]
      grafikBulanan.push({
        label: bulan[date.getMonth()],
        total: allOrders.reduce((sum, o) => sum + o.total, 0),
        count: allOrders.length,
      })
    }

    // Grafik tahunan (5 tahun terakhir)
    const grafikTahunan = []
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i
      const dateStart = new Date(year, 0, 1)
      const dateEnd = new Date(year, 11, 31, 23, 59, 59)
      const allOrders = await prisma.order.findMany({ where: { status: "completed", createdAt: { gte: dateStart, lte: dateEnd } } })
      grafikTahunan.push({
        label: year.toString(),
        total: allOrders.reduce((sum, o) => sum + o.total, 0),
        count: allOrders.length,
      })
    }

    // Produk terlaris
    const productMap: Record<string, { name: string; qty: number; total: number }> = {}
    orders.forEach(o => {
      o.orderItems.forEach(item => {
        if (!productMap[item.productId]) productMap[item.productId] = { name: item.product.name, qty: 0, total: 0 }
        productMap[item.productId].qty += item.quantity
        productMap[item.productId].total += item.price * item.quantity
      })
    })
    const produkTerlaris = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 10)

    return NextResponse.json({
      totalPenjualan, totalTransaksi, rataRata, totalProdukTerjual,
      grafikHarian, grafikBulanan, grafikTahunan,
      produkTerlaris,
      orders: orders.slice(0, 50),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}
