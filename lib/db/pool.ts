/**
 * Database Connection Pooling
 * Optimized Prisma client with connection pooling
 */

import { PrismaClient } from '@prisma/client';

// Connection pool configuration
const connectionPoolConfig = {
  max: process.env.DATABASE_POOL_MAX ? parseInt(process.env.DATABASE_POOL_MAX) : 20,
  min: process.env.DATABASE_POOL_MIN ? parseInt(process.env.DATABASE_POOL_MIN) : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Global Prisma client instance with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma client with optimized configuration
 */
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  // Parse connection string to add pool parameters if not present
  const url = new URL(databaseUrl);
  
  // Add connection pool parameters if using PostgreSQL
  if (databaseUrl.includes('postgresql') || databaseUrl.includes('postgres')) {
    url.searchParams.set('connection_limit', connectionPoolConfig.max.toString());
    url.searchParams.set('pool_timeout', connectionPoolConfig.idleTimeoutMillis.toString());
    url.searchParams.set('connect_timeout', connectionPoolConfig.connectionTimeoutMillis.toString());
  }
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: url.toString(),
      },
    },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : process.env.NODE_ENV === 'production'
      ? ['error']
      : [],
    
    // Performance optimizations
    errorFormat: 'pretty',
  });
  
  // Add connection event handlers
  client.$on('query' as any, (e: any) => {
    // Log slow queries
    if (e.duration > 1000) {
      console.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
    }
  });
  
  return client;
}

// Export singleton instance
export const db = globalForPrisma.prisma ?? createPrismaClient();
export const prisma = db; // Alias for compatibility

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get connection pool statistics
 */
export async function getPoolStats(): Promise<{
  active: number;
  idle: number;
  total: number;
}> {
  try {
    // Prisma doesn't expose pool stats directly
    // This is a placeholder - implement based on your database provider
    const result = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM pg_stat_activity WHERE datname = current_database()
    `.catch(() => null);
    
    if (result && result[0]) {
      const total = Number(result[0].count);
      return {
        active: total,
        idle: 0,
        total: connectionPoolConfig.max,
      };
    }
    
    return {
      active: 0,
      idle: 0,
      total: connectionPoolConfig.max,
    };
  } catch (error) {
    console.error('Failed to get pool stats:', error);
    return {
      active: 0,
      idle: 0,
      total: connectionPoolConfig.max,
    };
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await db.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectDatabase();
  });
  
  process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

