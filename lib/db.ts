/**
 * DealershipAI Site Intelligence - Database Helper
 * 
 * RLS-enabled database connection with tenant context
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../drizzle/schema';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from '../drizzle/schema';

/**
 * Per-request tenant context helper for RLS
 */
export async function withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  await db.execute(`select set_config('app.tenant', $1, true)`, [tenantId]); // RLS key
  return fn();
}