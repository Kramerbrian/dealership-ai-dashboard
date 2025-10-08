import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { supabase } from '../database/supabase';
import { UserRole, TenantType, UserContext, UserPermissions } from '../types/user';
import { config } from '../config/config';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      userContext?: UserContext;
      tenantId?: string;
      accessibleTenants?: string[];
    }
  }
}

export class RBACMiddleware {
  /**
   * Main middleware that extracts user context and enforces tenant isolation
   */
  static async extractUserContext(req: any, res: Response, next: NextFunction) {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          tenants!inner(*)
        `)
        .eq('clerk_id', req.auth.userId)
        .single();

      if (userError || !user) {
        return res.status(403).json({ error: 'User not found or not authorized' });
      }

      // Get tenant information
      const tenant = user.tenants;
      if (!tenant) {
        return res.status(403).json({ error: 'Tenant not found' });
      }

      // Get accessible tenants for enterprise admins
      let accessibleTenants: string[] = [user.tenant_id];
      if (user.role === UserRole.ENTERPRISE_ADMIN) {
        accessibleTenants = await this.getAccessibleTenants(user.tenant_id);
      } else if (user.role === UserRole.SUPERADMIN) {
        // SuperAdmin can access all tenants
        accessibleTenants = await this.getAllTenantIds();
      }

      // Create user context
      const userContext: UserContext = {
        user,
        tenant,
        accessible_tenants: accessibleTenants,
        permissions: this.getUserPermissions(user.role, tenant.type)
      };

      // Attach to request
      req.userContext = userContext;
      req.tenantId = user.tenant_id;
      req.accessibleTenants = accessibleTenants;

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Middleware to require specific role
   */
  static requireRole(requiredRoles: UserRole | UserRole[]) {
    return (req: any, res: Response, next: NextFunction) => {
      if (!req.userContext) {
        return res.status(401).json({ error: 'User context required' });
      }

      const userRole = req.userContext.user.role;
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!roles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: roles,
          current: userRole
        });
      }

      next();
    };
  }

  /**
   * Middleware to require specific permission
   */
  static requirePermission(permission: keyof UserPermissions) {
    return (req: any, res: Response, next: NextFunction) => {
      if (!req.userContext) {
        return res.status(401).json({ error: 'User context required' });
      }

      const hasPermission = req.userContext.permissions[permission];
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          current: req.userContext.permissions
        });
      }

      next();
    };
  }

  /**
   * Middleware to enforce tenant access
   */
  static enforceTenantAccess(req: Request, res: Response, next: NextFunction) {
    if (!req.userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    const requestedTenantId = req.params.tenantId || req.body.tenant_id || req.query.tenant_id;
    
    if (requestedTenantId && !req.accessibleTenants?.includes(requestedTenantId)) {
      return res.status(403).json({ 
        error: 'Access denied to tenant',
        tenant_id: requestedTenantId,
        accessible_tenants: req.accessibleTenants
      });
    }

    next();
  }

  /**
   * Middleware for SuperAdmin only access
   */
  static requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
    return RBACMiddleware.requireRole(UserRole.SUPERADMIN)(req, res, next);
  }

  /**
   * Middleware for Enterprise Admin or higher
   */
  static requireEnterpriseAdmin(req: Request, res: Response, next: NextFunction) {
    return RBACMiddleware.requireRole([UserRole.SUPERADMIN, UserRole.ENTERPRISE_ADMIN])(req, res, next);
  }

  /**
   * Middleware for Dealership Admin or higher
   */
  static requireDealershipAdmin(req: Request, res: Response, next: NextFunction) {
    return RBACMiddleware.requireRole([
      UserRole.SUPERADMIN, 
      UserRole.ENTERPRISE_ADMIN, 
      UserRole.DEALERSHIP_ADMIN
    ])(req, res, next);
  }

  /**
   * Get accessible tenants for enterprise admin
   */
  private static async getAccessibleTenants(tenantId: string): Promise<string[]> {
    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id')
        .or(`id.eq.${tenantId},parent_id.eq.${tenantId}`);

      if (error) {
        console.error('Error getting accessible tenants:', error);
        return [tenantId];
      }

      return tenants.map(t => t.id);
    } catch (error) {
      console.error('Error getting accessible tenants:', error);
      return [tenantId];
    }
  }

  /**
   * Get all tenant IDs (SuperAdmin only)
   */
  private static async getAllTenantIds(): Promise<string[]> {
    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id');

      if (error) {
        console.error('Error getting all tenant IDs:', error);
        return [];
      }

      return tenants.map(t => t.id);
    } catch (error) {
      console.error('Error getting all tenant IDs:', error);
      return [];
    }
  }

  /**
   * Get user permissions based on role and tenant type
   */
  private static getUserPermissions(role: UserRole, tenantType: TenantType): UserPermissions {
    const basePermissions: UserPermissions = {
      can_view_analytics: false,
      can_export_data: false,
      can_manage_users: false,
      can_manage_settings: false,
      can_view_billing: false,
      can_manage_billing: false,
      can_access_admin_panel: false,
      can_view_all_tenants: false,
      can_manage_tenants: false,
    };

    switch (role) {
      case UserRole.SUPERADMIN:
        return {
          ...basePermissions,
          can_view_analytics: true,
          can_export_data: true,
          can_manage_users: true,
          can_manage_settings: true,
          can_view_billing: true,
          can_manage_billing: true,
          can_access_admin_panel: true,
          can_view_all_tenants: true,
          can_manage_tenants: true,
        };

      case UserRole.ENTERPRISE_ADMIN:
        return {
          ...basePermissions,
          can_view_analytics: true,
          can_export_data: true,
          can_manage_users: true,
          can_manage_settings: true,
          can_view_billing: true,
          can_manage_billing: true,
          can_access_admin_panel: true,
          can_view_all_tenants: false, // Only their enterprise group
          can_manage_tenants: true, // Only within their enterprise
        };

      case UserRole.DEALERSHIP_ADMIN:
        return {
          ...basePermissions,
          can_view_analytics: true,
          can_export_data: true,
          can_manage_users: true,
          can_manage_settings: true,
          can_view_billing: true,
          can_manage_billing: false, // Read-only billing
          can_access_admin_panel: false,
          can_view_all_tenants: false,
          can_manage_tenants: false,
        };

      case UserRole.USER:
        return {
          ...basePermissions,
          can_view_analytics: true,
          can_export_data: true,
          can_manage_users: false,
          can_manage_settings: false,
          can_view_billing: false,
          can_manage_billing: false,
          can_access_admin_panel: false,
          can_view_all_tenants: false,
          can_manage_tenants: false,
        };

      default:
        return basePermissions;
    }
  }
}

// Convenience exports
export const extractUserContext = RBACMiddleware.extractUserContext;
export const requireRole = RBACMiddleware.requireRole;
export const requirePermission = RBACMiddleware.requirePermission;
export const enforceTenantAccess = RBACMiddleware.enforceTenantAccess;
export const requireSuperAdmin = RBACMiddleware.requireSuperAdmin;
export const requireEnterpriseAdmin = RBACMiddleware.requireEnterpriseAdmin;
export const requireDealershipAdmin = RBACMiddleware.requireDealershipAdmin;
