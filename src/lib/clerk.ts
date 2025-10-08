import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from './supabase';

export interface UserWithTenant {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';
  tenant: {
    id: string;
    name: string;
    type: 'enterprise' | 'dealership' | 'single';
    parentId: string | null;
    domain: string | null;
    city: string | null;
    state: string | null;
    tier: number | null;
  };
  permissions: Record<string, any>;
}

export async function getCurrentUserWithTenant(): Promise<UserWithTenant | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    // Get user from our database
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        tenant:tenants(*)
      `)
      .eq('clerk_id', userId)
      .single();

    if (error || !userData) {
      // User not found in our database, create them
      return await createUserFromClerk(user, userId);
    }

    return {
      id: userData.id,
      clerkId: userData.clerk_id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      tenant: {
        id: userData.tenant.id,
        name: userData.tenant.name,
        type: userData.tenant.type,
        parentId: userData.tenant.parent_id,
        domain: userData.tenant.domain,
        city: userData.tenant.city,
        state: userData.tenant.state,
        tier: userData.tenant.tier
      },
      permissions: userData.permissions
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

async function createUserFromClerk(clerkUser: any, clerkId: string): Promise<UserWithTenant | null> {
  try {
    // Create a default tenant for the user
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        type: 'single',
        domain: null,
        city: null,
        state: null,
        tier: 3
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Create user record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: clerkId,
        tenant_id: tenant.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        role: 'dealership_admin',
        permissions: {}
      })
      .select(`
        *,
        tenant:tenants(*)
      `)
      .single();

    if (userError) throw userError;

    return {
      id: userData.id,
      clerkId: userData.clerk_id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      tenant: {
        id: userData.tenant.id,
        name: userData.tenant.name,
        type: userData.tenant.type,
        parentId: userData.tenant.parent_id,
        domain: userData.tenant.domain,
        city: userData.tenant.city,
        state: userData.tenant.state,
        tier: userData.tenant.tier
      },
      permissions: userData.permissions
    };
  } catch (error) {
    console.error('Error creating user from Clerk:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUserWithTenant();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

export async function requireRole(requiredRole: string) {
  const user = await requireAuth();
  
  const roleHierarchy = {
    'user': 1,
    'dealership_admin': 2,
    'enterprise_admin': 3,
    'superadmin': 4
  };

  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  if (userLevel < requiredLevel) {
    redirect('/unauthorized');
  }

  return user;
}

export async function canAccessTenant(user: UserWithTenant, targetTenantId: string): Promise<boolean> {
  // SuperAdmin can access all tenants
  if (user.role === 'superadmin') return true;
  
  // Enterprise Admin can access their tenant and child tenants
  if (user.role === 'enterprise_admin') {
    // Check if target tenant is a child of user's tenant
    const { data: targetTenant } = await supabaseAdmin
      .from('tenants')
      .select('parent_id')
      .eq('id', targetTenantId)
      .single();
      
    return targetTenant?.parent_id === user.tenant.id || targetTenantId === user.tenant.id;
  }
  
  // Dealership Admin and User can only access their own tenant
  return user.tenant.id === targetTenantId;
}

export async function getTenantHierarchy(tenantId: string) {
  const { data: tenant } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (!tenant) return null;

  // Get all child tenants
  const { data: children } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('parent_id', tenantId);

  return {
    ...tenant,
    children: children || []
  };
}
