import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config';

// Create Supabase client for regular operations
export const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseKey
);

// Create Supabase client for admin operations
export const supabaseAdmin = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          dealership_url: string | null;
          dealership_name: string | null;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          status: string;
          plan: string;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_end: string | null;
          cancel_at_period_end: boolean;
          activated_at: string;
          canceled_at: string | null;
          utm_source: string | null;
          utm_campaign: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          dealership_url?: string | null;
          dealership_name?: string | null;
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          status?: string;
          plan?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          activated_at?: string;
          canceled_at?: string | null;
          utm_source?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          dealership_url?: string | null;
          dealership_name?: string | null;
          stripe_customer_id?: string;
          stripe_subscription_id?: string | null;
          status?: string;
          plan?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          activated_at?: string;
          canceled_at?: string | null;
          utm_source?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          dealership_url: string;
          ai_visibility_score: number | null;
          results: any | null;
          is_premium: boolean;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dealership_url: string;
          ai_visibility_score?: number | null;
          results?: any | null;
          is_premium?: boolean;
          unlocked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dealership_url?: string;
          ai_visibility_score?: number | null;
          results?: any | null;
          is_premium?: boolean;
          unlocked_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
