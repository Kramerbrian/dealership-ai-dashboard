import { supabase } from '../database/supabase';
import { UserRole, UserPermissions, User, Tenant } from '../types/user';

export interface CreateUserParams {
  clerkId: string;
  tenantId: string;
  role: UserRole;
  permissions?: Partial<UserPermissions>;
}

export interface UpdateUserParams {
  role?: UserRole;
  permissions?: Partial<UserPermissions>;
  accessibleTenants?: string[];
}

export interface GetTenantUsersParams {
  tenantId: string;
  page: number;
  limit: number;
  search?: string;
  accessibleTenants?: string[];
}

export interface InviteUserParams {
  email: string;
  role: UserRole;
  tenantId: string;
  invitedBy: string;
  message?: string;
}

export interface GetUserActivityParams {
  userId: string;
  tenantId: string;
  page: number;
  limit: number;
  accessibleTenants?: string[];
}

export class UserService {
  async getUserProfile(userId: string): Promise<User> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          tenants!inner(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  async getTenantUsers(params: GetTenantUsersParams) {
    try {
      const { tenantId, page, limit, search, accessibleTenants } = params;
      
      // Validate tenant access
      if (accessibleTenants && !accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      let query = supabase
        .from('users')
        .select(`
          *,
          tenants!inner(*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`clerk_id.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      return {
        users: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting tenant users:', error);
      throw new Error('Failed to get tenant users');
    }
  }

  async getUser(userId: string, accessibleTenants: string[]): Promise<User> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          tenants!inner(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Validate tenant access
      if (!accessibleTenants.includes(user.tenant_id)) {
        throw new Error('Access denied to user');
      }

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async createUser(params: CreateUserParams): Promise<User> {
    try {
      const { clerkId, tenantId, role, permissions = {} } = params;

      // Get default permissions for role
      const defaultPermissions = this.getDefaultPermissions(role);
      const finalPermissions = { ...defaultPermissions, ...permissions };

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          tenant_id: tenantId,
          role,
          permissions: finalPermissions,
        })
        .select(`
          *,
          tenants!inner(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Log the user creation
      await this.logUserAction(user.id, tenantId, 'user_created', {
        clerkId,
        role,
        permissions: finalPermissions
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(userId: string, params: UpdateUserParams): Promise<User> {
    try {
      const { role, permissions, accessibleTenants } = params;

      // Validate tenant access
      const user = await this.getUser(userId, accessibleTenants || []);

      const updateData: any = {};
      
      if (role) {
        updateData.role = role;
        updateData.permissions = this.getDefaultPermissions(role);
      }
      
      if (permissions) {
        updateData.permissions = { ...user.permissions, ...permissions };
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select(`
          *,
          tenants!inner(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Log the user update
      await this.logUserAction(userId, user.tenant_id, 'user_updated', {
        changes: updateData
      });

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId: string, accessibleTenants: string[]): Promise<void> {
    try {
      // Validate tenant access
      const user = await this.getUser(userId, accessibleTenants);

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Log the user deletion
      await this.logUserAction(userId, user.tenant_id, 'user_deleted', {
        deletedUser: user.clerk_id
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async getUserPermissions(userId: string, accessibleTenants: string[]): Promise<UserPermissions> {
    try {
      const user = await this.getUser(userId, accessibleTenants);
      return user.permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw new Error('Failed to get user permissions');
    }
  }

  async updateUserPermissions(
    userId: string, 
    permissions: Partial<UserPermissions>, 
    accessibleTenants: string[]
  ): Promise<UserPermissions> {
    try {
      const user = await this.getUser(userId, accessibleTenants);
      
      const updatedPermissions = { ...user.permissions, ...permissions };

      const { data, error } = await supabase
        .from('users')
        .update({ permissions: updatedPermissions })
        .eq('id', userId)
        .select('permissions')
        .single();

      if (error) {
        throw error;
      }

      // Log the permission update
      await this.logUserAction(userId, user.tenant_id, 'permissions_updated', {
        newPermissions: updatedPermissions
      });

      return data.permissions;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw new Error('Failed to update user permissions');
    }
  }

  async getUserActivity(params: GetUserActivityParams) {
    try {
      const { userId, tenantId, page, limit, accessibleTenants } = params;
      
      // Validate tenant access
      if (accessibleTenants && !accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      const { data, error, count } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      return {
        activity: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw new Error('Failed to get user activity');
    }
  }

  async inviteUser(params: InviteUserParams) {
    try {
      const { email, role, tenantId, invitedBy, message } = params;

      // This would typically integrate with an email service
      // For now, we'll create a placeholder invitation record
      const invitation = {
        id: `inv_${Date.now()}`,
        email,
        role,
        tenantId,
        invitedBy,
        message,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date().toISOString(),
      };

      // Log the invitation
      await this.logUserAction(invitedBy, tenantId, 'user_invited', {
        email,
        role,
        message
      });

      return invitation;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw new Error('Failed to invite user');
    }
  }

  canAssignRole(currentRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.SUPERADMIN]: [UserRole.SUPERADMIN, UserRole.ENTERPRISE_ADMIN, UserRole.DEALERSHIP_ADMIN, UserRole.USER],
      [UserRole.ENTERPRISE_ADMIN]: [UserRole.ENTERPRISE_ADMIN, UserRole.DEALERSHIP_ADMIN, UserRole.USER],
      [UserRole.DEALERSHIP_ADMIN]: [UserRole.DEALERSHIP_ADMIN, UserRole.USER],
      [UserRole.USER]: [], // Users cannot assign roles
    };

    return (roleHierarchy[currentRole] as UserRole[])?.includes(targetRole) || false;
  }

  private getDefaultPermissions(role: UserRole): UserPermissions {
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

  private async logUserAction(
    userId: string, 
    tenantId: string, 
    action: string, 
    details: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_log')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          action,
          resource_type: 'user',
          details,
        });
    } catch (error) {
      console.error('Error logging user action:', error);
      // Don't throw here as logging shouldn't break the main operation
    }
  }
}

export const userService = new UserService();
