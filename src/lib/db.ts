/**
 * Database Connection
 *
 * Knex connection instance for database operations
 */

import knex, { Knex } from 'knex';
import config from '../../knexfile';

// Determine environment
const environment = process.env.NODE_ENV || 'development';

// Get configuration for current environment
const knexConfig = (config as Record<string, Knex.Config>)[environment];

// Create Knex instance
const db = knex(knexConfig);

// Test connection on initialization
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

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
  tenants: () => db('tenants'),
  users: () => db('users'),
  dealerships: () => db('dealerships'),
  subscriptions: () => db('subscriptions'),
  auditLog: () => db('audit_log'),
  dealershipData: () => db('dealership_data'),
  aiVisibilityAudits: () => db('ai_visibility_audits'),
  chatSessions: () => db('chat_sessions'),
  marketScans: () => db('market_scans'),
  mysteryShops: () => db('mystery_shops'),
  reviews: () => db('reviews'),
  competitors: () => db('competitors'),
  optimizationRecommendations: () => db('optimization_recommendations'),
  analyses: () => db('analyses'),
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
