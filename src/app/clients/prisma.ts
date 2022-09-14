import { PrismaClient } from '@prisma/client'

export const prismaClient = new PrismaClient(
  process.env.NODE_ENV !== 'production'
    ? {
        log: ['query', 'warn', 'error', 'info'],
      }
    : undefined,
)
