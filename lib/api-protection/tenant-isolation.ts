import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Tenant Isolation & RLS Enforcement
 * Ensures multi-tenant data isolation across all API routes
 */

// Lazy initialization to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Service role client for admin operations (bypasses RLS)
// Created lazily to avoid build-time errors
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = getSupabaseClient();
  }
  return supabaseAdmin;
}

/**
 * Get authenticated user's tenant_id from Clerk
 */
export async function getUserTenantId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // Look up tenant_id from users table
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('tenant_id')
      .eq('clerk_user_id', userId)
      .single();

    if (error || !data) {
      console.error('Failed to get tenant_id:', error);
      return null;
    }

    return data.tenant_id;
  } catch (error) {
    console.error('getUserTenantId error:', error);
    return null;
  }
}

/**
 * Validate that a resource belongs to the authenticated user's tenant
 */
export async function validateTenantAccess(
  tableName: string,
  resourceId: string,
  idColumn: string = 'id'
): Promise<{ allowed: boolean; tenantId: string | null }> {
  const userTenantId = await getUserTenantId();

  if (!userTenantId) {
    return { allowed: false, tenantId: null };
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from(tableName)
      .select('tenant_id')
      .eq(idColumn, resourceId)
      .single();

    if (error || !data) {
      return { allowed: false, tenantId: userTenantId };
    }

    const resourceTenantId = data.tenant_id;
    const allowed = resourceTenantId === userTenantId;

    return { allowed, tenantId: userTenantId };
  } catch (error) {
    console.error('validateTenantAccess error:', error);
    return { allowed: false, tenantId: userTenantId };
  }
}

/**
 * Middleware helper: Deny-by-default tenant isolation check
 * Ensures API routes can only access data from user's own tenant
 */
export async function enforceTenantIsolation(
  request: NextRequest
): Promise<{ allowed: boolean; tenantId: string | null; response?: NextResponse }> {
  const { userId } = await auth();

  // Public routes that don't require tenant isolation
  const publicPaths = [
    '/api/health',
    '/api/calculator/',
    '/api/scan',
    '/api/stripe/webhook',
    '/api/clerk/webhook',
  ];

  const pathname = request.nextUrl.pathname;
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return { allowed: true, tenantId: null };
  }

  // Require authentication for all other routes
  if (!userId) {
    return {
      allowed: false,
      tenantId: null,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  // Get user's tenant_id
  const tenantId = await getUserTenantId();
  if (!tenantId) {
    return {
      allowed: false,
      tenantId: null,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'No tenant association found' },
        { status: 403 }
      ),
    };
  }

  return { allowed: true, tenantId };
}

/**
 * Create a Supabase client with RLS enabled for the authenticated user's tenant
 */
export async function createTenantSupabaseClient() {
  const tenantId = await getUserTenantId();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-tenant-id': tenantId || '',
      },
    },
  });

  return { client, tenantId };
}

/**
 * Helper to add tenant_id to INSERT/UPDATE operations
 */
export function withTenantId<T extends Record<string, any>>(
  data: T,
  tenantId: string
): T & { tenant_id: string } {
  return {
    ...data,
    tenant_id: tenantId,
  };
}

/**
 * Type guard for tenant-isolated queries
 */
export type TenantIsolatedQuery<T> = T & { tenant_id: string };

/**
 * Audit log for tenant access violations
 */
export async function logTenantAccessViolation(
  userId: string,
  tenantId: string | null,
  attemptedResource: string,
  attemptedTenantId: string | null
) {
  try {
    await getSupabaseAdmin().from('audit_logs').insert({
      user_id: userId,
      tenant_id: tenantId,
      action: 'TENANT_ACCESS_VIOLATION',
      resource: attemptedResource,
      metadata: {
        attempted_tenant_id: attemptedTenantId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to log tenant access violation:', error);
  }
}

/**
 * Deny-by-default query wrapper
 * Ensures all queries include tenant_id filter
 */
export function createTenantQuery<T>(
  query: any,
  tenantId: string
) {
  return query.eq('tenant_id', tenantId) as T;
}
