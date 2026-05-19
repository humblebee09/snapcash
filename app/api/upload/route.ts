import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public/uploads")
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split(".").pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 })
  }
}
