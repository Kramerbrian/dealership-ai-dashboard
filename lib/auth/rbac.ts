/**
 * Role-Based Access Control (RBAC) System
 * Manages user permissions and access control
 */

export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  dealershipId?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DEALER = 'dealer',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'view_dashboard',
  EDIT_DASHBOARD = 'edit_dashboard',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_ANALYTICS = 'export_analytics',
  
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Dealership management
  MANAGE_DEALERSHIPS = 'manage_dealerships',
  VIEW_DEALERSHIPS = 'view_dealerships',
  
  // System administration
  SYSTEM_ADMIN = 'system_admin',
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  
  // API access
  API_ACCESS = 'api_access',
  API_WRITE = 'api_write',
  
  // Billing and subscriptions
  MANAGE_BILLING = 'manage_billing',
  VIEW_BILLING = 'view_billing'
}

// Role-Permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_DEALERSHIPS,
    Permission.VIEW_DEALERSHIPS,
    Permission.SYSTEM_ADMIN,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.API_ACCESS,
    Permission.API_WRITE,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.VIEW_DEALERSHIPS,
    Permission.API_ACCESS,
    Permission.API_WRITE,
    Permission.MANAGE_BILLING,
    Permission.VIEW_BILLING
  ],
  [UserRole.DEALER]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.VIEW_USERS,
    Permission.API_ACCESS,
    Permission.VIEW_BILLING
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.VIEW_USERS,
    Permission.API_ACCESS
  ],
  [UserRole.USER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.API_ACCESS
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS
  ]
};

export class RBACService {
  static hasPermission(user: User, permission: Permission): boolean {
    // Check if user has the specific permission
    if (user.permissions.includes(permission)) {
      return true;
    }
    
    // Check if user's role includes the permission
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  static hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  static hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  static canAccessDealership(user: User, dealershipId: string): boolean {
    // Super admin can access all dealerships
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // Admin can access all dealerships
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    
    // Users can only access their own dealership
    return user.dealershipId === dealershipId;
  }

  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  static isHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = [
      UserRole.VIEWER,
      UserRole.USER,
      UserRole.MANAGER,
      UserRole.DEALER,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ];
    
    const userIndex = roleHierarchy.indexOf(userRole);
    const targetIndex = roleHierarchy.indexOf(targetRole);
    
    return userIndex > targetIndex;
  }
}

// Middleware helper for API routes
export function requirePermission(permission: Permission) {
  return (user: User) => {
    if (!RBACService.hasPermission(user, permission)) {
      throw new Error(`Access denied. Required permission: ${permission}`);
    }
  };
}

// Middleware helper for dealership access
export function requireDealershipAccess(dealershipId: string) {
  return (user: User) => {
    if (!RBACService.canAccessDealership(user, dealershipId)) {
      throw new Error(`Access denied. Cannot access dealership: ${dealershipId}`);
    }
  };
}

// Mock user context for testing
export function createMockUserContext(role: UserRole = UserRole.USER, dealershipId?: string): User {
  return {
    id: `mock-user-${Date.now()}`,
    email: `mock-user@dealership.com`,
    role,
    permissions: RBACService.getRolePermissions(role),
    dealershipId
  };
}

// Validate tenant access
export function validateTenantAccess(user: User, tenantId: string): boolean {
  // Super admin can access all tenants
  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }
  
  // Admin can access all tenants
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  
  // Users can only access their own tenant/dealership
  return user.dealershipId === tenantId;
}