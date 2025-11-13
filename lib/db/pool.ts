/**
 * Database Connection Pooling
 * Singleton Supabase client with connection pooling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminClient: SupabaseClient | null = null;
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create admin Supabase client (singleton)
 * Uses service role key - bypasses RLS
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase admin credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  }

  supabaseAdminClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'dealershipai-admin',
      },
    },
  });

  return supabaseAdminClient;
}

/**
 * Get or create user Supabase client (singleton)
 * Uses anon key - respects RLS
 */
export function getSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured. Set SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'dealershipai-client',
      },
    },
  });

  return supabaseClient;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string }> {
  try {
    const client = getSupabaseAdmin();
    const { error } = await client.from('dealerships').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}

/**
 * Reset connections (useful for testing)
 */
export function resetConnections() {
  supabaseAdminClient = null;
  supabaseClient = null;
}

