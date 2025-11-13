import { PrismaClient } from '@prisma/client';

// Global Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();
export const prisma = db; // Alias for compatibility

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;