/**
 * DealershipAI - Prisma Client
 * 
 * Database connection and client setup with health checks and connection pooling
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized Prisma client with connection pooling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

/**
 * Health check for database connection
 * Returns health status with latency measurement
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    const healthy = latency < 1000; // Healthy if query completes in < 1s
    
    if (!healthy) {
      await logger.warn('Database health check slow', { latency });
    }
    
    return {
      healthy,
      latency,
    };
  } catch (error) {
    await logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Graceful shutdown handler
 * Ensures Prisma connections are properly closed
 */
async function gracefulShutdown() {
  try {
    await prisma.$disconnect();
    await logger.info('Prisma client disconnected gracefully');
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

// Store in global for hot reload in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export prisma as default and named export
export default prisma;