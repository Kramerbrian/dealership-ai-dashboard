import { db } from './db'

// Define user roles to match the database enum
export enum UserRole {
  SUPERADMIN = 'superadmin',
  ENTERPRISE_ADMIN = 'enterprise_admin',
  DEALERSHIP_ADMIN = 'dealership_admin',
  USER = 'user'
}

export async function getCurrentUser() {
  // Mock user for demo purposes - using real data from database if available
  try {
    // Try to get a real user from the database first
    const users = await db.user.findMany()
    if (users && users.length > 0) {
      const user = users[0]
      const tenant = await db.tenant.findUnique({ where: { id: user.tenant_id } })
      
      return {
        id: user.id,
        clerkId: user.clerk_id || 'mock-clerk-id',
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        permissions: user.permissions || ['view:own_data'],
        tenantId: user.tenant_id,
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          type: tenant.type,
          subscriptionTier: tenant.subscription_tier,
          subscriptionStatus: tenant.subscription_status,
          mrr: tenant.mrr
        } : null
      }
    }
  } catch (error) {
    console.log('Using mock user - database not available:', error.message)
  }

  // Fallback to mock user (no Clerk dependency)
  const mockUser = {
    id: 'mock-user-id',
    email: 'demo@dealershipai.com',
    fullName: 'Demo User',
    role: UserRole.DEALERSHIP_ADMIN,
    permissions: ['view:own_data', 'manage:team', 'update:settings'],
    tenantId: 'mock-tenant-id',
    tenant: {
      id: 'mock-tenant-id',
      name: 'Demo Dealership',
      type: 'dealership',
      subscriptionTier: 'tier_1',
      subscriptionStatus: 'active',
      mrr: 499
    }
  }
  
  return mockUser
}

export async function getAccessibleTenants(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) return []

    // Superadmin: Can see all tenants
    if (user.role === UserRole.SUPERADMIN) {
      return await db.tenant.findMany()
    }

    // Enterprise admin: Can see their group and all child tenants
    if (user.role === UserRole.ENTERPRISE_ADMIN) {
      const tenants = await db.tenant.findMany()
      return tenants.filter(tenant => 
        tenant.id === user.tenant_id || tenant.parent_id === user.tenant_id
      )
    }

    // Dealership admin/user: Only their own tenant
    const tenant = await db.tenant.findUnique({ where: { id: user.tenant_id } })
    return tenant ? [tenant] : []
  } catch (error) {
    console.log('Error getting accessible tenants:', error.message)
    return []
  }
}

export async function requirePermission(user: { role: string; permissions: string[] }, action: string): Promise<boolean> {
  const permissions = {
    [UserRole.SUPERADMIN]: ['*'], // All access
    [UserRole.ENTERPRISE_ADMIN]: [
      'view:all_rooftops',
      'view:group_analytics',
      'manage:sub_dealerships',
      'export:group_reports',
      'view:billing'
    ],
    [UserRole.DEALERSHIP_ADMIN]: [
      'view:own_data',
      'manage:team',
      'update:settings',
      'export:reports',
      'view:billing'
    ],
    [UserRole.USER]: [
      'view:own_data',
      'export:reports'
    ]
  }

  const userPerms = permissions[user.role] || []
  return userPerms.includes('*') || userPerms.includes(action)
}
