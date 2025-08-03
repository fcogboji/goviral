// lib/prisma.ts
import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Export Prisma namespace for type definitions
export { Prisma }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}