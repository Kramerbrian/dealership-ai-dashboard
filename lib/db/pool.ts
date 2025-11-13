/**
 * Database Connection Pooling
 * Manages Supabase client connections with pooling for better performance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface PoolConfig {
  maxConnections?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
}

class SupabasePool {
  private clients: Map<string, SupabaseClient> = new Map();
  private config: Required<PoolConfig>;
  private defaultClient: SupabaseClient | null = null;

  constructor(config: PoolConfig = {}) {
    this.config = {
      maxConnections: config.maxConnections || 10,
      idleTimeout: config.idleTimeout || 30000, // 30 seconds
      connectionTimeout: config.connectionTimeout || 10000, // 10 seconds
    };
  }

  /**
   * Get or create a Supabase client
   * Reuses existing connections when possible
   */
  getClient(key: string = 'default'): SupabaseClient {
    // Return existing client if available
    if (this.clients.has(key)) {
      return this.clients.get(key)!;
    }

    // Check pool size limit
    if (this.clients.size >= this.config.maxConnections) {
      // Reuse default client if pool is full
      if (this.defaultClient) {
        return this.defaultClient;
      }
    }

    // Create new client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 
                       process.env.SUPABASE_SERVICE_ROLE_KEY ||
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    }

    const client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'dealershipai-pool',
        },
      },
    });

    // Store client
    if (key === 'default') {
      this.defaultClient = client;
    } else {
      this.clients.set(key, client);
    }

    return client;
  }

  /**
   * Get default Supabase client (most common use case)
   */
  getDefaultClient(): SupabaseClient {
    return this.getClient('default');
  }

  /**
   * Get admin client (bypasses RLS)
   */
  getAdminClient(): SupabaseClient {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase admin configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY');
    }

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Close a specific client connection
   */
  closeClient(key: string): void {
    if (this.clients.has(key)) {
      this.clients.delete(key);
    }
    if (key === 'default' && this.defaultClient) {
      this.defaultClient = null;
    }
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.clients.clear();
    this.defaultClient = null;
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      activeConnections: this.clients.size + (this.defaultClient ? 1 : 0),
      maxConnections: this.config.maxConnections,
      availableConnections: this.config.maxConnections - this.clients.size - (this.defaultClient ? 1 : 0),
    };
  }
}

// Singleton instance
let poolInstance: SupabasePool | null = null;

/**
 * Get the database connection pool instance
 */
export function getSupabasePool(): SupabasePool {
  if (!poolInstance) {
    poolInstance = new SupabasePool({
      maxConnections: parseInt(process.env.SUPABASE_POOL_SIZE || '10'),
      idleTimeout: parseInt(process.env.SUPABASE_IDLE_TIMEOUT || '30000'),
    });
  }
  return poolInstance;
}

/**
 * Get a Supabase client from the pool
 */
export function getSupabaseClient(key?: string): SupabaseClient {
  return getSupabasePool().getClient(key);
}

/**
 * Get default Supabase client
 */
export function getSupabase(): SupabaseClient {
  return getSupabasePool().getDefaultClient();
}

/**
 * Get admin Supabase client (bypasses RLS)
 */
export function getSupabaseAdmin(): SupabaseClient {
  return getSupabasePool().getAdminClient();
}

/**
 * Close all database connections (useful for cleanup)
 */
export function closeSupabaseConnections(): void {
  if (poolInstance) {
    poolInstance.closeAll();
    poolInstance = null;
  }
}

