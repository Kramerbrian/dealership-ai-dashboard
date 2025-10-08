export enum UserRole {
  SUPERADMIN = 'superadmin',
  ENTERPRISE_ADMIN = 'enterprise_admin',
  DEALERSHIP_ADMIN = 'dealership_admin',
  USER = 'user'
}

export enum TenantType {
  ENTERPRISE = 'enterprise',
  DEALERSHIP = 'dealership',
  SINGLE = 'single'
}

export interface Tenant {
  id: string;
  name: string;
  type: TenantType;
  parent_id?: string;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  max_dealerships?: number;
  features_enabled: string[];
  billing_tier: 'basic' | 'pro' | 'enterprise';
  custom_domains?: string[];
  integrations?: Record<string, any>;
}

export interface User {
  id: string;
  clerk_id: string;
  tenant_id: string;
  role: UserRole;
  permissions: UserPermissions;
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  can_view_analytics: boolean;
  can_export_data: boolean;
  can_manage_users: boolean;
  can_manage_settings: boolean;
  can_view_billing: boolean;
  can_manage_billing: boolean;
  can_access_admin_panel: boolean;
  can_view_all_tenants: boolean;
  can_manage_tenants: boolean;
  custom_permissions?: string[];
}

export interface DealershipData {
  tenant_id: string;
  ai_visibility_score: number;
  schema_audit: any;
  zero_click_score: number;
  ugc_health_score: number;
  geo_trust_score: number;
  sgp_integrity_score: number;
  overall_score: number;
  last_analyzed: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  tenant_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface UserContext {
  user: User;
  tenant: Tenant;
  accessible_tenants: string[]; // For enterprise admins
  permissions: UserPermissions;
}
