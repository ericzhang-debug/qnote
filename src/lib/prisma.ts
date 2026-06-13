import { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient<Prisma.PrismaClientOptions> {
  const url = process.env.DATABASE_URL || 'file:./prisma/dev.db'

  // PostgreSQL
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaPg } = require('@prisma/adapter-pg')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require('pg')
      const pool = new Pool({ connectionString: url })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter })
      // eslint-disable-next-line no-empty
    } catch {}
  }

  // MySQL / MariaDB
  if (url.startsWith('mysql://') || url.startsWith('mariadb://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mariadb = require('mariadb')
      const connection = mariadb.createConnection(url)
      const adapter = new PrismaMariaDb(connection)
      return new PrismaClient({ adapter })
      // eslint-disable-next-line no-empty
    } catch {}
  }

  // SQLite (默认)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaLibSql } = require('@prisma/adapter-libsql')
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
