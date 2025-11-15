import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic SEO Analysis',
      'AEO Analysis',
      'GEO Analysis',
      '5 reports per month',
      'Email support'
    ],
    limits: {
      reportsPerMonth: 5,
      domainsPerUser: 1,
      apiCallsPerMonth: 100,
      dataRetentionDays: 30
    }
  },
  professional: {
    name: 'Professional',
    price: 499,
    interval: 'month',
    features: [
      'Everything in Free',
      'Advanced Analytics',
      'Custom Reports',
      'Unlimited reports',
      'Priority support',
      'Data export'
    ],
    limits: {
      reportsPerMonth: -1, // unlimited
      domainsPerUser: 5,
      apiCallsPerMonth: 10000,
      dataRetentionDays: 365
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    features: [
      'Everything in Professional',
      'API Access',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    limits: {
      reportsPerMonth: -1, // unlimited
      domainsPerUser: -1, // unlimited
      apiCallsPerMonth: -1, // unlimited
      dataRetentionDays: -1 // unlimited
    }
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

// User management class
export class UserManager {
  private static instance: UserManager;

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  // Create or update user profile
  async createOrUpdateUser(userData: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    auth_provider?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar_url: userData.avatar_url,
          auth_provider: userData.auth_provider,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) throw error;

      // Create default free subscription if user is new
      await this.createDefaultSubscription(userData.id);

      return { success: true, data };
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create default free subscription
  private async createDefaultSubscription(userId: string) {
    try {
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingSubscription) return; // Subscription already exists

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating default subscription:', error);
    }
  }

  // Get user subscription
  async getUserSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return {
        success: true,
        data: data || {
          plan_type: 'free',
          status: 'active',
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Check if user can access a feature
  async canAccessFeature(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription.success) return false;

      const plan = subscription.data.plan_type as SubscriptionPlan;
      const planConfig = SUBSCRIPTION_PLANS[plan];

      // Check feature access based on plan
      switch (feature) {
        case 'seo_analysis':
        case 'aeo_analysis':
        case 'geo_analysis':
          return true; // All plans have access

        case 'advanced_analytics':
        case 'custom_reports':
          return plan !== 'free';

        case 'api_access':
        case 'white_label':
          return plan === 'enterprise';

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  // Track feature usage
  async trackFeatureUsage(userId: string, feature: string, metadata?: any) {
    try {
      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          feature,
          metadata: metadata || {}
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get usage statistics
  async getUsageStats(userId: string, feature?: string) {
    try {
      let query = supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId);

      if (feature) {
        query = query.eq('feature', feature);
      }

      const { data, error } = await query
        .gte('usage_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('usage_date', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Check usage limits
  async checkUsageLimits(userId: string, feature: string): Promise<{ canUse: boolean; remaining: number }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription.success) return { canUse: false, remaining: 0 };

      const plan = subscription.data.plan_type as SubscriptionPlan;
      const planConfig = SUBSCRIPTION_PLANS[plan];

      // Get current month usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usage, error } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('feature', feature)
        .gte('usage_date', startOfMonth.toISOString());

      if (error) throw error;

      const currentUsage = usage?.reduce((sum, record) => sum + record.usage_count, 0) || 0;
      const limit = planConfig.limits.reportsPerMonth;

      if (limit === -1) {
        return { canUse: true, remaining: -1 }; // Unlimited
      }

      const remaining = Math.max(0, limit - currentUsage);
      return { canUse: remaining > 0, remaining };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { canUse: false, remaining: 0 };
    }
  }

  // Upgrade subscription
  async upgradeSubscription(userId: string, newPlan: SubscriptionPlan, stripeSubscriptionId?: string) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: newPlan,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get user analytics
  async getUserAnalytics(userId: string, days: number = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Track analytics event
  async trackAnalyticsEvent(userId: string, eventType: string, eventData?: any, sessionId?: string) {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          event_data: eventData || {},
          session_id: sessionId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const userManager = UserManager.getInstance();

// Helper functions
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  return SUBSCRIPTION_PLANS[plan].name;
}

export function getPlanPrice(plan: SubscriptionPlan): number {
  return SUBSCRIPTION_PLANS[plan].price;
}

export function getPlanFeatures(plan: SubscriptionPlan): string[] {
  return SUBSCRIPTION_PLANS[plan].features as any as string[];
}

export function getPlanLimits(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan].limits;
}
