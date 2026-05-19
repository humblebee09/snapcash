import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const options = await prisma.productOption.findMany({
      where: { productId: id },
      include: { choices: true },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(options)
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { name, required, choices } = await req.json()
    const option = await prisma.productOption.create({
      data: {
        productId: id,
        name,
        required: required || false,
        choices: {
          create: choices.map((c: { name: string; extraPrice?: number }) => ({
            name: c.name,
            extraPrice: c.extraPrice || 0,
          })),
        },
      },
      include: { choices: true },
    })
    return NextResponse.json(option)
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}
