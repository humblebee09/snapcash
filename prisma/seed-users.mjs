import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, "dev.db")

const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

const users = [
  { name: "Owner", username: "owner", password: "owner123", role: "owner" },
  { name: "Admin", username: "admin", password: "admin123", role: "admin" },
  { name: "Karyawan", username: "karyawan", password: "karyawan123", role: "karyawan" },
]

for (const u of users) {
  const hashed = await bcrypt.hash(u.password, 10)
  await prisma.user.upsert({
    where: { username: u.username },
    update: {},
    create: { name: u.name, username: u.username, password: hashed, role: u.role },
  })
  console.log(`✅ User ${u.username} (${u.role}) dibuat`)
}

await prisma.$disconnect()
