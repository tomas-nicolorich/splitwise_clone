import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env and .env.local
dotenv.config()
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

if (!connectionString) {
  console.error('DATABASE_URL or POSTGRES_URL is missing in environment variables')
}

// Extend PrismaClient to support PascalCase aliases used in the API
interface ExtendedPrismaClient extends PrismaClient {
  Users: PrismaClient['appUser'];
  Group: PrismaClient['group'];
  Expense: PrismaClient['expense'];
  BudgetCategory: PrismaClient['budgetCategory'];
  Income: PrismaClient['income'];
}

const prismaClientSingleton = () => {
  const isSslDisabled = connectionString?.includes('sslmode=disable');

  const pool = new Pool({
    connectionString: connectionString?.replace(/(\?|&)sslmode=[^&]+/, ''),
    ssl: isSslDisabled ? false : { rejectUnauthorized: false },
  })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({ adapter }) as any;
  
  // Add PascalCase aliases mapped to the new appUser model
  client.Users = client.appUser;
  client.Group = client.group;
  client.Expense = client.expense;
  client.BudgetCategory = client.budgetCategory;
  client.Income = client.income;

  return client as ExtendedPrismaClient;
}

const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrismaClient | undefined }

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
