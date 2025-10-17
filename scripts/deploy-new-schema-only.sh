#!/bin/bash

# DealershipAI New Schema Deployment Script
# This script deploys only the new schema components without affecting existing tables

set -e  # Exit on any error

echo "🚀 DealershipAI New Schema Deployment"
echo "====================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run 'supabase login' first."
    exit 1
fi

echo "✅ Logged in to Supabase"

# Get current project info
PROJECT_REF=$(supabase status --output json | jq -r '.project_ref // empty')
if [ -z "$PROJECT_REF" ]; then
    echo "❌ No linked project found. Please run 'supabase link' first."
    exit 1
fi

echo "✅ Project linked: $PROJECT_REF"

# Create a temporary migration file with only new components
TEMP_MIGRATION="supabase/migrations/$(date +%Y%m%d%H%M%S)_dealership_ai_new_components.sql"

cat > "$TEMP_MIGRATION" << 'EOF'
-- DealershipAI New Components Migration
-- This migration adds only new components without affecting existing tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- FEE TAXONOMY FOR OFFER INTEGRITY AUDITING (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fee_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  label text NOT NULL,
  disclosure_required boolean DEFAULT true,
  allowed_on_new boolean DEFAULT true,
  allowed_on_used boolean DEFAULT true,
  max_usd numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Insert standard fee taxonomy
INSERT INTO fee_taxonomy (code, label, disclosure_required, allowed_on_new, allowed_on_used, max_usd) VALUES
('DOC_FEE', 'Document Fee', true, true, true, 999),
('DEST', 'Destination', true, true, false, 3995),
('ADM', 'Additional Dealer Markup', true, true, true, NULL),
('ETCH', 'VIN Etch', true, true, true, 699),
('NITRO', 'Nitrogen', true, true, true, 399),
('ACCESSORY', 'Dealer Accessories', true, true, true, NULL),
('TAX', 'Sales Tax', true, true, true, NULL),
('TITLE', 'Title & Registration', true, true, true, 500),
('LICENSE', 'License Fee', true, true, true, 200),
('OTHER', 'Other Fees', true, true, true, NULL)
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_fee_taxonomy_code ON fee_taxonomy(code);
ALTER TABLE fee_taxonomy ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  CREATE POLICY fee_taxonomy_select ON fee_taxonomy FOR SELECT USING (true);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- OFFER INTEGRITY AUDITS (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS offer_integrity_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vin text,
  vdp_url text,
  engine text,
  advertised_price numeric(12,2),
  engine_price numeric(12,2),
  otd_price_engine numeric(12,2),
  delta_price numeric(12,2),
  undisclosed_fees jsonb,
  severity int,
  rule text,
  details jsonb,
  status text DEFAULT 'open',
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_integrity_tenant ON offer_integrity_audits(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_vin ON offer_integrity_audits(vin);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_severity ON offer_integrity_audits(severity, status);
CREATE INDEX IF NOT EXISTS idx_offer_integrity_engine ON offer_integrity_audits(engine);

ALTER TABLE offer_integrity_audits ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  CREATE POLICY offer_integrity_tenant_select ON offer_integrity_audits 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY offer_integrity_tenant_insert ON offer_integrity_audits 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY offer_integrity_tenant_update ON offer_integrity_audits 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- SEO METRICS & A/B TESTING TABLES (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_variant_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  product_id text NOT NULL,
  variant_id text NOT NULL,
  as_of timestamptz NOT NULL,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  conversions bigint DEFAULT 0,
  revenue numeric(12,2),
  dwell_time_seconds integer,
  bounce_rate numeric(5,4),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_variant_priors (
  variant_id text PRIMARY KEY,
  tenant_id uuid NOT NULL,
  a numeric NOT NULL DEFAULT 1,
  b numeric NOT NULL DEFAULT 1,
  total_impressions bigint DEFAULT 0,
  total_clicks bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_content_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  product_id text NOT NULL,
  variant_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  meta_description text,
  bullet_points jsonb,
  keywords text[],
  tone text,
  ati_score numeric(5,2),
  clarity_score numeric(5,2),
  conversion_score numeric(5,2),
  seo_score numeric(5,2),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_performance_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  variant_id text NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric(12,2),
  date_measured date NOT NULL,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_keyword_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  keyword text NOT NULL,
  variant_id text,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  avg_position numeric(5,2),
  ctr numeric(5,4),
  date_measured date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for SEO tables
CREATE INDEX IF NOT EXISTS idx_seo_variant_metrics_tenant ON seo_variant_metrics(tenant_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_seo_variant_metrics_variant ON seo_variant_metrics(variant_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_seo_variant_priors_tenant ON seo_variant_priors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_variants_tenant ON seo_content_variants(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_variants_variant ON seo_content_variants(variant_id);
CREATE INDEX IF NOT EXISTS idx_seo_performance_analytics_tenant ON seo_performance_analytics(tenant_id, date_measured DESC);
CREATE INDEX IF NOT EXISTS idx_seo_performance_analytics_variant ON seo_performance_analytics(variant_id, date_measured DESC);
CREATE INDEX IF NOT EXISTS idx_seo_keyword_performance_tenant ON seo_keyword_performance(tenant_id, keyword, date_measured DESC);

-- Enable RLS for SEO tables
ALTER TABLE seo_variant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_variant_priors ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keyword_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for SEO tables
DO $$ 
BEGIN
  CREATE POLICY seo_variant_metrics_tenant_select ON seo_variant_metrics 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_variant_metrics_tenant_insert ON seo_variant_metrics 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_variant_metrics_tenant_update ON seo_variant_metrics 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY seo_variant_priors_tenant_select ON seo_variant_priors 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_variant_priors_tenant_insert ON seo_variant_priors 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_variant_priors_tenant_update ON seo_variant_priors 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY seo_content_variants_tenant_select ON seo_content_variants 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_content_variants_tenant_insert ON seo_content_variants 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_content_variants_tenant_update ON seo_content_variants 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY seo_performance_analytics_tenant_select ON seo_performance_analytics 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_performance_analytics_tenant_insert ON seo_performance_analytics 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_performance_analytics_tenant_update ON seo_performance_analytics 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY seo_keyword_performance_tenant_select ON seo_keyword_performance 
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_keyword_performance_tenant_insert ON seo_keyword_performance 
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
  CREATE POLICY seo_keyword_performance_tenant_update ON seo_keyword_performance 
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- UTILITY FUNCTIONS (NEW)
-- ============================================================================

-- Create updated_at trigger function
DO $$ 
BEGIN
  CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$ 
  BEGIN 
    NEW.updated_at = now(); 
    RETURN NEW; 
  END; 
  $$ LANGUAGE plpgsql;
END $$;

-- Create triggers for updated_at
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS trg_offer_integrity_updated_at ON offer_integrity_audits;
  CREATE TRIGGER trg_offer_integrity_updated_at 
    BEFORE UPDATE ON offer_integrity_audits 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS trg_seo_content_variants_updated_at ON seo_content_variants;
  CREATE TRIGGER trg_seo_content_variants_updated_at 
    BEFORE UPDATE ON seo_content_variants 
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Create function to update variant priors
CREATE OR REPLACE FUNCTION update_variant_prior(
  p_variant_id text,
  p_tenant_id uuid,
  p_success bigint,
  p_failure bigint
) RETURNS void AS $$
BEGIN
  INSERT INTO seo_variant_priors (variant_id, tenant_id, a, b, total_impressions, total_clicks, updated_at)
  VALUES (p_variant_id, p_tenant_id, 1 + p_success, 1 + p_failure, p_success + p_failure, p_success, now())
  ON CONFLICT (variant_id) 
  DO UPDATE SET 
    a = seo_variant_priors.a + p_success,
    b = seo_variant_priors.b + p_failure,
    total_impressions = seo_variant_priors.total_impressions + p_success + p_failure,
    total_clicks = seo_variant_priors.total_clicks + p_success,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create function to get best performing variant
CREATE OR REPLACE FUNCTION get_best_variant(
  p_tenant_id uuid,
  p_product_id text
) RETURNS TABLE (
  variant_id text,
  title text,
  description text,
  ati_score numeric,
  clarity_score numeric,
  conversion_score numeric,
  seo_score numeric,
  avg_ctr numeric,
  total_impressions bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cv.variant_id,
    cv.title,
    cv.description,
    cv.ati_score,
    cv.clarity_score,
    cv.conversion_score,
    cv.seo_score,
    CASE 
      WHEN svm.impressions > 0 THEN (svm.clicks::numeric / svm.impressions::numeric)
      ELSE 0
    END as avg_ctr,
    COALESCE(svm.impressions, 0) as total_impressions
  FROM seo_content_variants cv
  LEFT JOIN (
    SELECT 
      variant_id,
      SUM(impressions) as impressions,
      SUM(clicks) as clicks
    FROM seo_variant_metrics
    WHERE tenant_id = p_tenant_id
    GROUP BY variant_id
  ) svm ON cv.variant_id = svm.variant_id
  WHERE cv.tenant_id = p_tenant_id 
    AND cv.product_id = p_product_id
    AND cv.status = 'active'
  ORDER BY 
    (cv.ati_score + cv.clarity_score + cv.conversion_score + cv.seo_score) / 4 DESC,
    avg_ctr DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample offer integrity audits for testing
INSERT INTO offer_integrity_audits (
  tenant_id, vin, vdp_url, engine, advertised_price, engine_price, 
  otd_price_engine, delta_price, undisclosed_fees, severity, rule, details
) VALUES 
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '1HGBH41JXMN109186',
  'https://example.com/vehicle/1HGBH41JXMN109186',
  'chatgpt',
  25000.00,
  26250.00,
  27500.00,
  1250.00,
  '[{"code": "DOC_FEE", "label": "Document Fee", "est_usd": 500}]',
  3,
  'PRICE_DELTA',
  '{"feesEngine": [{"code": "DOC_FEE", "usd": 500}]}'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '1FTFW1ET5DFC12345',
  'https://example.com/vehicle/1FTFW1ET5DFC12345',
  'gemini',
  18000.00,
  18000.00,
  18500.00,
  0.00,
  '[{"code": "ETCH", "label": "VIN Etch", "est_usd": 800}]',
  2,
  'UNDISCLOSED_FEE',
  '{"feesEngine": [{"code": "ETCH", "usd": 800}]}'
)
ON CONFLICT DO NOTHING;

-- Insert sample SEO variant priors for testing
INSERT INTO seo_variant_priors (variant_id, tenant_id, a, b, total_impressions, total_clicks) VALUES
('variant-1', '00000000-0000-0000-0000-000000000001'::uuid, 15, 5, 20, 15),
('variant-2', '00000000-0000-0000-0000-000000000001'::uuid, 8, 12, 20, 8),
('variant-3', '00000000-0000-0000-0000-000000000001'::uuid, 12, 8, 20, 12)
ON CONFLICT (variant_id) DO NOTHING;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'DealershipAI new components migration completed successfully!';
  RAISE NOTICE 'New tables created: fee_taxonomy, offer_integrity_audits, seo_variant_metrics, seo_variant_priors, seo_content_variants, seo_performance_analytics, seo_keyword_performance';
  RAISE NOTICE 'New functions created: update_variant_prior, get_best_variant, set_updated_at';
  RAISE NOTICE 'RLS policies enabled for all new tables';
  RAISE NOTICE 'Sample data inserted for testing';
END $$;
EOF

echo "✅ Created temporary migration file: $TEMP_MIGRATION"

# Apply the migration
echo ""
echo "📦 Applying new schema components..."
echo "This may take a few minutes..."

if supabase db push; then
    echo ""
    echo "✅ New schema components deployed successfully!"
    echo ""
    echo "📊 What was deployed:"
    echo "   • Fee taxonomy table with standard fee types"
    echo "   • Offer integrity audits table for pricing compliance"
    echo "   • SEO variant metrics and A/B testing tables"
    echo "   • SEO content variants and performance analytics"
    echo "   • SEO keyword performance tracking"
    echo "   • Row Level Security (RLS) policies for multi-tenant access"
    echo "   • Utility functions for data processing"
    echo "   • Sample data for testing"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Verify new tables in Supabase Dashboard"
    echo "   2. Test API endpoints with sample data"
    echo "   3. Configure tenant settings for your organization"
    echo ""
    echo "🌐 Access your database:"
    echo "   Dashboard: https://supabase.com/dashboard/project/$PROJECT_REF"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    echo ""
    exit 1
fi

# Clean up temporary file
rm -f "$TEMP_MIGRATION"
echo "🧹 Cleaned up temporary migration file"

echo ""
echo "🎉 DealershipAI new schema deployment complete!"
echo "Your database now has the new SEO and compliance components."
