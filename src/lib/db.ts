/**
 * Database Connection
 *
 * Knex connection instance for database operations
 */

import knex, { Knex } from 'knex';

// Mock database for development when environment variables are not set
const createMockDb = () => ({
  raw: () => Promise.resolve({ rows: [] }),
  transaction: (callback: any) => callback({}),
  destroy: () => Promise.resolve(),
  select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
  insert: () => ({ into: () => Promise.resolve([]) }),
  update: () => ({ where: () => Promise.resolve([]) }),
  delete: () => ({ where: () => Promise.resolve([]) }),
});

// Determine environment
const environment = process.env.NODE_ENV || 'development';

let db: any;

try {
  // Check if we have the required environment variables
  if (!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Database environment variables not set, using mock database');
    db = createMockDb();
  } else {
    // Import config only when we have environment variables
    const config = require('../../knexfile');
    const knexConfig = (config as Record<string, Knex.Config>)[environment];
    db = knex(knexConfig);

    // Test connection on initialization
    db.raw('SELECT 1')
      .then(() => {
        console.log('✅ Database connected successfully');
      })
      .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
        // Fallback to mock database
        db = createMockDb();
      });
  }
} catch (error) {
  console.warn('Database initialization failed, using mock database:', error);
  db = createMockDb();
}

export default db;

/**
 * Helper to get a transaction
 */
export async function transaction<T>(
  callback: (trx: Knex.Transaction) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

/**
 * Helper to safely destroy the connection pool
 * Useful for cleanup in tests or serverless functions
 */
export async function closeConnection(): Promise<void> {
  await db.destroy();
}

/**
 * Type-safe table references
 */
export const tables = {
  tenants: () => db('tenants') || { select: () => Promise.resolve([]) },
  users: () => db('users') || { select: () => Promise.resolve([]) },
  dealerships: () => db('dealerships') || { select: () => Promise.resolve([]) },
  subscriptions: () => db('subscriptions') || { select: () => Promise.resolve([]) },
  auditLog: () => db('audit_log') || { select: () => Promise.resolve([]) },
  dealershipData: () => db('dealership_data') || { select: () => Promise.resolve([]) },
  aiVisibilityAudits: () => db('ai_visibility_audits') || { select: () => Promise.resolve([]) },
  chatSessions: () => db('chat_sessions') || { select: () => Promise.resolve([]) },
  marketScans: () => db('market_scans') || { select: () => Promise.resolve([]) },
  mysteryShops: () => db('mystery_shops') || { select: () => Promise.resolve([]) },
  reviews: () => db('reviews') || { select: () => Promise.resolve([]) },
  competitors: () => db('competitors') || { select: () => Promise.resolve([]) },
  optimizationRecommendations: () => db('optimization_recommendations') || { select: () => Promise.resolve([]) },
  analyses: () => db('analyses') || { select: () => Promise.resolve([]) },
} as const;

/**
 * Helper function to get user's tenant ID
 */
export async function getUserTenantId(clerkId: string): Promise<string | null> {
  const result = await db.raw<{ rows: Array<{ tenant_id: string }> }>(
    'SELECT get_user_tenant_id(?) as tenant_id',
    [clerkId]
  );
  return result.rows[0]?.tenant_id || null;
}

/**
 * Helper function to get user's role
 */
export async function getUserRole(clerkId: string): Promise<string | null> {
  const result = await db.raw<{ rows: Array<{ role: string }> }>(
    'SELECT get_user_role(?) as role',
    [clerkId]
  );
  return result.rows[0]?.role || null;
}

/**
 * Helper function to get accessible tenants for a user
 */
export async function getAccessibleTenants(clerkId: string): Promise<string[]> {
  const result = await db.raw<{ rows: Array<{ tenant_ids: string[] }> }>(
    'SELECT get_accessible_tenants(?) as tenant_ids',
    [clerkId]
  );
  return result.rows[0]?.tenant_ids || [];
}
