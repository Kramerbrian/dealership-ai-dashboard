/**
 * User types for DealershipAI
 * Defines user roles, permissions, and authentication types
 */

export type UserRole = 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  role: UserRole;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
  tenant?: {
    id: string;
    name: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  type: 'enterprise' | 'dealership';
  parent_tenant_id?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Dealership {
  id: string;
  tenant_id: string;
  name: string;
  domain: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface UserPermissions {
  // Dashboard permissions
  'view:dashboard': boolean;
  'view:analytics': boolean;
  'view:optimizations': boolean;
  'view:compliance': boolean;
  
  // Management permissions
  'manage:users': boolean;
  'manage:dealerships': boolean;
  'manage:optimizations': boolean;
  'manage:compliance': boolean;
  
  // Assessment permissions
  'assess:compliance': boolean;
  'generate:optimizations': boolean;
  
  // System permissions
  'system:admin': boolean;
  'system:monitor': boolean;
}

/**
 * Role-based permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'], // All permissions
  enterprise_admin: [
    'view:dashboard',
    'view:analytics',
    'view:optimizations',
    'view:compliance',
    'manage:users',
    'manage:dealerships',
    'manage:optimizations',
    'manage:compliance',
    'assess:compliance',
    'generate:optimizations',
    'system:monitor',
  ],
  dealership_admin: [
    'view:dashboard',
    'view:analytics',
    'view:optimizations',
    'view:compliance',
    'manage:users',
    'manage:optimizations',
    'assess:compliance',
    'generate:optimizations',
  ],
  user: [
    'view:dashboard',
    'view:analytics',
    'view:optimizations',
    'view:compliance',
  ],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User, permission: string): boolean {
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
}

/**
 * Get user's effective permissions based on role
 */
export function getUserPermissions(user: User): string[] {
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return [...new Set([...rolePermissions, ...user.permissions])];
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  user: User,
  action: string,
  resource: string
): boolean {
  const permission = `${action}:${resource}`;
  return hasPermission(user, permission) || hasPermission(user, '*');
}
