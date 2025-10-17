-- 0002_secondary_metrics_add_scs.sql
-- Adds Semantic Clarity Score (SCS) 0..1 with range check and comment.

DO $$ BEGIN
  ALTER TABLE secondary_metrics ADD COLUMN scs numeric(5,4);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE secondary_metrics
    ADD CONSTRAINT secondary_metrics_scs_range CHECK (scs IS NULL OR (scs >= 0 AND scs <= 1)) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE secondary_metrics VALIDATE CONSTRAINT secondary_metrics_scs_range;

COMMENT ON COLUMN secondary_metrics.scs IS 'Semantic Clarity Score (0..1) — RankEmbed alignment proxy: disambiguation, extractability, low ambiguity.';