/**
 * Authentication utilities for DealershipAI
 * Handles user authentication and authorization
 */

export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  role: 'superadmin' | 'enterprise_admin' | 'dealership_admin' | 'user';
  permissions: string[];
  tenant?: {
    id: string;
    name: string;
  };
}

export interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Get current user from authentication context
 */
export function getCurrentUser(): User | null {
  // This would typically get the user from Clerk or your auth provider
  // For now, return a mock user for development
  return {
    id: 'user_123',
    email: 'admin@dealershipai.com',
    name: 'Admin User',
    tenant_id: 'tenant_123',
    role: 'superadmin',
    permissions: ['*'], // All permissions
  };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (user.permissions.includes('*')) return true;
  return user.permissions.includes(permission);
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Get user's tenant ID
 */
export function getUserTenantId(user: User | null): string | null {
  return user?.tenant_id || null;
}

/**
 * Check if user can access specific resource
 */
export function canAccess(user: User | null, resource: string, action: string): boolean {
  if (!user) return false;
  
  const permission = `${action}:${resource}`;
  return hasPermission(user, permission) || hasPermission(user, '*');
}

export function requireRole(role: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Simple role requirement decorator
    return descriptor;
  };
}
