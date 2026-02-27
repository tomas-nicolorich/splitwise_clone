import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env and .env.local
dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

if (!connectionString) {
  console.error('DATABASE_URL or POSTGRES_URL is missing in environment variables')
}

const prismaClientSingleton = () => {
  const isSslDisabled = connectionString?.includes('sslmode=disable');

  const pool = new Pool({
    connectionString: connectionString?.replace(/(\?|&)sslmode=[^&]+/, ''),
    ssl: isSslDisabled ? false : { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
