-- Agentic Commerce Protocol (ACP) Database Schema
-- Run this in your Supabase SQL editor

-- Table: acp_checkout_sessions
-- Stores all checkout session data for the ACP flow
CREATE TABLE IF NOT EXISTS acp_checkout_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,

  -- Items in cart (JSONB for flexibility)
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Pricing
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Shipping information (optional)
  shipping JSONB DEFAULT NULL,

  -- Payment information
  payment JSONB DEFAULT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'updated', 'processing', 'completed', 'failed', 'expired')),

  -- Stripe integration
  stripe_subscription_id TEXT DEFAULT NULL,
  stripe_payment_intent_id TEXT DEFAULT NULL,
  stripe_customer_id TEXT DEFAULT NULL,

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  error TEXT DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  -- Indexes for performance
  CONSTRAINT valid_email CHECK (buyer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_acp_sessions_session_id ON acp_checkout_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_acp_sessions_user_id ON acp_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_acp_sessions_email ON acp_checkout_sessions(buyer_email);
CREATE INDEX IF NOT EXISTS idx_acp_sessions_status ON acp_checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_acp_sessions_created_at ON acp_checkout_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acp_sessions_expires_at ON acp_checkout_sessions(expires_at);

-- Table: orders
-- Enhanced orders table to work with ACP
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT REFERENCES acp_checkout_sessions(session_id),

  -- Order details
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || LPAD(FLOOR(RANDOM() * 999999999)::TEXT, 9, '0')),

  -- Items purchased
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Payment
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),

  -- Shipping
  shipping_address JSONB DEFAULT NULL,
  shipping_status TEXT DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT DEFAULT NULL,

  -- Stripe integration
  stripe_subscription_id TEXT DEFAULT NULL,
  stripe_payment_intent_id TEXT DEFAULT NULL,
  stripe_invoice_id TEXT DEFAULT NULL,

  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ DEFAULT NULL,
  cancelled_at TIMESTAMPTZ DEFAULT NULL
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_subscription_id ON orders(stripe_subscription_id);

-- Table: products
-- Product catalog for conversational commerce
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period TEXT CHECK (billing_period IN ('one_time', 'monthly', 'yearly', 'quarterly')),

  -- Product details
  category TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,

  -- Inventory
  stock_quantity INTEGER DEFAULT NULL, -- NULL for digital/subscription products
  is_available BOOLEAN DEFAULT TRUE,

  -- Stripe integration
  stripe_price_id TEXT,
  stripe_product_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- SEO & Display
  slug TEXT UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ DEFAULT NULL
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- Table: product_variants
-- For products with multiple options (size, color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,

  -- Pricing (if different from base product)
  price_adjustment DECIMAL(10, 2) DEFAULT 0,

  -- Variant details
  options JSONB DEFAULT '{}'::jsonb, -- {"size": "large", "color": "blue"}
  sku TEXT UNIQUE,

  -- Inventory
  stock_quantity INTEGER DEFAULT NULL,
  is_available BOOLEAN DEFAULT TRUE,

  -- Stripe integration
  stripe_price_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for product_variants
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_variant_id ON product_variants(variant_id);
CREATE INDEX IF NOT EXISTS idx_variants_is_available ON product_variants(is_available);

-- Table: conversation_messages
-- Store conversational commerce interactions
CREATE TABLE IF NOT EXISTS conversation_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT REFERENCES acp_checkout_sessions(session_id),
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

  -- Message details
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Context & metadata
  intent TEXT, -- e.g., 'browse', 'add_to_cart', 'checkout', 'support'
  entities JSONB DEFAULT '{}'::jsonb, -- Extracted entities (product names, quantities, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_session_id ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_intent ON conversation_messages(intent);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_acp_sessions_updated_at ON acp_checkout_sessions;
CREATE TRIGGER update_acp_sessions_updated_at
  BEFORE UPDATE ON acp_checkout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE acp_checkout_sessions
  SET status = 'expired'
  WHERE status IN ('pending', 'updated')
    AND expires_at < NOW()
    AND status != 'expired';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Seed initial products (DealershipAI tiers)
INSERT INTO products (product_id, name, description, price, currency, billing_period, category, features, stripe_price_id, stripe_product_id, slug, is_featured, display_order)
VALUES
  (
    'pro',
    'Pro Tier',
    'Complete AI visibility platform for growing dealerships',
    599.00,
    'USD',
    'monthly',
    'subscription',
    '["Unlimited analyses", "Detailed reports", "Competitor tracking", "Real-time alerts", "Priority support"]'::jsonb,
    NULL, -- Add your Stripe price ID
    NULL, -- Add your Stripe product ID
    'pro-tier',
    TRUE,
    1
  ),
  (
    'premium',
    'Premium+ Tier',
    'Enterprise-grade AI analytics with white-label options',
    999.00,
    'USD',
    'monthly',
    'subscription',
    '["Everything in Pro", "White-label branding", "API access", "Dedicated account manager", "Custom integrations", "SLA guarantee"]'::jsonb,
    NULL, -- Add your Stripe price ID
    NULL, -- Add your Stripe product ID
    'premium-tier',
    TRUE,
    2
  ),
  (
    'basic',
    'Basic Tier',
    'Essential AI visibility metrics for small dealerships',
    0.00,
    'USD',
    'monthly',
    'subscription',
    '["1 analysis per month", "Basic reports", "Community support"]'::jsonb,
    NULL,
    NULL,
    'basic-tier',
    FALSE,
    0
  )
ON CONFLICT (product_id) DO NOTHING;

-- Row-level security (RLS) policies
ALTER TABLE acp_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON acp_checkout_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id::text OR buyer_email = auth.email());

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: Anyone can view available products
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT
  USING (is_available = TRUE AND archived_at IS NULL);

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON conversation_messages
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Grant permissions to service role (for backend API)
GRANT ALL ON acp_checkout_sessions TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON products TO service_role;
GRANT ALL ON product_variants TO service_role;
GRANT ALL ON conversation_messages TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE acp_checkout_sessions IS 'Stores ACP checkout session data with buyer info, items, and payment status';
COMMENT ON TABLE orders IS 'Completed orders with fulfillment tracking';
COMMENT ON TABLE products IS 'Product catalog for conversational commerce';
COMMENT ON TABLE conversation_messages IS 'Conversational commerce chat history';

-- Create a view for active sessions
CREATE OR REPLACE VIEW active_checkout_sessions AS
SELECT
  session_id,
  user_id,
  buyer_email,
  total_amount,
  currency,
  status,
  created_at,
  expires_at,
  (expires_at - NOW()) AS time_remaining
FROM acp_checkout_sessions
WHERE status IN ('pending', 'updated')
  AND expires_at > NOW()
ORDER BY created_at DESC;

COMMENT ON VIEW active_checkout_sessions IS 'Active (non-expired) checkout sessions';
