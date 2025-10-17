-- Inventory Truth Index™ tracking schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Inventory truth tracking table
CREATE TABLE IF NOT EXISTS inventory_truth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vehicle_id varchar(50) NOT NULL,
  vin varchar(17),
  make varchar(50),
  model varchar(100),
  year integer,
  mileage integer,
  price numeric(10,2),
  condition_grade varchar(20),
  location varchar(100),
  
  -- Truth metrics
  listing_accuracy numeric(5,4) DEFAULT 0, -- 0-1 score
  photo_quality numeric(5,4) DEFAULT 0,    -- 0-1 score
  description_completeness numeric(5,4) DEFAULT 0, -- 0-1 score
  price_consistency numeric(5,4) DEFAULT 0, -- 0-1 score
  availability_accuracy numeric(5,4) DEFAULT 0, -- 0-1 score
  
  -- Composite ITI score
  iti_score numeric(5,4) DEFAULT 0, -- 0-1 overall score
  
  -- Metadata
  source_system varchar(50),
  last_verified timestamptz,
  verification_method varchar(50),
  confidence_level numeric(3,2) DEFAULT 0.5, -- 0-1 confidence
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, vehicle_id)
);

-- Inventory truth history for tracking changes
CREATE TABLE IF NOT EXISTS inventory_truth_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_truth_id uuid REFERENCES inventory_truth(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  
  -- Previous values
  previous_iti_score numeric(5,4),
  previous_listing_accuracy numeric(5,4),
  previous_photo_quality numeric(5,4),
  previous_description_completeness numeric(5,4),
  previous_price_consistency numeric(5,4),
  previous_availability_accuracy numeric(5,4),
  
  -- Change tracking
  change_type varchar(20), -- 'update', 'delete', 'create'
  change_reason varchar(100),
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory truth summary for dashboard
CREATE TABLE IF NOT EXISTS inventory_truth_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date_week date NOT NULL,
  
  -- Aggregate metrics
  total_listings integer DEFAULT 0,
  avg_iti_score numeric(5,4) DEFAULT 0,
  avg_listing_accuracy numeric(5,4) DEFAULT 0,
  avg_photo_quality numeric(5,4) DEFAULT 0,
  avg_description_completeness numeric(5,4) DEFAULT 0,
  avg_price_consistency numeric(5,4) DEFAULT 0,
  avg_availability_accuracy numeric(5,4) DEFAULT 0,
  
  -- Quality distribution
  high_quality_count integer DEFAULT 0, -- ITI > 0.8
  medium_quality_count integer DEFAULT 0, -- ITI 0.5-0.8
  low_quality_count integer DEFAULT 0, -- ITI < 0.5
  
  -- Issues tracking
  missing_photos_count integer DEFAULT 0,
  incomplete_descriptions_count integer DEFAULT 0,
  price_discrepancies_count integer DEFAULT 0,
  availability_issues_count integer DEFAULT 0,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, date_week)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_truth_tenant ON inventory_truth(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_truth_iti_score ON inventory_truth(iti_score);
CREATE INDEX IF NOT EXISTS idx_inventory_truth_updated ON inventory_truth(updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_truth_history_tenant ON inventory_truth_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_truth_summary_tenant_week ON inventory_truth_summary(tenant_id, date_week);

-- Row Level Security
ALTER TABLE inventory_truth ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_truth_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_truth_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY inventory_truth_tenant_select ON inventory_truth FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY inventory_truth_tenant_insert ON inventory_truth FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY inventory_truth_tenant_update ON inventory_truth FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY inventory_truth_history_tenant_select ON inventory_truth_history FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY inventory_truth_summary_tenant_select ON inventory_truth_summary FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY inventory_truth_summary_tenant_insert ON inventory_truth_summary FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY inventory_truth_summary_tenant_update ON inventory_truth_summary FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
END $$;

-- Update triggers
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_inventory_truth_updated_at ON inventory_truth;
  CREATE TRIGGER trg_inventory_truth_updated_at
    BEFORE UPDATE ON inventory_truth
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_inventory_truth_summary_updated_at ON inventory_truth_summary;
  CREATE TRIGGER trg_inventory_truth_summary_updated_at
    BEFORE UPDATE ON inventory_truth_summary
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
END $$;

-- Function to calculate ITI score
CREATE OR REPLACE FUNCTION calculate_iti_score(
  listing_accuracy numeric,
  photo_quality numeric,
  description_completeness numeric,
  price_consistency numeric,
  availability_accuracy numeric
) RETURNS numeric AS $$
BEGIN
  RETURN (
    (listing_accuracy * 0.25) +
    (photo_quality * 0.20) +
    (description_completeness * 0.20) +
    (price_consistency * 0.20) +
    (availability_accuracy * 0.15)
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate ITI score
CREATE OR REPLACE FUNCTION update_iti_score() RETURNS trigger AS $$
BEGIN
  NEW.iti_score = calculate_iti_score(
    NEW.listing_accuracy,
    NEW.photo_quality,
    NEW.description_completeness,
    NEW.price_consistency,
    NEW.availability_accuracy
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_update_iti_score ON inventory_truth;
  CREATE TRIGGER trg_update_iti_score
    BEFORE INSERT OR UPDATE ON inventory_truth
    FOR EACH ROW
    EXECUTE FUNCTION update_iti_score();
END $$;
