import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

// Products
const products = [
  { name: "Kopi Hitam", price: 15000, category: "Minuman", stock: 100, image: "https://images.unsplash.com/photo-1594060445139-717b4b8b3a37?w=400" },
  { name: "Cappuccino", price: 25000, category: "Minuman", stock: 80, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400" },
  { name: "Latte", price: 28000, category: "Minuman", stock: 75, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400" },
  { name: "Espresso", price: 18000, category: "Minuman", stock: 90, image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400" },
  { name: "Croissant", price: 22000, category: "Makanan", stock: 50, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" },
  { name: "Sandwich", price: 35000, category: "Makanan", stock: 40, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400" },
  { name: "Donat", price: 12000, category: "Makanan", stock: 60, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400" },
  { name: "Cheese Cake", price: 30000, category: "Makanan", stock: 30, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400" },
  { name: "Teh", price: 12000, category: "Minuman", stock: 120, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
]

const existing = await prisma.product.count()
if (existing === 0) {
  await prisma.product.createMany({ data: products })
  console.log("✅ Products seeded")
} else {
  console.log("⏭️ Products already exist, skipping")
}

// Tables
const existingTables = await prisma.table.count()
if (existingTables === 0) {
  await prisma.table.createMany({
    data: [
      { number: 1, capacity: 2, status: "available", area: "indoor" },
      { number: 2, capacity: 4, status: "available", area: "indoor" },
      { number: 3, capacity: 4, status: "available", area: "indoor" },
      { number: 4, capacity: 6, status: "available", area: "indoor" },
      { number: 5, capacity: 2, status: "available", area: "outdoor" },
      { number: 6, capacity: 2, status: "available", area: "outdoor" },
      { number: 7, capacity: 4, status: "available", area: "outdoor" },
      { number: 8, capacity: 8, status: "available", area: "vip" },
    ],
  })
  console.log("✅ Tables seeded")
} else {
  console.log("⏭️ Tables already exist, skipping")
}

// Categories
const existingCats = await prisma.category.count()
if (existingCats === 0) {
  await prisma.category.createMany({
    data: [
      { name: "Minuman", icon: "" },
      { name: "Makanan", icon: "" },
      { name: "Lainnya", icon: "" },
    ],
  })
  console.log("✅ Categories seeded")
} else {
  console.log("⏭️ Categories already exist, skipping")
}

// Users
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
}
console.log("✅ Users seeded")

await prisma.$disconnect()
console.log("🎉 Seed selesai!")
