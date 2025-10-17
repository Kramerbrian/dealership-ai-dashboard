-- Inventory Truth Index (™) - VIN Integrity Analyst System
-- Migration: 20250115000019_inventory_truth_index.sql

-- VIN-level integrity tracking
CREATE TABLE IF NOT EXISTS vin_integrity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  vin TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- 'spec_accuracy', 'price_freshness', 'photo_completeness', 'schema_validity', 'inventory_latency', 'discrepancy_rate'
  score DECIMAL(5,2) NOT NULL, -- 0-100
  confidence DECIMAL(3,2) DEFAULT 0.9, -- 0-1
  details JSONB, -- additional context and metadata
  source_system TEXT, -- 'dms', 'website', 'syndication', 'oem', 'manual'
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  as_of TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIN master data for cross-referencing
CREATE TABLE IF NOT EXISTS vin_master_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  vin TEXT NOT NULL,
  year INTEGER,
  make TEXT,
  model TEXT,
  trim TEXT,
  body_style TEXT,
  engine TEXT,
  transmission TEXT,
  drivetrain TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  mileage INTEGER,
  price DECIMAL(12,2),
  msrp DECIMAL(12,2),
  condition TEXT, -- 'new', 'used', 'certified'
  status TEXT, -- 'available', 'sold', 'pending', 'in_transit'
  lot_date DATE,
  web_published_at TIMESTAMP WITH TIME ZONE,
  last_price_update TIMESTAMP WITH TIME ZONE,
  photo_count INTEGER DEFAULT 0,
  has_schema_markup BOOLEAN DEFAULT FALSE,
  schema_valid BOOLEAN DEFAULT FALSE,
  oem_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-platform discrepancy tracking
