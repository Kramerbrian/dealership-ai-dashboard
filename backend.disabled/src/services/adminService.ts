import { supabase } from '../database/supabase';

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyAnalyses: number;
}

export interface UserFilters {
  page: number;
  limit: number;
  search?: string;
}

export interface SubscriptionFilters {
  page: number;
  limit: number;
  status?: string;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  metric?: string;
}

export class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total analyses this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: monthlyAnalyses } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Calculate total revenue (mock calculation)
      const totalRevenue = (activeSubscriptions || 0) * 99; // Assuming $99/month per subscription

      return {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalRevenue,
        monthlyAnalyses: monthlyAnalyses || 0,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  async getUsers(filters: UserFilters) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`email.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .range(
          (filters.page - 1) * filters.limit,
          filters.page * filters.limit - 1
        );

      if (error) {
        throw error;
      }

      return {
        users: data || [],
        total: count || 0,
        page: filters.page,
        limit: filters.limit,
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  async getUserDetails(userId: string) {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw userError;
      }

      // Get user's subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get user's analyses
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return {
        user,
        subscription,
        analyses: analyses || [],
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      throw new Error('Failed to get user details');
    }
  }

  async getSubscriptions(filters: SubscriptionFilters) {
    try {
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          users!inner(email)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error, count } = await query
        .range(
          (filters.page - 1) * filters.limit,
          filters.page * filters.limit - 1
        );

      if (error) {
        throw error;
      }

      return {
        subscriptions: data || [],
        total: count || 0,
        page: filters.page,
        limit: filters.limit,
      };
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      throw new Error('Failed to get subscriptions');
    }
  }

  async getAnalytics(filters: AnalyticsFilters) {
    try {
      let query = supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process analytics data based on metric
      const analytics = this.processAnalyticsData(data || [], filters.metric);

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
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
          premium: data.filter(d => d.is_premium).length,
          free: data.filter(d => !d.is_premium).length,
          averageScore: data.reduce((sum, d) => sum + (d.ai_visibility_score || 0), 0) / data.length,
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

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  async getSystemHealth() {
    try {
      // Check database connection
      const { data: dbCheck, error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      const dbHealthy = !dbError;

      // Check external services (mock implementation)
      const services = {
        database: dbHealthy,
        stripe: true, // Implement actual Stripe health check
        openai: true, // Implement actual OpenAI health check
        clerk: true, // Implement actual Clerk health check
      };

      const overallHealth = Object.values(services).every(status => status);

      return {
        status: overallHealth ? 'healthy' : 'unhealthy',
        services,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        status: 'unhealthy',
        services: {
          database: false,
          stripe: false,
          openai: false,
          clerk: false,
        },
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}

export const adminService = new AdminService();
