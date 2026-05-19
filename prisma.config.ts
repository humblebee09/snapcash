import path from "node:path"
import { defineConfig } from "prisma/config"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const dbPath = path.resolve("prisma/dev.db")

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: `file:${dbPath}`,
  },
  migrate: {
    adapter: async () => {
      return new PrismaLibSql({ url: `file:${dbPath}` })
    },
  },
})
