/**
 * Database Configuration
 * DealershipAI - Drizzle ORM setup with Supabase
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection (lazy initialization for build-time safety)
function getConnectionString() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or SUPABASE_DATABASE_URL environment variable is required');
  }

  return connectionString;
}

// Lazy initialization - only connects when first used
let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) {
      const client = postgres(getConnectionString(), { prepare: false });
      _db = drizzle(client, { schema });
    }
    return (_db as any)[prop];
  }
});

// Export schema for use in other files
export * from './schema';
