-- =====================================================
-- ACP-Enabled PLG Integration Schema
-- Version: 1.0.0
-- Date: 2025-11-01
--
-- This migration creates the complete schema for the
-- Agentic Commerce Protocol (ACP) Product-Led Growth
-- funnel integration.
-- =====================================================

-- =====================================================
-- 1. TENANTS TABLE
-- Multi-tenant account management
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, suspended
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);

-- =====================================================
-- 2. ORDERS TABLE
-- Tracks all orders from Stripe and ACP
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_id TEXT UNIQUE,
  sku TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  source TEXT NOT NULL, -- 'stripe' or 'agentic'
  acp_token TEXT,
  customer_id TEXT,
  subscription_id TEXT,
  status TEXT NOT NULL, -- pending, completed, canceled, refunded
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_subscription_id ON orders(subscription_id);

-- =====================================================
-- 3. EVENTS TABLE
-- Audit log for all lifecycle events
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL, -- lead.created, trial.started, conversion.completed, etc.
  source TEXT, -- clerk, stripe, acp, manual
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- =====================================================
-- 4. PULSE EVENTS TABLE
-- Real-time dashboard feed events
-- =====================================================
CREATE TABLE IF NOT EXISTS pulse_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pulse_events_user_id ON pulse_events(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_events_type ON pulse_events(event_type);
CREATE INDEX IF NOT EXISTS idx_pulse_events_created_at ON pulse_events(created_at DESC);

-- =====================================================
-- 5. PLG METRICS TABLE
-- Aggregated KPI metrics
-- =====================================================
CREATE TABLE IF NOT EXISTS plg_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_plg_metrics_name ON plg_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_plg_metrics_created_at ON plg_metrics(created_at DESC);

-- =====================================================
-- 6. KPI DAILY ROLLUPS TABLE
-- Daily aggregated metrics for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_daily (
  day DATE PRIMARY KEY,
  signups INTEGER NOT NULL DEFAULT 0,
  trials INTEGER NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,
  acp_orders INTEGER NOT NULL DEFAULT 0,
  agent_sessions INTEGER NOT NULL DEFAULT 0,
  activation_rate NUMERIC(5,2),
  trial_to_paid_rate NUMERIC(5,2),
  agentic_conversion_rate NUMERIC(5,2),
  mrr INTEGER NOT NULL DEFAULT 0, -- Monthly Recurring Revenue in cents
  churn_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_kpi_daily_day ON kpi_daily(day DESC);

-- =====================================================
-- 7. RLS (ROW LEVEL SECURITY) POLICIES
-- Multi-tenant data isolation
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_events ENABLE ROW LEVEL SECURITY;

-- Tenants policies
DROP POLICY IF EXISTS tenants_self ON tenants;
CREATE POLICY tenants_self ON tenants
  FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Orders policies
DROP POLICY IF EXISTS orders_self ON orders;
CREATE POLICY orders_self ON orders
  FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Events policies
DROP POLICY IF EXISTS events_self ON events;
CREATE POLICY events_self ON events
  FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Pulse events policies
DROP POLICY IF EXISTS pulse_events_self ON pulse_events;
CREATE POLICY pulse_events_self ON pulse_events
  FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Service role policies (for webhooks)
DROP POLICY IF EXISTS tenants_service_role ON tenants;
CREATE POLICY tenants_service_role ON tenants
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS orders_service_role ON orders;
CREATE POLICY orders_service_role ON orders
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS events_service_role ON events;
CREATE POLICY events_service_role ON events
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS pulse_events_service_role ON pulse_events;
CREATE POLICY pulse_events_service_role ON pulse_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 8. FUNCTIONS
-- Business logic for webhook processing
-- =====================================================

-- Function: sync_account_status
-- Syncs account status from webhook events
DROP FUNCTION IF EXISTS public.sync_account_status(JSONB);
CREATE OR REPLACE FUNCTION public.sync_account_status(event JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id TEXT;
  v_email TEXT;
  v_plan TEXT;
  v_status TEXT;
  v_subscription_id TEXT;
  v_customer_id TEXT;
BEGIN
  -- Extract event data
  v_user_id := event->>'userId';
  v_email := event->>'email';
  v_plan := COALESCE(event->>'plan', 'FREE');
  v_status := COALESCE(event->>'status', 'active');
  v_subscription_id := event->>'subscriptionId';
  v_customer_id := event->>'customerId';

  -- Update or insert tenant
  INSERT INTO tenants (
    user_id,
    email,
    plan,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    updated_at
  )
  VALUES (
    v_user_id,
    v_email,
    v_plan,
    v_status,
    v_customer_id,
    v_subscription_id,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, tenants.stripe_customer_id),
    stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, tenants.stripe_subscription_id),
    updated_at = NOW();

  -- Insert event log
  INSERT INTO events (user_id, type, source, payload)
  VALUES (
    v_user_id,
    'account.status_changed',
    event->>'source',
    event
  );

  -- Log to application
  RAISE NOTICE 'Account synced for user: %', v_user_id;
END;
$$;

-- Function: track_plg_event
-- Tracks PLG funnel events
DROP FUNCTION IF EXISTS public.track_plg_event(TEXT, TEXT, TEXT, JSONB);
CREATE OR REPLACE FUNCTION public.track_plg_event(
  p_user_id TEXT,
  p_event_type TEXT,
  p_source TEXT,
  p_event_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert event
  INSERT INTO events (user_id, type, source, payload, created_at)
  VALUES (p_user_id, p_event_type, p_source, p_event_data, NOW());

  -- Insert pulse event for dashboard
  INSERT INTO pulse_events (user_id, event_type, event_data, created_at)
  VALUES (p_user_id, p_event_type, p_event_data, NOW());

  -- Update daily KPI rollup
  INSERT INTO kpi_daily (day)
  VALUES (CURRENT_DATE)
  ON CONFLICT (day) DO UPDATE
  SET
    signups = CASE WHEN p_event_type = 'user.created' THEN kpi_daily.signups + 1 ELSE kpi_daily.signups END,
    trials = CASE WHEN p_event_type = 'trial.started' THEN kpi_daily.trials + 1 ELSE kpi_daily.trials END,
    paid = CASE WHEN p_event_type = 'conversion.completed' THEN kpi_daily.paid + 1 ELSE kpi_daily.paid END,
    acp_orders = CASE WHEN p_event_type = 'acp.order.completed' THEN kpi_daily.acp_orders + 1 ELSE kpi_daily.acp_orders END,
    updated_at = NOW();
END;
$$;

-- Function: calculate_activation_rate
-- Calculates activation rate for a given period
DROP FUNCTION IF EXISTS public.calculate_activation_rate(DATE, DATE);
CREATE OR REPLACE FUNCTION public.calculate_activation_rate(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_signups INTEGER;
  v_paid_conversions INTEGER;
  v_activation_rate NUMERIC;
BEGIN
  -- Count total signups
  SELECT COUNT(*)
  INTO v_total_signups
  FROM tenants
  WHERE created_at::DATE BETWEEN p_start_date AND p_end_date;

  -- Count paid conversions
  SELECT COUNT(*)
  INTO v_paid_conversions
  FROM tenants
  WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    AND plan != 'FREE';

  -- Calculate activation rate
  IF v_total_signups > 0 THEN
    v_activation_rate := (v_paid_conversions::NUMERIC / v_total_signups::NUMERIC) * 100;
  ELSE
    v_activation_rate := 0;
  END IF;

  RETURN ROUND(v_activation_rate, 2);
END;
$$;

-- Function: calculate_mrr
-- Calculates Monthly Recurring Revenue
DROP FUNCTION IF EXISTS public.calculate_mrr();
CREATE OR REPLACE FUNCTION public.calculate_mrr()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mrr INTEGER;
BEGIN
  -- Sum all active subscriptions
  SELECT COALESCE(SUM(amount), 0)
  INTO v_mrr
  FROM orders
  WHERE status = 'completed'
    AND source IN ('stripe', 'agentic')
    AND subscription_id IS NOT NULL;

  RETURN v_mrr;
END;
$$;

-- =====================================================
-- 9. TRIGGERS
-- Automatic timestamp updates
-- =====================================================

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Tenants trigger
DROP TRIGGER IF EXISTS set_tenants_updated_at ON tenants;
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- KPI daily trigger
DROP TRIGGER IF EXISTS set_kpi_daily_updated_at ON kpi_daily;
CREATE TRIGGER set_kpi_daily_updated_at
  BEFORE UPDATE ON kpi_daily
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- 10. INITIAL DATA
-- Seed data for development/testing
-- =====================================================

-- Insert initial KPI record for today
INSERT INTO kpi_daily (day)
VALUES (CURRENT_DATE)
ON CONFLICT (day) DO NOTHING;

-- Insert initial PLG metric
INSERT INTO plg_metrics (metric_name, metric_value, metric_data)
VALUES (
  'system.initialized',
  1,
  jsonb_build_object(
    'version', '1.0.0',
    'initialized_at', NOW()
  )
);

-- =====================================================
-- 11. COMMENTS
-- Documentation for database objects
-- =====================================================

COMMENT ON TABLE tenants IS 'Multi-tenant account management with PLG funnel tracking';
COMMENT ON TABLE orders IS 'Order tracking for Stripe and ACP (Agentic Commerce Protocol) purchases';
COMMENT ON TABLE events IS 'Audit log for all lifecycle events across the PLG funnel';
COMMENT ON TABLE pulse_events IS 'Real-time dashboard feed events for user engagement';
COMMENT ON TABLE plg_metrics IS 'Aggregated KPI metrics for Product-Led Growth analytics';
COMMENT ON TABLE kpi_daily IS 'Daily rollup of key performance indicators';

COMMENT ON FUNCTION public.sync_account_status(JSONB) IS 'Syncs account status from webhook events (Stripe, ACP, Clerk)';
COMMENT ON FUNCTION public.track_plg_event(TEXT, TEXT, TEXT, JSONB) IS 'Tracks PLG funnel events and updates KPI rollups';
COMMENT ON FUNCTION public.calculate_activation_rate(DATE, DATE) IS 'Calculates activation rate (paid/total) for a date range';
COMMENT ON FUNCTION public.calculate_mrr() IS 'Calculates current Monthly Recurring Revenue from active subscriptions';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ ACP PLG Integration schema migration completed successfully';
  RAISE NOTICE 'Tables created: tenants, orders, events, pulse_events, plg_metrics, kpi_daily';
  RAISE NOTICE 'Functions created: sync_account_status, track_plg_event, calculate_activation_rate, calculate_mrr';
  RAISE NOTICE 'RLS policies enabled for multi-tenant data isolation';
END $$;
