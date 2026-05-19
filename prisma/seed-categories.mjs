import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, "dev.db")
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

const categories = [
  { name: "Minuman", icon: "☕" },
  { name: "Makanan", icon: "🍽️" },
  { name: "Lainnya", icon: "📦" },
]

for (const c of categories) {
  await prisma.category.upsert({
    where: { name: c.name },
    update: {},
    create: c,
  })
  console.log(`✅ Kategori ${c.name} dibuat`)
}

await prisma.$disconnect()
