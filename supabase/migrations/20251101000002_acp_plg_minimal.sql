-- =====================================================
-- ACP PLG Integration - Minimal Schema (No RLS)
-- Version: 1.0.2
-- Date: 2025-11-01
-- =====================================================

-- Create tables
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  plan TEXT NOT NULL DEFAULT 'FREE',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_id TEXT UNIQUE,
  sku TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  source TEXT NOT NULL,
  acp_token TEXT,
  customer_id TEXT,
  subscription_id TEXT,
  status TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount INTEGER
);

CREATE TABLE IF NOT EXISTS plg_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL,
  source TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day DATE NOT NULL UNIQUE,
  signups INTEGER DEFAULT 0,
  trials INTEGER DEFAULT 0,
  paid INTEGER DEFAULT 0,
  acp_orders INTEGER DEFAULT 0,
  churn_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plg_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_subscription_id ON orders(subscription_id);
CREATE INDEX IF NOT EXISTS idx_plg_events_user_id ON plg_events(user_id);
CREATE INDEX IF NOT EXISTS idx_plg_events_type ON plg_events(type);
CREATE INDEX IF NOT EXISTS idx_kpi_daily_day ON kpi_daily(day);

-- Function: Sync account status
CREATE OR REPLACE FUNCTION sync_account_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE tenants
    SET
      status = CASE
        WHEN NEW.status = 'canceled' THEN 'canceled'
        WHEN NEW.status = 'active' AND NEW.trial_ends_at > NOW() THEN 'trial'
        WHEN NEW.status = 'active' THEN 'active'
        ELSE 'suspended'
      END,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Track PLG event
CREATE OR REPLACE FUNCTION track_plg_event(
  p_user_id TEXT,
  p_type TEXT,
  p_source TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO plg_events (user_id, type, source, payload)
  VALUES (p_user_id, p_type, p_source, p_payload)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate MRR
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS INTEGER AS $$
DECLARE
  total_mrr INTEGER;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN t.plan = 'PRO' THEN 49900
      WHEN t.plan = 'ENTERPRISE' THEN 199900
      ELSE 0
    END
  ), 0)
  INTO total_mrr
  FROM tenants t
  WHERE t.status = 'active' AND t.plan != 'FREE';
  
  RETURN total_mrr;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_account_status();

-- Grant permissions (no RLS - direct service role access)
GRANT ALL ON tenants TO postgres, anon, authenticated, service_role;
GRANT ALL ON orders TO postgres, anon, authenticated, service_role;
GRANT ALL ON plg_events TO postgres, anon, authenticated, service_role;
GRANT ALL ON kpi_daily TO postgres, anon, authenticated, service_role;
GRANT ALL ON plg_metrics TO postgres, anon, authenticated, service_role;

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ACP PLG Integration - SUCCESS!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables: tenants, orders, plg_events, kpi_daily, plg_metrics';
  RAISE NOTICE 'Functions: sync_account_status(), track_plg_event(), calculate_mrr()';
  RAISE NOTICE 'Trigger: on_order_status_change';
  RAISE NOTICE 'RLS: Disabled (service role has full access)';
  RAISE NOTICE '========================================';
END $$;
