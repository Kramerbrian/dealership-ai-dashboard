import { Request } from 'express';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DEALERSHIP_OWNER = 'dealership_owner',
  DEALERSHIP_MANAGER = 'dealership_manager',
  SALES_MANAGER = 'sales_manager',
  SALES_REP = 'sales_rep',
  SERVICE_MANAGER = 'service_manager',
  MARKETING_MANAGER = 'marketing_manager',
  VIEWER = 'viewer'
}

export enum Permission {
  // Analytics permissions
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_DETAILED_ANALYTICS = 'view_detailed_analytics',
  EXPORT_ANALYTICS = 'export_analytics',
  
  // Dealership management
  MANAGE_DEALERSHIP = 'manage_dealership',
  VIEW_DEALERSHIP = 'view_dealership',
  
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Sales permissions
  VIEW_SALES_DATA = 'view_sales_data',
  MANAGE_SALES_DATA = 'manage_sales_data',
  
  // Marketing permissions
  VIEW_MARKETING_DATA = 'view_marketing_data',
  MANAGE_MARKETING_DATA = 'manage_marketing_data',
  
  // Service permissions
  VIEW_SERVICE_DATA = 'view_service_data',
  MANAGE_SERVICE_DATA = 'manage_service_data',
  
  // System permissions
  SYSTEM_ADMIN = 'system_admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dealershipId?: string;
  permissions?: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  dealershipId?: string;
  permissions: Permission[];
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    Permission.SYSTEM_ADMIN,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.MANAGE_DEALERSHIP,
    Permission.VIEW_DEALERSHIP,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.VIEW_SALES_DATA,
    Permission.MANAGE_SALES_DATA,
    Permission.VIEW_MARKETING_DATA,
    Permission.MANAGE_MARKETING_DATA,
    Permission.VIEW_SERVICE_DATA,
    Permission.MANAGE_SERVICE_DATA
  ],
  [UserRole.DEALERSHIP_OWNER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.MANAGE_DEALERSHIP,
    Permission.VIEW_DEALERSHIP,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.VIEW_SALES_DATA,
    Permission.MANAGE_SALES_DATA,
    Permission.VIEW_MARKETING_DATA,
    Permission.MANAGE_MARKETING_DATA,
    Permission.VIEW_SERVICE_DATA,
    Permission.MANAGE_SERVICE_DATA
  ],
  [UserRole.DEALERSHIP_MANAGER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.EXPORT_ANALYTICS,
    Permission.VIEW_DEALERSHIP,
    Permission.VIEW_USERS,
    Permission.VIEW_SALES_DATA,
    Permission.MANAGE_SALES_DATA,
    Permission.VIEW_MARKETING_DATA,
    Permission.VIEW_SERVICE_DATA
  ],
  [UserRole.SALES_MANAGER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DEALERSHIP,
    Permission.VIEW_SALES_DATA,
    Permission.MANAGE_SALES_DATA
  ],
  [UserRole.SALES_REP]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DEALERSHIP,
    Permission.VIEW_SALES_DATA
  ],
  [UserRole.SERVICE_MANAGER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DEALERSHIP,
    Permission.VIEW_SERVICE_DATA,
    Permission.MANAGE_SERVICE_DATA
  ],
  [UserRole.MARKETING_MANAGER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DETAILED_ANALYTICS,
    Permission.VIEW_DEALERSHIP,
    Permission.VIEW_MARKETING_DATA,
    Permission.MANAGE_MARKETING_DATA
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_DEALERSHIP
  ]
};