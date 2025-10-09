/**
 * DealershipAI Enterprise RBAC System
 * 4-tier role-based access control for multi-tenant SaaS
 */

export type UserRole = 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';

export interface User {
  id: string;
  clerk_id: string;
  tenant_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  permissions: Record<string, any>;
  tenant?: {
    id: string;
    name: string;
    type: 'enterprise' | 'dealership' | 'single';
    tier: number;
  };
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Permission definitions
export const PERMISSIONS = {
  // Tenant management
  'tenants:read': { resource: 'tenants', action: 'read' },
  'tenants:write': { resource: 'tenants', action: 'write' },
  'tenants:delete': { resource: 'tenants', action: 'delete' },
  
  // User management
  'users:read': { resource: 'users', action: 'read' },
  'users:write': { resource: 'users', action: 'write' },
  'users:delete': { resource: 'users', action: 'delete' },
  
  // Dealership data
  'dealership_data:read': { resource: 'dealership_data', action: 'read' },
  'dealership_data:write': { resource: 'dealership_data', action: 'write' },
  'dealership_data:delete': { resource: 'dealership_data', action: 'delete' },
  
  // Analytics & Reports
  'analytics:read': { resource: 'analytics', action: 'read' },
  'reports:generate': { resource: 'reports', action: 'generate' },
  'reports:export': { resource: 'reports', action: 'export' },
  
  // Billing & Subscriptions
  'billing:read': { resource: 'billing', action: 'read' },
  'billing:write': { resource: 'billing', action: 'write' },
  'subscriptions:manage': { resource: 'subscriptions', action: 'manage' },
  
  // System administration
  'system:admin': { resource: 'system', action: 'admin' },
  'audit_logs:read': { resource: 'audit_logs', action: 'read' },
  
  // AI Features
  'ai_analysis:run': { resource: 'ai_analysis', action: 'run' },
  'ai_optimization:manage': { resource: 'ai_optimization', action: 'manage' },
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: [
    // Full system access
    'tenants:read', 'tenants:write', 'tenants:delete',
    'users:read', 'users:write', 'users:delete',
    'dealership_data:read', 'dealership_data:write', 'dealership_data:delete',
    'analytics:read', 'reports:generate', 'reports:export',
    'billing:read', 'billing:write', 'subscriptions:manage',
    'system:admin', 'audit_logs:read',
    'ai_analysis:run', 'ai_optimization:manage',
  ],
  
  enterprise_admin: [
    // Manage enterprise group (up to 350 rooftops)
    'tenants:read', 'tenants:write',
    'users:read', 'users:write',
    'dealership_data:read', 'dealership_data:write',
    'analytics:read', 'reports:generate', 'reports:export',
    'billing:read', 'subscriptions:manage',
    'ai_analysis:run', 'ai_optimization:manage',
  ],
  
  dealership_admin: [
    // Manage single dealership
    'dealership_data:read', 'dealership_data:write',
    'analytics:read', 'reports:generate',
    'billing:read',
    'ai_analysis:run',
  ],
  
  user: [
    // View-only access
    'dealership_data:read',
    'analytics:read',
  ],
};

// Tier-based feature access
export const TIER_FEATURES = {
  1: { // Test Drive (Free)
    max_dealerships: 1,
    max_users: 2,
    analytics_retention_days: 30,
    api_calls_per_month: 1000,
    features: ['basic_dashboard', 'ai_visibility_score'],
  },
  2: { // Intelligence ($499/mo)
    max_dealerships: 5,
    max_users: 10,
    analytics_retention_days: 90,
    api_calls_per_month: 10000,
    features: ['basic_dashboard', 'ai_visibility_score', 'aoer_analytics', 'competitor_analysis', 'email_support'],
  },
  3: { // Boss Mode ($999/mo)
    max_dealerships: 25,
    max_users: 50,
    analytics_retention_days: 365,
    api_calls_per_month: 50000,
    features: ['basic_dashboard', 'ai_visibility_score', 'aoer_analytics', 'competitor_analysis', 'algorithmic_visibility', 'predictive_analytics', 'priority_support', 'api_access'],
  },
  4: { // Enterprise (Custom)
    max_dealerships: 350,
    max_users: 1000,
    analytics_retention_days: 1095, // 3 years
    api_calls_per_month: -1, // Unlimited
    features: ['all_features', 'custom_integrations', 'dedicated_support', 'sso_saml', 'white_label', 'custom_reporting'],
  },
};

/**
 * Check if user has permission to perform action on resource
 */
export function hasPermission(
  user: User,
  permission: keyof typeof PERMISSIONS,
  resourceId?: string
): boolean {
  // Superadmin has all permissions
  if (user.role === 'superadmin') {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  if (!rolePermissions.includes(permission)) {
    return false;
  }
  
  // Check tenant-based restrictions
  if (resourceId && user.tenant_id !== resourceId) {
    // Enterprise admin can access child tenants
    if (user.role === 'enterprise_admin') {
      // TODO: Implement parent-child tenant relationship check
      return true;
    }
    return false;
  }
  
  return true;
}

/**
 * Check if user can access feature based on tier
 */
export function hasFeatureAccess(user: User, feature: string): boolean {
  if (!user.tenant) return false;
  
  const tierFeatures = TIER_FEATURES[user.tenant.tier as keyof typeof TIER_FEATURES];
  if (!tierFeatures) return false;
  
  return tierFeatures.features.includes(feature) || tierFeatures.features.includes('all_features');
}

/**
 * Check if user can perform action within tier limits
 */
export function checkTierLimits(user: User, action: string, currentCount: number): boolean {
  if (!user.tenant) return false;
  
  const tierFeatures = TIER_FEATURES[user.tenant.tier as keyof typeof TIER_FEATURES];
  if (!tierFeatures) return false;
  
  switch (action) {
    case 'create_dealership':
      return currentCount < tierFeatures.max_dealerships;
    case 'create_user':
      return currentCount < tierFeatures.max_users;
    case 'api_call':
      return tierFeatures.api_calls_per_month === -1 || currentCount < tierFeatures.api_calls_per_month;
    default:
      return true;
  }
}

/**
 * Get user's accessible tenants based on role
 */
export function getAccessibleTenants(user: User): string[] {
  switch (user.role) {
    case 'superadmin':
      return []; // Can access all tenants
    case 'enterprise_admin':
      return [user.tenant_id]; // Can access own tenant and children (TODO: implement)
    case 'dealership_admin':
    case 'user':
      return [user.tenant_id]; // Can only access own tenant
    default:
      return [];
  }
}

/**
 * Middleware for API routes to check permissions
 */
export function requirePermission(permission: keyof typeof PERMISSIONS) {
  return function (user: User, resourceId?: string): boolean {
    if (!hasPermission(user, permission, resourceId)) {
      throw new Error(`Insufficient permissions: ${permission}`);
    }
    return true;
  };
}

/**
 * Middleware for API routes to check feature access
 */
export function requireFeature(feature: string) {
  return function (user: User): boolean {
    if (!hasFeatureAccess(user, feature)) {
      throw new Error(`Feature not available: ${feature}`);
    }
    return true;
  };
}

/**
 * Audit log helper
 */
export function logAuditEvent(
  user: User,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any
) {
  // TODO: Implement audit logging to database
  console.log('AUDIT:', {
    user_id: user.id,
    tenant_id: user.tenant_id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get user's dashboard configuration based on role and tier
 */
export function getDashboardConfig(user: User) {
  const baseConfig = {
    showBilling: ['dealership_admin', 'enterprise_admin', 'superadmin'].includes(user.role),
    showAnalytics: hasFeatureAccess(user, 'analytics'),
    showAOER: hasFeatureAccess(user, 'aoer_analytics'),
    showAlgorithmicVisibility: hasFeatureAccess(user, 'algorithmic_visibility'),
    showCompetitorAnalysis: hasFeatureAccess(user, 'competitor_analysis'),
    showPredictiveAnalytics: hasFeatureAccess(user, 'predictive_analytics'),
    showAPI: hasFeatureAccess(user, 'api_access'),
    showWhiteLabel: hasFeatureAccess(user, 'white_label'),
  };
  
  return baseConfig;
}
