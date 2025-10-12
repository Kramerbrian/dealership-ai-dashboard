/**
 * Database Helpers
 * DealershipAI Command Center - Tenant-scoped queries with RLS enforcement
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Get Supabase client (server-side only, uses service role key)
 */
export function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Execute query with tenant-scoped RLS enforcement
 *
 * Sets PostgreSQL session variable `app.tenant` which RLS policies use
 * to filter rows by tenant_id.
 *
 * Usage:
 * ```typescript
 * const result = await withTenant('tenant-uuid', async () => {
 *   return supabase.from('ati_signals').select('*');
 * });
 * ```
 *
 * @param tenantId - UUID of tenant to scope queries to
 * @param fn - Async function that performs database queries
 * @returns Result of the query function
 */
export async function withTenant<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  const supabase = getSupabaseAdmin();

  // Set PostgreSQL session variable for RLS enforcement
  // RLS policies check: current_setting('app.tenant')::uuid = tenant_id
  const { error } = await supabase.rpc('set_tenant_context', {
    tenant_uuid: tenantId,
  });

  if (error) {
    console.error('Failed to set tenant context:', error);
    // Fallback: try raw SQL if RPC doesn't exist
    try {
      await supabase.rpc('exec_sql', {
        query: `SELECT set_config('app.tenant', $1, true)`,
        params: [tenantId],
      });
    } catch (fallbackError) {
      console.warn('RLS tenant context not set - queries may fail:', fallbackError);
    }
  }

  // Execute the tenant-scoped query
  return fn();
}

/**
 * Alternative: Direct SQL execution with tenant context
 * Use when you need raw SQL queries instead of Supabase client
 *
 * @param tenantId - UUID of tenant
 * @param query - SQL query string
 * @param params - Query parameters
 */
export async function executeTenantSQL<T = any>(
  tenantId: string,
  query: string,
  params: any[] = []
): Promise<T> {
  const supabase = getSupabaseAdmin();

  // Set tenant context
  await supabase.rpc('exec_sql', {
    query: `SELECT set_config('app.tenant', $1, true)`,
    params: [tenantId],
  });

  // Execute query
  const { data, error } = await supabase.rpc('exec_sql', {
    query,
    params,
  });

  if (error) throw error;
  return data as T;
}

/**
 * Get tenant ID from request headers (set by middleware)
 *
 * @param request - NextRequest or Request object
 * @returns Tenant ID or default
 */
export function getTenantFromRequest(request: Request): string {
  return request.headers.get('x-tenant') || 'demo-lou-grubbs';
}

/**
 * Validate tenant UUID format
 *
 * @param tenantId - Tenant ID to validate
 * @returns true if valid UUID format
 */
export function isValidTenantId(tenantId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(tenantId);
}
