import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; optionId: string }> }) {
  try {
    const { optionId } = await params
    await prisma.productOption.delete({ where: { id: optionId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 })
  }
}
