import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "month"

    const now = new Date()
    let startDate = new Date()
    if (period === "today") { startDate.setHours(0, 0, 0, 0) }
    else if (period === "week") { startDate.setDate(now.getDate() - 7) }
    else if (period === "month") { startDate = new Date(now.getFullYear(), now.getMonth(), 1) }
    else if (period === "year") { startDate = new Date(now.getFullYear(), 0, 1) }

    const orders = await prisma.order.findMany({
      where: { status: "completed", createdAt: { gte: startDate } },
      include: { orderItems: { include: { product: true } }, table: true, customer: true },
      orderBy: { createdAt: "desc" },
    })

    const rows = [
      ["No", "Tanggal", "Tipe Order", "Meja", "Pelanggan", "Metode Bayar", "Subtotal", "Diskon", "Pajak", "Total"],
      ...orders.map((o, i) => [
        i + 1,
        new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(o.createdAt)),
        o.orderType === "dinein" ? "Dine In" : "Take Away",
        o.table ? `Meja ${o.table.number}` : "-",
        o.customerName || o.customer?.name || "-",
        o.paymentMethod || "-",
        o.subtotal,
        o.discount,
        o.tax,
        o.total,
      ])
    ]

    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const bom = "\uFEFF"

    return new NextResponse(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-${period}-${now.toISOString().slice(0,10)}.csv"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Gagal export" }, { status: 500 })
  }
}
