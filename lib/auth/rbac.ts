/**
 * Role-Based Access Control (RBAC)
 * Manages user permissions and access control
 */

import { auth } from '@clerk/nextjs';
import { NextRequest } from 'next/server';

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DEALER = 'dealer',
  STAFF = 'staff',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export enum Permission {
  // System permissions
  MANAGE_SYSTEM = 'manage_system',
  VIEW_SYSTEM_STATS = 'view_system_stats',
  
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Dealer management
  MANAGE_DEALERS = 'manage_dealers',
  VIEW_DEALERS = 'view_dealers',
  EDIT_DEALER = 'edit_dealer',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_ANALYTICS = 'export_analytics',
  
  // AI Features
  USE_AI_FEATURES = 'use_ai_features',
  MANAGE_AI_CONFIG = 'manage_ai_config',
  
  // Billing
  MANAGE_BILLING = 'manage_billing',
  VIEW_BILLING = 'view_billing',
  
  // API Access
  API_FULL_ACCESS = 'api_full_access',
  API_READ_ACCESS = 'api_read_access',
  API_WRITE_ACCESS = 'api_write_access',
}

// Define role-permission mappings
const rolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    Permission.MANAGE_SYSTEM,
    Permission.VIEW_SYSTEM_STATS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_DEALERS,
    Permission.VIEW_DEALERS,
    Permission.EDIT_DEALER,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.USE_AI_FEATURES,
    Permission.MANAGE_AI_CONFIG,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING,
    Permission.API_FULL_ACCESS,
    Permission.API_READ_ACCESS,
    Permission.API_WRITE_ACCESS,
  ],
  [Role.ADMIN]: [
    Permission.VIEW_SYSTEM_STATS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_DEALERS,
    Permission.VIEW_DEALERS,
    Permission.EDIT_DEALER,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.USE_AI_FEATURES,
    Permission.MANAGE_AI_CONFIG,
    Permission.VIEW_BILLING,
    Permission.API_READ_ACCESS,
    Permission.API_WRITE_ACCESS,
  ],
  [Role.DEALER]: [
    Permission.VIEW_DEALERS,
    Permission.EDIT_DEALER,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.USE_AI_FEATURES,
    Permission.VIEW_BILLING,
    Permission.API_READ_ACCESS,
  ],
  [Role.STAFF]: [
    Permission.VIEW_DEALERS,
    Permission.VIEW_ANALYTICS,
    Permission.USE_AI_FEATURES,
    Permission.API_READ_ACCESS,
  ],
  [Role.VIEWER]: [
    Permission.VIEW_DEALERS,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.GUEST]: [],
};

