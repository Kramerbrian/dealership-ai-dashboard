/**
 * Role-Based Access Control (RBAC) System
 * Provides authorization functionality for the DealershipAI system
 */

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
  GUEST = 'guest'
}

export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'view_dashboard',
  EDIT_DASHBOARD = 'edit_dashboard',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_ANALYTICS = 'export_analytics',
  
  // AI Analysis permissions
  RUN_AI_ANALYSIS = 'run_ai_analysis',
  VIEW_AI_RESULTS = 'view_ai_results',
  
  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  
  // System permissions
  VIEW_SYSTEM_STATUS = 'view_system_status',
  MANAGE_SYSTEM = 'manage_system',
  
  // API permissions
  ACCESS_API = 'access_api',
  MANAGE_API_KEYS = 'manage_api_keys',
  
  // Billing permissions
  VIEW_BILLING = 'view_billing',
  MANAGE_BILLING = 'manage_billing'
}

export interface User {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  tenantId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Define role-permission mappings
export const ROLE_PERMISSIONS: RolePermissions = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  
  [Role.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.RUN_AI_ANALYSIS,
    Permission.VIEW_AI_RESULTS,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_SYSTEM_STATUS,
    Permission.ACCESS_API,
    Permission.VIEW_BILLING
  ],
  
  [Role.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.EDIT_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.RUN_AI_ANALYSIS,
    Permission.VIEW_AI_RESULTS,
    Permission.VIEW_USERS,
    Permission.ACCESS_API,
    Permission.VIEW_BILLING
  ],
  
  [Role.ANALYST]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.RUN_AI_ANALYSIS,
    Permission.VIEW_AI_RESULTS,
    Permission.ACCESS_API
  ],
  
  [Role.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_AI_RESULTS
  ],
  
  [Role.GUEST]: [
    Permission.VIEW_DASHBOARD
  ]
};

export class RBACService {
  private static instance: RBACService;
  
  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: User, permission: Permission): boolean {
    if (!user.isActive) {
      return false;
    }
    
    return user.permissions.includes(permission) || 
           ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  }

  /**
   * Check if a user has any of the specified permissions
   */
  hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if a user has all of the specified permissions
   */
  hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Get all permissions for a user based on their role and explicit permissions
   */
  getUserPermissions(user: User): Permission[] {
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const explicitPermissions = user.permissions || [];
    
    // Combine and deduplicate permissions
    return [...new Set([...rolePermissions, ...explicitPermissions])];
  }

  /**
   * Check if a user can access a specific resource
   */
  canAccessResource(user: User, resource: string, action: string): boolean {
    // Define resource-action to permission mappings
    const resourcePermissions: Record<string, Record<string, Permission[]>> = {
      dashboard: {
        view: [Permission.VIEW_DASHBOARD],
        edit: [Permission.EDIT_DASHBOARD]
      },
      analytics: {
        view: [Permission.VIEW_ANALYTICS],
        export: [Permission.EXPORT_ANALYTICS]
      },
      ai_analysis: {
        run: [Permission.RUN_AI_ANALYSIS],
        view: [Permission.VIEW_AI_RESULTS]
      },
      users: {
        view: [Permission.VIEW_USERS],
        create: [Permission.CREATE_USERS],
        edit: [Permission.EDIT_USERS],
        delete: [Permission.DELETE_USERS]
      },
      system: {
        view: [Permission.VIEW_SYSTEM_STATUS],
        manage: [Permission.MANAGE_SYSTEM]
      },
      api: {
        access: [Permission.ACCESS_API],
        manage_keys: [Permission.MANAGE_API_KEYS]
      },
      billing: {
        view: [Permission.VIEW_BILLING],
        manage: [Permission.MANAGE_BILLING]
      }
    };

    const requiredPermissions = resourcePermissions[resource]?.[action] || [];
    return this.hasAllPermissions(user, requiredPermissions);
  }

  /**
   * Check if user belongs to the same tenant (for multi-tenant scenarios)
   */
  canAccessTenantResource(user: User, resourceTenantId?: string): boolean {
    if (!resourceTenantId) {
      return true; // No tenant restriction
    }
    
    return user.tenantId === resourceTenantId;
  }

  /**
   * Create a user with default permissions based on role
   */
  createUser(userData: Omit<User, 'permissions'>): User {
    const rolePermissions = ROLE_PERMISSIONS[userData.role] || [];
    
    return {
      ...userData,
      permissions: rolePermissions
    };
  }

  /**
   * Update user permissions
   */
  updateUserPermissions(user: User, permissions: Permission[]): User {
    return {
      ...user,
      permissions,
      updatedAt: new Date()
    };
  }

  /**
   * Validate permission exists
   */
  isValidPermission(permission: string): permission is Permission {
    return Object.values(Permission).includes(permission as Permission);
  }

  /**
   * Validate role exists
   */
  isValidRole(role: string): role is Role {
    return Object.values(Role).includes(role as Role);
  }
}

export const rbacService = RBACService.getInstance();

// Helper functions for common authorization checks
export function requirePermission(permission: Permission) {
  return (user: User) => rbacService.hasPermission(user, permission);
}

export function requireAnyPermission(permissions: Permission[]) {
  return (user: User) => rbacService.hasAnyPermission(user, permissions);
}

export function requireAllPermissions(permissions: Permission[]) {
  return (user: User) => rbacService.hasAllPermissions(user, permissions);
}

export function requireRole(role: Role) {
  return (user: User) => user.role === role;
}

export function requireRoleOrHigher(requiredRole: Role) {
  const roleHierarchy = [
    Role.GUEST,
    Role.VIEWER,
    Role.ANALYST,
    Role.MANAGER,
    Role.ADMIN,
    Role.SUPER_ADMIN
  ];
  
  return (user: User) => {
    const userLevel = roleHierarchy.indexOf(user.role);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);
    return userLevel >= requiredLevel;
  };
}

// Additional helper functions for API routes
export function createMockUserContext(role: Role = Role.ANALYST, tenantId?: string): User {
  return {
    id: 'mock-user-id',
    email: 'mock@example.com',
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
    tenantId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function validateTenantAccess(user: User, resourceTenantId?: string): boolean {
  if (!resourceTenantId) {
    return true; // No tenant restriction
  }
  
  return user.tenantId === resourceTenantId;
}