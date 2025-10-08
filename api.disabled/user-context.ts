import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../backend/src/database/supabase';
import { UserRole, TenantType } from '../backend/src/types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Get user from database with tenant information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        tenants!inner(*)
      `)
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    const tenant = user.tenants;
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Get accessible tenants for enterprise admins
    let accessibleTenants: string[] = [user.tenant_id];
    if (user.role === UserRole.ENTERPRISE_ADMIN) {
      accessibleTenants = await getAccessibleTenants(user.tenant_id);
    } else if (user.role === UserRole.SUPERADMIN) {
      accessibleTenants = await getAllTenantIds();
    }

    // Get user permissions
    const permissions = getUserPermissions(user.role, tenant.type);

    const userContext = {
      userId: user.id,
      clerkId: user.clerk_id,
      tenantId: user.tenant_id,
      role: user.role,
      accessibleTenants,
      permissions,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
        parent_id: tenant.parent_id,
        settings: tenant.settings
      }
    };

    res.status(200).json(userContext);

  } catch (error) {
    console.error('User context API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get accessible tenants for enterprise admin
 */
async function getAccessibleTenants(tenantId: string): Promise<string[]> {
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
async function getAllTenantIds(): Promise<string[]> {
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
function getUserPermissions(role: UserRole, tenantType: TenantType) {
  const basePermissions = {
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
        can_view_all_tenants: false,
        can_manage_tenants: true,
      };

    case UserRole.DEALERSHIP_ADMIN:
      return {
        ...basePermissions,
        can_view_analytics: true,
        can_export_data: true,
        can_manage_users: true,
        can_manage_settings: true,
        can_view_billing: true,
        can_manage_billing: false,
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
