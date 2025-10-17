-- SEO Metrics & A/B Testing Tables
-- DealershipAI - Advanced Product Description Optimization

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SEO Variant Metrics Table
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

-- SEO Variant Priors for Thompson Sampling
CREATE TABLE IF NOT EXISTS seo_variant_priors (
  variant_id text PRIMARY KEY,
  tenant_id uuid NOT NULL,
  a numeric NOT NULL DEFAULT 1,
  b numeric NOT NULL DEFAULT 1,
  total_impressions bigint DEFAULT 0,
  total_clicks bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- SEO Content Variants
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
  status text DEFAULT 'active', -- active, paused, archived
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SEO Performance Analytics
CREATE TABLE IF NOT EXISTS seo_performance_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  variant_id text NOT NULL,
  metric_type text NOT NULL, -- impressions, clicks, conversions, revenue
  metric_value numeric(12,2),
  date_measured date NOT NULL,
  source text, -- organic, paid, social, direct
  created_at timestamptz DEFAULT now()
);

-- SEO Keyword Performance
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_variant_metrics_tenant ON seo_variant_metrics(tenant_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_seo_variant_metrics_variant ON seo_variant_metrics(variant_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_seo_variant_priors_tenant ON seo_variant_priors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_variants_tenant ON seo_content_variants(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_seo_content_variants_variant ON seo_content_variants(variant_id);
CREATE INDEX IF NOT EXISTS idx_seo_performance_analytics_tenant ON seo_performance_analytics(tenant_id, date_measured DESC);
CREATE INDEX IF NOT EXISTS idx_seo_performance_analytics_variant ON seo_performance_analytics(variant_id, date_measured DESC);
CREATE INDEX IF NOT EXISTS idx_seo_keyword_performance_tenant ON seo_keyword_performance(tenant_id, keyword, date_measured DESC);

-- Enable RLS
ALTER TABLE seo_variant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_variant_priors ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keyword_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- seo_variant_metrics policies
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
  -- seo_variant_priors policies
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
  -- seo_content_variants policies
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
  -- seo_performance_analytics policies
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
  -- seo_keyword_performance policies
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
