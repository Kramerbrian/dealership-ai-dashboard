-- 0003_secondary_metrics_add_sis_adi.sql
-- Adds Silo Integrity Score (SIS) and Authority Depth Index (ADI), both 0..1.

DO $$ BEGIN
  ALTER TABLE secondary_metrics ADD COLUMN sis numeric(5,4);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE secondary_metrics
    ADD CONSTRAINT secondary_metrics_sis_range CHECK (sis IS NULL OR (sis >= 0 AND sis <= 1)) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE secondary_metrics VALIDATE CONSTRAINT secondary_metrics_sis_range;

COMMENT ON COLUMN secondary_metrics.sis IS 'Silo Integrity Score (0..1) — physical/virtual silo coherence, low leakage.';

DO $$ BEGIN
  ALTER TABLE secondary_metrics ADD COLUMN adi numeric(5,4);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE secondary_metrics
    ADD CONSTRAINT secondary_metrics_adi_range CHECK (adi IS NULL OR (adi >= 0 AND adi <= 1)) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE secondary_metrics VALIDATE CONSTRAINT secondary_metrics_adi_range;

COMMENT ON COLUMN secondary_metrics.adi IS 'Authority Depth Index (0..1) — cluster coverage, first-party evidence, E-E-A-T.';