CREATE TABLE IF NOT EXISTS vin_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  vin TEXT NOT NULL,
  platform_a TEXT NOT NULL, -- 'website', 'autotrader', 'cars', 'cargurus', 'dms'
  platform_b TEXT NOT NULL,
  field_name TEXT NOT NULL, -- 'price', 'mileage', 'color', 'features', 'photos'
  value_a TEXT,
  value_b TEXT,
  discrepancy_type TEXT, -- 'missing', 'mismatch', 'stale', 'invalid'
  severity INTEGER DEFAULT 1, -- 1=low, 2=med, 3=high
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo completeness tracking
CREATE TABLE IF NOT EXISTS vin_photo_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  vin TEXT NOT NULL,
  total_photos INTEGER DEFAULT 0,
  exterior_photos INTEGER DEFAULT 0,
  interior_photos INTEGER DEFAULT 0,
  engine_photos INTEGER DEFAULT 0,
  undercarriage_photos INTEGER DEFAULT 0,
  damage_photos INTEGER DEFAULT 0,
  stock_photos INTEGER DEFAULT 0, -- should be 0 for used vehicles
  photo_quality_score DECIMAL(3,2), -- 0-1 based on resolution, lighting, angles
  missing_angles TEXT[], -- ['front', 'rear', 'side', 'interior', 'engine']
  target_photo_count INTEGER DEFAULT 20, -- configurable per dealer
  completeness_score DECIMAL(5,2), -- 0-100
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schema markup validation
CREATE TABLE IF NOT EXISTS vin_schema_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  vin TEXT NOT NULL,
  url TEXT,
  schema_type TEXT, -- 'Vehicle', 'Car', 'AutoDealer'
  has_required_fields BOOLEAN DEFAULT FALSE,
  has_price_schema BOOLEAN DEFAULT FALSE,
  has_condition_schema BOOLEAN DEFAULT FALSE,
  has_mileage_schema BOOLEAN DEFAULT FALSE,
  has_photos_schema BOOLEAN DEFAULT FALSE,
  has_contact_schema BOOLEAN DEFAULT FALSE,
  validation_errors JSONB, -- array of validation errors
  schema_score DECIMAL(5,2), -- 0-100
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ITI aggregated scores
CREATE TABLE IF NOT EXISTS inventory_truth_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  vin_count INTEGER DEFAULT 0,
  iti_score DECIMAL(5,2) NOT NULL, -- 0-100
  spec_accuracy_score DECIMAL(5,2),
  price_freshness_score DECIMAL(5,2),
  photo_completeness_score DECIMAL(5,2),
  schema_validity_score DECIMAL(5,2),
  inventory_latency_score DECIMAL(5,2),
  discrepancy_rate DECIMAL(5,2),
  temporal_weight DECIMAL(3,2) DEFAULT 1.0,
  verification_confidence DECIMAL(3,2) DEFAULT 0.9,
  revenue_impact_estimate DECIMAL(12,2), -- estimated $ impact
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vin_integrity_tenant_vin ON vin_integrity_signals(tenant_id, vin, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_vin_integrity_signal_type ON vin_integrity_signals(signal_type, score);
CREATE INDEX IF NOT EXISTS idx_vin_master_tenant_vin ON vin_master_data(tenant_id, vin);
CREATE INDEX IF NOT EXISTS idx_vin_master_status ON vin_master_data(status, condition);
CREATE INDEX IF NOT EXISTS idx_vin_discrepancies_tenant ON vin_discrepancies(tenant_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_vin_discrepancies_vin ON vin_discrepancies(vin, severity);
CREATE INDEX IF NOT EXISTS idx_vin_photo_tenant_vin ON vin_photo_analysis(tenant_id, vin);
CREATE INDEX IF NOT EXISTS idx_vin_schema_tenant_vin ON vin_schema_validation(tenant_id, vin);
CREATE INDEX IF NOT EXISTS idx_inventory_truth_tenant ON inventory_truth_scores(tenant_id, period_start DESC);

-- Add RLS policies
ALTER TABLE vin_integrity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vin_master_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vin_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vin_photo_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE vin_schema_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_truth_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY vin_integrity_tenant_sel ON vin_integrity_signals
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_integrity_tenant_ins ON vin_integrity_signals
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_master_tenant_sel ON vin_master_data
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_master_tenant_ins ON vin_master_data
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_master_tenant_upd ON vin_master_data
  FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_discrepancies_tenant_sel ON vin_discrepancies
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_discrepancies_tenant_ins ON vin_discrepancies
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_photo_tenant_sel ON vin_photo_analysis
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_photo_tenant_ins ON vin_photo_analysis
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_schema_tenant_sel ON vin_schema_validation
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY vin_schema_tenant_ins ON vin_schema_validation
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY inventory_truth_tenant_sel ON inventory_truth_scores
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY inventory_truth_tenant_ins ON inventory_truth_scores
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- Function to calculate ITI score for a VIN
CREATE OR REPLACE FUNCTION calculate_vin_iti(
  p_tenant_id UUID,
  p_vin TEXT,
  p_dealership_id UUID DEFAULT NULL
)
RETURNS TABLE(
  vin TEXT,
  iti_score DECIMAL(5,2),
  spec_accuracy DECIMAL(5,2),
  price_freshness DECIMAL(5,2),
  photo_completeness DECIMAL(5,2),
  schema_validity DECIMAL(5,2),
  inventory_latency DECIMAL(5,2),
  discrepancy_rate DECIMAL(5,2),
  temporal_weight DECIMAL(3,2),
  verification_confidence DECIMAL(3,2),
  breakdown JSONB
) AS $$
DECLARE
  v_spec_accuracy DECIMAL(5,2) := 0;
  v_price_freshness DECIMAL(5,2) := 0;
  v_photo_completeness DECIMAL(5,2) := 0;
  v_schema_validity DECIMAL(5,2) := 0;
  v_inventory_latency DECIMAL(5,2) := 0;
  v_discrepancy_rate DECIMAL(5,2) := 0;
  v_temporal_weight DECIMAL(3,2) := 1.0;
  v_verification_confidence DECIMAL(3,2) := 0.9;
  v_iti_score DECIMAL(5,2) := 0;
BEGIN
  -- Get latest scores for each signal type
  SELECT score INTO v_spec_accuracy
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND signal_type = 'spec_accuracy'
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
  ORDER BY as_of DESC
  LIMIT 1;

  SELECT score INTO v_price_freshness
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND signal_type = 'price_freshness'
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
  ORDER BY as_of DESC
  LIMIT 1;

  SELECT score INTO v_photo_completeness
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND signal_type = 'photo_completeness'
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
  ORDER BY as_of DESC
  LIMIT 1;

  SELECT score INTO v_schema_validity
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND signal_type = 'schema_validity'
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
  ORDER BY as_of DESC
  LIMIT 1;

  SELECT score INTO v_inventory_latency
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND signal_type = 'inventory_latency'
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
  ORDER BY as_of DESC
  LIMIT 1;

  SELECT score INTO v_discrepancy_rate
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND signal_type = 'discrepancy_rate'
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
  ORDER BY as_of DESC
  LIMIT 1;

  -- Calculate temporal weight based on data freshness
  SELECT COALESCE(AVG(confidence), 0.9) INTO v_verification_confidence
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND vin = p_vin
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND as_of > NOW() - INTERVAL '7 days';

  -- Calculate ITI score using the formula
  v_iti_score := (
    COALESCE(v_spec_accuracy, 0) * 0.35 +
    COALESCE(v_price_freshness, 0) * 0.25 +
    COALESCE(v_photo_completeness, 0) * 0.15 +
    COALESCE(v_schema_validity, 0) * 0.15 +
    (100 - COALESCE(v_discrepancy_rate, 0)) * 0.10
  ) * v_temporal_weight * v_verification_confidence;

  RETURN QUERY SELECT 
    p_vin,
    v_iti_score,
    COALESCE(v_spec_accuracy, 0),
    COALESCE(v_price_freshness, 0),
    COALESCE(v_photo_completeness, 0),
    COALESCE(v_schema_validity, 0),
    COALESCE(v_inventory_latency, 0),
    COALESCE(v_discrepancy_rate, 0),
    v_temporal_weight,
    v_verification_confidence,
    jsonb_build_object(
      'weights', jsonb_build_object(
        'spec_accuracy', 0.35,
        'price_freshness', 0.25,
        'photo_completeness', 0.15,
        'schema_validity', 0.15,
        'discrepancy_rate', 0.10
      ),
      'formula', 'ITI = (SpecAcc×0.35 + PriceFresh×0.25 + PhotoComp×0.15 + SchemaValid×0.15 + (1-DiscrepRate)×0.10) × TemporalWeight × VerificationConfidence'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate dealership-level ITI
CREATE OR REPLACE FUNCTION calculate_dealership_iti(
  p_tenant_id UUID,
  p_dealership_id UUID,
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  dealership_id UUID,
  vin_count INTEGER,
  avg_iti_score DECIMAL(5,2),
  median_iti_score DECIMAL(5,2),
  iti_breakdown JSONB,
  revenue_impact_estimate DECIMAL(12,2)
) AS $$
DECLARE
  v_vin_count INTEGER := 0;
  v_avg_iti DECIMAL(5,2) := 0;
  v_median_iti DECIMAL(5,2) := 0;
  v_revenue_impact DECIMAL(12,2) := 0;
BEGIN
  -- Count VINs in period
  SELECT COUNT(DISTINCT vin) INTO v_vin_count
  FROM vin_integrity_signals
  WHERE tenant_id = p_tenant_id
    AND dealership_id = p_dealership_id
    AND as_of > NOW() - (p_period_days || ' days')::INTERVAL;

  -- Calculate average ITI
  WITH vin_scores AS (
    SELECT (calculate_vin_iti(p_tenant_id, vin, p_dealership_id)).iti_score as score
    FROM (
      SELECT DISTINCT vin
      FROM vin_integrity_signals
      WHERE tenant_id = p_tenant_id
        AND dealership_id = p_dealership_id
        AND as_of > NOW() - (p_period_days || ' days')::INTERVAL
    ) vins
  )
  SELECT AVG(score), PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score)
  INTO v_avg_iti, v_median_iti
  FROM vin_scores;

  -- Estimate revenue impact (simplified model)
  v_revenue_impact := v_vin_count * (v_avg_iti / 100) * 500; -- $500 per VIN per ITI point

  RETURN QUERY SELECT 
    p_dealership_id,
    v_vin_count,
    v_avg_iti,
    v_median_iti,
    jsonb_build_object(
      'period_days', p_period_days,
      'calculation_method', 'weighted_average',
      'revenue_model', '$500 per VIN per ITI point'
    ),
    v_revenue_impact;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON vin_integrity_signals TO authenticated;
GRANT SELECT ON vin_master_data TO authenticated;
GRANT SELECT ON vin_discrepancies TO authenticated;
GRANT SELECT ON vin_photo_analysis TO authenticated;
GRANT SELECT ON vin_schema_validation TO authenticated;
GRANT SELECT ON inventory_truth_scores TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_vin_iti TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_dealership_iti TO authenticated;