export class RBAC {
  /**
   * Get user role from session or metadata
   */
  static async getUserRole(userId?: string): Promise<Role> {
    try {
      const { userId: clerkUserId, sessionClaims } = auth();
      
      if (!clerkUserId && !userId) {
        return Role.GUEST;
      }
      
      // Check for role in session claims
      const role = sessionClaims?.metadata?.role as Role;
      if (role && Object.values(Role).includes(role)) {
        return role;
      }
      
      // Default role for authenticated users
      return Role.DEALER;
    } catch (error) {
      console.error('Error getting user role:', error);
      return Role.GUEST;
    }
  }
  
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: Role, permission: Permission): boolean {
    const permissions = rolePermissions[role] || [];
    return permissions.includes(permission);
  }
  
  /**
   * Check if user has a specific permission
   */
  static async userHasPermission(
    userId: string | undefined,
    permission: Permission
  ): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return this.hasPermission(role, permission);
  }
  
  /**
   * Get all permissions for a role
   */
  static getPermissions(role: Role): Permission[] {
    return rolePermissions[role] || [];
  }
  
  /**
   * Middleware to check permissions
   */
  static async requirePermission(
    permission: Permission,
    request?: NextRequest
  ): Promise<{ authorized: boolean; role: Role; userId?: string }> {
    try {
      const { userId } = auth();
      
      if (!userId) {
        return { authorized: false, role: Role.GUEST };
      }
      
      const role = await this.getUserRole(userId);
      const authorized = this.hasPermission(role, permission);
      
      return { authorized, role, userId };
    } catch (error) {
      console.error('Permission check failed:', error);
      return { authorized: false, role: Role.GUEST };
    }
  }
  
  /**
   * Check if user can access a specific resource
   */
  static async canAccessResource(
    userId: string,
    resourceType: 'dealer' | 'user' | 'analytics' | 'billing',
    resourceId: string,
    action: 'view' | 'edit' | 'delete' = 'view'
  ): Promise<boolean> {
    const role = await this.getUserRole(userId);
    
    // Super admins can access everything
    if (role === Role.SUPER_ADMIN) {
      return true;
    }
    
    // Check resource-specific permissions
    switch (resourceType) {
      case 'dealer':
        if (action === 'view') {
          return this.hasPermission(role, Permission.VIEW_DEALERS);
        }
        if (action === 'edit') {
          return this.hasPermission(role, Permission.EDIT_DEALER);
        }
        if (action === 'delete') {
          return this.hasPermission(role, Permission.MANAGE_DEALERS);
        }
        break;
        
      case 'user':
        if (action === 'view') {
          return this.hasPermission(role, Permission.VIEW_USERS);
        }
        if (action === 'edit' || action === 'delete') {
          return this.hasPermission(role, Permission.MANAGE_USERS);
        }
        break;
        
      case 'analytics':
        return this.hasPermission(role, Permission.VIEW_ANALYTICS);
        
      case 'billing':
        if (action === 'view') {
          return this.hasPermission(role, Permission.VIEW_BILLING);
        }
        if (action === 'edit' || action === 'delete') {
          return this.hasPermission(role, Permission.MANAGE_BILLING);
        }
        break;
    }
    
    return false;
  }
  
  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  static getRoleLevel(role: Role): number {
    const levels: Record<Role, number> = {
      [Role.SUPER_ADMIN]: 100,
      [Role.ADMIN]: 80,
      [Role.DEALER]: 60,
      [Role.STAFF]: 40,
      [Role.VIEWER]: 20,
      [Role.GUEST]: 0,
    };
    
    return levels[role] || 0;
  }
  
  /**
   * Check if one role is higher than another
   */
  static isRoleHigherOrEqual(role1: Role, role2: Role): boolean {
    return this.getRoleLevel(role1) >= this.getRoleLevel(role2);
  }
  
  /**
   * Validate API access
   */
  static async validateAPIAccess(
    request: NextRequest,
    requiredAccess: 'read' | 'write' | 'full' = 'read'
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const { userId } = auth();
      
      if (!userId) {
        return {
          valid: false,
          error: 'Authentication required',
        };
      }
      
      const role = await this.getUserRole(userId);
      
      let hasAccess = false;
      switch (requiredAccess) {
        case 'read':
          hasAccess = this.hasPermission(role, Permission.API_READ_ACCESS);
          break;
        case 'write':
          hasAccess = this.hasPermission(role, Permission.API_WRITE_ACCESS);
          break;
        case 'full':
          hasAccess = this.hasPermission(role, Permission.API_FULL_ACCESS);
          break;
      }
      
      if (!hasAccess) {
        return {
          valid: false,
          error: `Insufficient permissions. ${requiredAccess} access required.`,
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('API access validation failed:', error);
      return {
        valid: false,
        error: 'Access validation failed',
      };
    }
  }
}

// Export convenience functions
export const getUserRole = RBAC.getUserRole.bind(RBAC);
export const hasPermission = RBAC.hasPermission.bind(RBAC);
export const userHasPermission = RBAC.userHasPermission.bind(RBAC);
export const requirePermission = RBAC.requirePermission.bind(RBAC);
export const canAccessResource = RBAC.canAccessResource.bind(RBAC);
export const validateAPIAccess = RBAC.validateAPIAccess.bind(RBAC);

// Additional exports for compatibility
export const createMockUserContext = (role: Role = Role.DEALER) => {
  return {
    userId: 'mock-user-id',
    role,
    permissions: RBAC.getPermissions(role),
  };
};

export const validateTenantAccess = async (
  userId: string,
  tenantId: string
): Promise<boolean> => {
  // For now, allow access if user is authenticated
  // In production, this would check actual tenant membership
  return !!userId;
};