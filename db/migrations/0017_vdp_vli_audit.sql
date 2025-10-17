-- VDP VLI Audit Table
-- DealershipAI - Per-VDP Vehicle Listing Integrity Tracking
-- Migration: 0017_vdp_vli_audit.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- VDP VLI Audit table
CREATE TABLE IF NOT EXISTS vdp_vli_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vdp_id text NOT NULL,
  url text NOT NULL,
  as_of timestamptz NOT NULL DEFAULT now(),
  -- Photo metrics
  photos int NOT NULL DEFAULT 0,
  first_image_ok boolean NOT NULL DEFAULT false,
  -- Content integrity
  has_vin boolean NOT NULL DEFAULT false,
  price_parity_ok boolean NOT NULL DEFAULT false,
  mileage_ok boolean NOT NULL DEFAULT false,
  -- Schema markup
  schema_vehicle_ok boolean NOT NULL DEFAULT false,
  schema_offer_ok boolean NOT NULL DEFAULT false,
  -- Issues and scoring
  issues jsonb NOT NULL DEFAULT '[]',               -- [{id:'photos', severity:1, msg:'Add more photos'}]
  vli_multiplier numeric(6,4) NOT NULL DEFAULT 1.0000, -- ≥1.00
  integrity_pct numeric(5,2) NOT NULL DEFAULT 0.00,  -- 0..100
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Constraints
  CONSTRAINT unique_tenant_vdp_as_of UNIQUE (tenant_id, vdp_id, as_of),
  CONSTRAINT vli_multiplier_check CHECK (vli_multiplier >= 1.0000),
  CONSTRAINT integrity_pct_check CHECK (integrity_pct >= 0.00 AND integrity_pct <= 100.00)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vdp_vli_tenant_vdp ON vdp_vli_audit(tenant_id, vdp_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_vdp_vli_tenant_integrity ON vdp_vli_audit(tenant_id, integrity_pct ASC);
CREATE INDEX IF NOT EXISTS idx_vdp_vli_tenant_as_of ON vdp_vli_audit(tenant_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_vdp_vli_vdp_id ON vdp_vli_audit(vdp_id);
CREATE INDEX IF NOT EXISTS idx_vdp_vli_integrity_low ON vdp_vli_audit(tenant_id, integrity_pct ASC) WHERE integrity_pct < 70.00;

-- Row Level Security (RLS)
ALTER TABLE vdp_vli_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY vdp_vli_audit_select ON vdp_vli_audit
    FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY vdp_vli_audit_insert ON vdp_vli_audit
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY vdp_vli_audit_update ON vdp_vli_audit
    FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Utility Functions

-- Function to get latest VLI audit for a VDP
CREATE OR REPLACE FUNCTION get_latest_vli_audit(p_tenant_id uuid, p_vdp_id text)
RETURNS TABLE (
  id uuid,
  vdp_id text,
  url text,
  as_of timestamptz,
  photos int,
  first_image_ok boolean,
  has_vin boolean,
  price_parity_ok boolean,
  mileage_ok boolean,
  schema_vehicle_ok boolean,
  schema_offer_ok boolean,
  issues jsonb,
  vli_multiplier numeric,
  integrity_pct numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    va.id, va.vdp_id, va.url, va.as_of, va.photos, va.first_image_ok,
    va.has_vin, va.price_parity_ok, va.mileage_ok, va.schema_vehicle_ok,
    va.schema_offer_ok, va.issues, va.vli_multiplier, va.integrity_pct
  FROM vdp_vli_audit va
  WHERE va.tenant_id = p_tenant_id
    AND va.vdp_id = p_vdp_id
  ORDER BY va.as_of DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get top N worst VDPs by integrity
CREATE OR REPLACE FUNCTION get_worst_vdp_integrity(p_tenant_id uuid, p_limit int DEFAULT 10)
RETURNS TABLE (
  vdp_id text,
  url text,
  integrity_pct numeric,
  issues jsonb,
  as_of timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH latest AS (
    SELECT DISTINCT ON (va.vdp_id) 
      va.vdp_id, va.url, va.integrity_pct, va.issues, va.as_of
    FROM vdp_vli_audit va
    WHERE va.tenant_id = p_tenant_id
    ORDER BY va.vdp_id, va.as_of DESC
  )
  SELECT l.vdp_id, l.url, l.integrity_pct, l.issues, l.as_of
  FROM latest l
  ORDER BY l.integrity_pct ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate VLI multiplier from audit data
CREATE OR REPLACE FUNCTION calculate_vli_multiplier(
  p_photos int,
  p_first_image_ok boolean,
  p_has_vin boolean,
  p_price_parity_ok boolean,
  p_mileage_ok boolean,
  p_schema_vehicle_ok boolean,
  p_schema_offer_ok boolean
) RETURNS numeric AS $$
DECLARE
  multiplier numeric := 1.0000;
BEGIN
  -- Photo penalties
  IF p_photos < 5 THEN
    multiplier := multiplier * (1.0 + (5 - p_photos) * 0.1);
  END IF;
  
  IF NOT p_first_image_ok THEN
    multiplier := multiplier * 1.2;
  END IF;
  
  -- Content penalties
  IF NOT p_has_vin THEN
    multiplier := multiplier * 1.15;
  END IF;
  
  IF NOT p_price_parity_ok THEN
    multiplier := multiplier * 1.25;
  END IF;
  
  IF NOT p_mileage_ok THEN
    multiplier := multiplier * 1.1;
  END IF;
  
  -- Schema penalties
  IF NOT p_schema_vehicle_ok THEN
    multiplier := multiplier * 1.3;
  END IF;
  
  IF NOT p_schema_offer_ok THEN
    multiplier := multiplier * 1.2;
  END IF;
  
  RETURN ROUND(multiplier, 4);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate integrity percentage
CREATE OR REPLACE FUNCTION calculate_integrity_pct(
  p_photos int,
  p_first_image_ok boolean,
  p_has_vin boolean,
  p_price_parity_ok boolean,
  p_mileage_ok boolean,
  p_schema_vehicle_ok boolean,
  p_schema_offer_ok boolean
) RETURNS numeric AS $$
DECLARE
  score numeric := 0;
  max_score numeric := 7;
BEGIN
  -- Photo scoring (0-2 points)
  IF p_photos >= 10 THEN
    score := score + 2;
  ELSIF p_photos >= 5 THEN
    score := score + 1;
  END IF;
  
  IF p_first_image_ok THEN
    score := score + 1;
  END IF;
  
  -- Content scoring (1 point each)
  IF p_has_vin THEN
    score := score + 1;
  END IF;
  
  IF p_price_parity_ok THEN
    score := score + 1;
  END IF;
  
  IF p_mileage_ok THEN
    score := score + 1;
  END IF;
  
  -- Schema scoring (1 point each)
  IF p_schema_vehicle_ok THEN
    score := score + 1;
  END IF;
  
  IF p_schema_offer_ok THEN
    score := score + 1;
  END IF;
  
  RETURN ROUND((score / max_score) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (optional)
INSERT INTO vdp_vli_audit (
  tenant_id, vdp_id, url, photos, first_image_ok, has_vin, price_parity_ok,
  mileage_ok, schema_vehicle_ok, schema_offer_ok, issues, vli_multiplier, integrity_pct
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'VDP-001',
  'https://example.com/vehicles/2023-honda-civic',
  8,
  true,
  true,
  true,
  true,
  true,
  false,
  '[{"id":"schema_offer","severity":2,"msg":"Add Offer schema markup"}]',
  1.2000,
  85.71
), (
  '00000000-0000-0000-0000-000000000001',
  'VDP-002',
  'https://example.com/vehicles/2022-toyota-camry',
  3,
  false,
  true,
  false,
  true,
  false,
  false,
  '[{"id":"photos","severity":3,"msg":"Add more photos (minimum 5)"},{"id":"first_image","severity":2,"msg":"Fix first image quality"},{"id":"price_parity","severity":2,"msg":"Fix price parity"},{"id":"schema_vehicle","severity":2,"msg":"Add Vehicle schema markup"},{"id":"schema_offer","severity":2,"msg":"Add Offer schema markup"}]',
  2.1000,
  42.86
) ON CONFLICT (tenant_id, vdp_id, as_of) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE vdp_vli_audit IS 'Per-VDP Vehicle Listing Integrity audit data';
COMMENT ON COLUMN vdp_vli_audit.vli_multiplier IS 'VLI penalty multiplier (≥1.0, higher = worse)';
COMMENT ON COLUMN vdp_vli_audit.integrity_pct IS 'Integrity percentage score (0-100)';
COMMENT ON COLUMN vdp_vli_audit.issues IS 'JSON array of identified issues with severity and messages';
