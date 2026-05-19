import { createClient } from "@libsql/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import { PrismaClient } from "@prisma/client"

async function main() {
  const client = createClient({ url: "file:./prisma/dev.db" })
  const adapter = new PrismaLibSQL(client)
  const prisma = new PrismaClient({ adapter } as any)

  await prisma.product.createMany({
    data: [
      { name: "Kopi Hitam", price: 15000, category: "Minuman", stock: 100, image: "https://images.unsplash.com/photo-1594060445139-717b4b8b3a37?w=400" },
      { name: "Cappuccino", price: 25000, category: "Minuman", stock: 80, image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400" },
      { name: "Latte", price: 28000, category: "Minuman", stock: 75, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400" },
      { name: "Espresso", price: 18000, category: "Minuman", stock: 90, image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400" },
      { name: "Croissant", price: 22000, category: "Makanan", stock: 50, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" },
      { name: "Sandwich", price: 35000, category: "Makanan", stock: 40, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400" },
      { name: "Donat", price: 12000, category: "Makanan", stock: 60, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400" },
      { name: "Cheese Cake", price: 30000, category: "Makanan", stock: 30, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400" },
      { name: "Teh", price: 12000, category: "Minuman", stock: 120, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
    ],
  })

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

  await prisma.customer.createMany({
    data: [
      { name: "Budi Santoso", phone: "081234567890", email: "budi@example.com", address: "Jl. Merdeka No. 123, Jakarta", totalSpent: 1250000, membershipLevel: "gold" },
      { name: "Siti Rahayu", phone: "082345678901", email: "siti@example.com", address: "Jl. Pahlawan No. 45, Bandung", totalSpent: 850000, membershipLevel: "silver" },
      { name: "Deni Hermawan", phone: "083456789012", email: "deni@example.com", address: "Jl. Sudirman No. 78, Surabaya", totalSpent: 2100000, membershipLevel: "platinum" },
    ],
  })

  console.log("✅ Seed berhasil!")
  await prisma.$disconnect()
}

main().catch(console.error)
