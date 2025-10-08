import { supabase } from '../database/supabase';
import { Tenant, TenantType } from '../types/user';

export interface CreateTenantParams {
  name: string;
  type: TenantType;
  parentId?: string;
  settings?: any;
}

export interface UpdateTenantParams {
  name?: string;
  settings?: any;
  accessibleTenants?: string[];
}

export interface GetTenantUsersParams {
  tenantId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface GetTenantDealershipsParams {
  tenantId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface GetTenantAnalyticsParams {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  metric?: string;
}

export interface GetTenantAuditLogParams {
  tenantId: string;
  page: number;
  limit: number;
  action?: string;
  userId?: string;
}

export class TenantService {
  async getAllTenants(params: {
    page: number;
    limit: number;
    search?: string;
    type?: TenantType;
  }) {
    try {
      const { page, limit, search, type } = params;

      let query = supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      return {
        tenants: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw new Error('Failed to get tenants');
    }
  }

  async getAccessibleTenants(accessibleTenantIds: string[]) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .in('id', accessibleTenantIds)
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting accessible tenants:', error);
      throw new Error('Failed to get accessible tenants');
    }
  }

  async getTenant(tenantId: string, accessibleTenants: string[]): Promise<Tenant> {
    try {
      // Validate tenant access
      if (!accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) {
        throw error;
      }

      return tenant;
    } catch (error) {
      console.error('Error getting tenant:', error);
      throw new Error('Failed to get tenant');
    }
  }

  async createTenant(params: CreateTenantParams): Promise<Tenant> {
    try {
      const { name, type, parentId, settings = {} } = params;

      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert({
          name,
          type,
          parent_id: parentId,
          settings,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error('Failed to create tenant');
    }
  }

  async updateTenant(tenantId: string, params: UpdateTenantParams): Promise<Tenant> {
    try {
      const { name, settings, accessibleTenants } = params;

      // Validate tenant access
      if (accessibleTenants && !accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (settings) updateData.settings = settings;

      const { data: tenant, error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return tenant;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new Error('Failed to update tenant');
    }
  }

  async deleteTenant(tenantId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw new Error('Failed to delete tenant');
    }
  }

  async getTenantHierarchy(tenantId: string, accessibleTenants: string[]) {
    try {
      // Validate tenant access
      if (!accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      // Get the tenant and its children
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError) {
        throw tenantError;
      }

      const { data: children, error: childrenError } = await supabase
        .from('tenants')
        .select('*')
        .eq('parent_id', tenantId)
        .in('id', accessibleTenants);

      if (childrenError) {
        throw childrenError;
      }

      return {
        tenant,
        children: children || [],
      };
    } catch (error) {
      console.error('Error getting tenant hierarchy:', error);
      throw new Error('Failed to get tenant hierarchy');
    }
  }

  async getTenantStats(tenantId: string, accessibleTenants: string[]) {
    try {
      // Validate tenant access
      if (!accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (userError) {
        throw userError;
      }

      // Get dealership count
      const { count: dealershipCount, error: dealershipError } = await supabase
        .from('dealership_data')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (dealershipError) {
        throw dealershipError;
      }

      // Get analysis count
      const { count: analysisCount, error: analysisError } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (analysisError) {
        throw analysisError;
      }

      // Get average scores
      const { data: scores, error: scoresError } = await supabase
        .from('dealership_data')
        .select('overall_score, ai_visibility_score, zero_click_score, ugc_health_score, geo_trust_score, sgp_integrity_score')
        .eq('tenant_id', tenantId);

      if (scoresError) {
        throw scoresError;
      }

      const avgScores = scores?.length ? {
        overall: Math.round(scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length),
        ai_visibility: Math.round(scores.reduce((sum, s) => sum + (s.ai_visibility_score || 0), 0) / scores.length),
        zero_click: Math.round(scores.reduce((sum, s) => sum + (s.zero_click_score || 0), 0) / scores.length),
        ugc_health: Math.round(scores.reduce((sum, s) => sum + (s.ugc_health_score || 0), 0) / scores.length),
        geo_trust: Math.round(scores.reduce((sum, s) => sum + (s.geo_trust_score || 0), 0) / scores.length),
        sgp_integrity: Math.round(scores.reduce((sum, s) => sum + (s.sgp_integrity_score || 0), 0) / scores.length),
      } : null;

      return {
        userCount: userCount || 0,
        dealershipCount: dealershipCount || 0,
        analysisCount: analysisCount || 0,
        averageScores: avgScores,
      };
    } catch (error) {
      console.error('Error getting tenant stats:', error);
      throw new Error('Failed to get tenant stats');
    }
  }

  async getTenantUsers(params: GetTenantUsersParams) {
    try {
      const { tenantId, page, limit, search } = params;

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

  async getTenantDealerships(params: GetTenantDealershipsParams) {
    try {
      const { tenantId, page, limit, search } = params;

      let query = supabase
        .from('dealership_data')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`dealership_name.ilike.%${search}%,dealership_url.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      return {
        dealerships: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting tenant dealerships:', error);
      throw new Error('Failed to get tenant dealerships');
    }
  }

  async getTenantAnalytics(params: GetTenantAnalyticsParams) {
    try {
      const { tenantId, startDate, endDate, metric } = params;

      let query = supabase
        .from('dealership_data')
        .select('*')
        .eq('tenant_id', tenantId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process analytics data based on metric
      const analytics = this.processAnalyticsData(data || [], metric);

      return analytics;
    } catch (error) {
      console.error('Error getting tenant analytics:', error);
      throw new Error('Failed to get tenant analytics');
    }
  }

  async updateTenantSettings(
    tenantId: string, 
    settings: any, 
    accessibleTenants: string[]
  ): Promise<any> {
    try {
      // Validate tenant access
      if (!accessibleTenants.includes(tenantId)) {
        throw new Error('Access denied to tenant');
      }

      const { data, error } = await supabase
        .from('tenants')
        .update({ settings })
        .eq('id', tenantId)
        .select('settings')
        .single();

      if (error) {
        throw error;
      }

      return data.settings;
    } catch (error) {
      console.error('Error updating tenant settings:', error);
      throw new Error('Failed to update tenant settings');
    }
  }

  async getTenantBilling(tenantId: string) {
    try {
      // This would integrate with your billing system (Stripe, etc.)
      // For now, return mock data
      return {
        tenantId,
        plan: 'pro',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 9900, // $99.00 in cents
        currency: 'usd',
      };
    } catch (error) {
      console.error('Error getting tenant billing:', error);
      throw new Error('Failed to get tenant billing');
    }
  }

  async updateTenantBilling(tenantId: string, billingInfo: any) {
    try {
      // This would integrate with your billing system
      // For now, just return the updated info
      return {
        tenantId,
        ...billingInfo,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating tenant billing:', error);
      throw new Error('Failed to update tenant billing');
    }
  }

  async getTenantAuditLog(params: GetTenantAuditLogParams) {
    try {
      const { tenantId, page, limit, action, userId } = params;

      let query = supabase
        .from('audit_log')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('timestamp', { ascending: false });

      if (action) {
        query = query.eq('action', action);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      return {
        auditLog: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting tenant audit log:', error);
      throw new Error('Failed to get tenant audit log');
    }
  }

  private processAnalyticsData(data: any[], metric?: string) {
    switch (metric) {
      case 'daily':
        return this.getDailyAnalytics(data);
      case 'weekly':
        return this.getWeeklyAnalytics(data);
      case 'monthly':
        return this.getMonthlyAnalytics(data);
      default:
        return {
          total: data.length,
          averageScore: data.length ? Math.round(data.reduce((sum, d) => sum + (d.overall_score || 0), 0) / data.length) : 0,
          scoreDistribution: this.getScoreDistribution(data),
        };
    }
  }

  private getDailyAnalytics(data: any[]) {
    const daily = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return { daily };
  }

  private getWeeklyAnalytics(data: any[]) {
    const weekly = data.reduce((acc, item) => {
      const date = new Date(item.created_at);
      const week = this.getWeekNumber(date);
      const key = `${date.getFullYear()}-W${week}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return { weekly };
  }

  private getMonthlyAnalytics(data: any[]) {
    const monthly = data.reduce((acc, item) => {
      const date = new Date(item.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return { monthly };
  }

  private getScoreDistribution(data: any[]) {
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    data.forEach(item => {
      const score = item.overall_score || 0;
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });

    return distribution;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

export const tenantService = new TenantService();
