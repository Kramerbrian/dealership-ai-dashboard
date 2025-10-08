import { Request, Response, NextFunction } from 'express';
import { supabase } from '../database/supabase';
import { UserRole } from '../types/user';

/**
 * Middleware to enforce tenant isolation at the database level
 * This ensures users can only access data from their own tenant
 */
export class TenantIsolationMiddleware {
  /**
   * Middleware to automatically filter queries by tenant
   */
  static enforceTenantFilter(req: any, res: Response, next: NextFunction) {
    if (!req.userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    const { user } = req.userContext;
    const accessibleTenants = req.userContext.accessibleTenants || [];

    // SuperAdmin can access all tenants
    if (user.role === UserRole.SUPERADMIN) {
      req.tenantFilter = null; // No filter for SuperAdmin
      return next();
    }

    // For all other roles, enforce tenant isolation
    req.tenantFilter = {
      tenant_id: { in: accessibleTenants }
    };

    next();
  }

  /**
   * Middleware to validate tenant access for specific resource
   */
  static validateTenantAccess(resourceType: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.userContext) {
        return res.status(401).json({ error: 'User context required' });
      }

      const resourceId = req.params.id || req.params.tenantId;
      if (!resourceId) {
        return next();
      }

      try {
        // Check if user has access to this specific resource
        const hasAccess = await TenantIsolationMiddleware.checkResourceAccess(
          resourceType,
          resourceId,
          req.userContext
        );

        if (!hasAccess) {
          return res.status(403).json({ 
            error: 'Access denied to resource',
            resource_type: resourceType,
            resource_id: resourceId
          });
        }

        next();
      } catch (error) {
        console.error('Tenant access validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Middleware to automatically add tenant_id to create/update operations
   */
  static addTenantContext(req: Request, res: Response, next: NextFunction) {
    if (!req.userContext) {
      return res.status(401).json({ error: 'User context required' });
    }

    const { user } = req.userContext;

    // For create operations, ensure tenant_id is set
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!req.body.tenant_id) {
        req.body.tenant_id = user.tenant_id;
      }

      // Validate that user is trying to create/update within their accessible tenants
      if (req.body.tenant_id && !req.userContext.accessible_tenants.includes(req.body.tenant_id)) {
        return res.status(403).json({ 
          error: 'Cannot create/update resource in inaccessible tenant',
          tenant_id: req.body.tenant_id,
          accessible_tenants: req.userContext.accessible_tenants
        });
      }
    }

    next();
  }

  /**
   * Check if user has access to a specific resource
   */
  private static async checkResourceAccess(
    resourceType: string,
    resourceId: string,
    userContext: any
  ): Promise<boolean> {
    const { user, accessibleTenants } = userContext;

    // SuperAdmin has access to everything
    if (user.role === UserRole.SUPERADMIN) {
      return true;
    }

    try {
      let query;
      
      switch (resourceType) {
        case 'dealership_data':
          query = supabase
            .from('dealership_data')
            .select('tenant_id')
            .eq('id', resourceId)
            .single();
          break;

        case 'users':
          query = supabase
            .from('users')
            .select('tenant_id')
            .eq('id', resourceId)
            .single();
          break;

        case 'tenants':
          // For tenant access, check if it's in accessible tenants
          return accessibleTenants.includes(resourceId);

        default:
          // Generic check - look for tenant_id column
          query = supabase
            .from(resourceType)
            .select('tenant_id')
            .eq('id', resourceId)
            .single();
      }

      if (query) {
        const { data, error } = await query;
        
        if (error || !data) {
          return false;
        }

        return accessibleTenants.includes(data.tenant_id);
      }

      return false;
    } catch (error) {
      console.error('Error checking resource access:', error);
      return false;
    }
  }

  /**
   * Middleware to log tenant access for audit purposes
   */
  static logTenantAccess(req: Request, res: Response, next: NextFunction) {
    if (!req.userContext) {
      return next();
    }

    const { user, tenant } = req.userContext;
    const resourceType = req.route?.path || 'unknown';
    const action = req.method;

    // Log the access (you might want to store this in audit_log table)
    console.log(`Tenant Access: User ${user.id} (${user.role}) from tenant ${tenant.id} (${tenant.type}) accessed ${action} ${resourceType}`);

    next();
  }
}

// Convenience exports
export const enforceTenantFilter = TenantIsolationMiddleware.enforceTenantFilter;
export const validateTenantAccess = TenantIsolationMiddleware.validateTenantAccess;
export const addTenantContext = TenantIsolationMiddleware.addTenantContext;
export const logTenantAccess = TenantIsolationMiddleware.logTenantAccess;
