-- Migration: Create avi_reports table for AI Visibility Dashboard
-- Description: Stores comprehensive AVI report data with full schema support

-- Create avi_reports table
CREATE TABLE IF NOT EXISTS public.avi_reports (
  -- Primary identification
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,

  -- Report metadata
  version text NOT NULL,
  as_of date NOT NULL,
  window_weeks integer NOT NULL CHECK (window_weeks BETWEEN 4 AND 16),

  -- Core metrics
  aiv_pct numeric NOT NULL CHECK (aiv_pct BETWEEN 0 AND 100),
  ati_pct numeric NOT NULL CHECK (ati_pct BETWEEN 0 AND 100),
  crs_pct numeric NOT NULL CHECK (crs_pct BETWEEN 0 AND 100),

  -- Complex metrics stored as JSONB
  elasticity jsonb NOT NULL,
  pillars jsonb NOT NULL,
  modifiers jsonb NOT NULL,
  clarity jsonb NOT NULL,
  secondary_signals jsonb,
  ci95 jsonb NOT NULL,

  -- State and analysis
  regime_state text NOT NULL CHECK (regime_state IN ('Normal', 'ShiftDetected', 'Quarantine')),
  counterfactual jsonb,
  drivers jsonb,
  anomalies jsonb,
  backlog_summary jsonb,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_avi_reports_tenant_id ON public.avi_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_avi_reports_as_of ON public.avi_reports(as_of DESC);
CREATE INDEX IF NOT EXISTS idx_avi_reports_regime_state ON public.avi_reports(regime_state);
CREATE INDEX IF NOT EXISTS idx_avi_reports_tenant_date ON public.avi_reports(tenant_id, as_of DESC);

-- Create composite index for latest report queries
CREATE INDEX IF NOT EXISTS idx_avi_reports_latest
  ON public.avi_reports(tenant_id, as_of DESC, created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_avi_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_avi_reports_updated_at ON public.avi_reports;
CREATE TRIGGER trigger_avi_reports_updated_at
  BEFORE UPDATE ON public.avi_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_avi_reports_updated_at();

-- Enable Row Level Security
ALTER TABLE public.avi_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their tenant's AVI reports
CREATE POLICY "Users can view their tenant's AVI reports"
  ON public.avi_reports
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM public.users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Policy: SuperAdmins can view all AVI reports
CREATE POLICY "SuperAdmins can view all AVI reports"
  ON public.avi_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE clerk_id = auth.jwt() ->> 'sub'
      AND role = 'superadmin'
    )
  );

-- Policy: System can insert AVI reports (service role)
CREATE POLICY "Service role can insert AVI reports"
  ON public.avi_reports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: System can update AVI reports (service role)
CREATE POLICY "Service role can update AVI reports"
  ON public.avi_reports
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE public.avi_reports IS 'Stores comprehensive AI Visibility Index reports with metrics, analysis, and recommendations';
COMMENT ON COLUMN public.avi_reports.tenant_id IS 'Reference to tenant (dealership or enterprise group)';
COMMENT ON COLUMN public.avi_reports.version IS 'Schema version (e.g., 1.3.0)';
COMMENT ON COLUMN public.avi_reports.as_of IS 'Report week start date';
COMMENT ON COLUMN public.avi_reports.window_weeks IS 'Analysis window in weeks (4-16)';
COMMENT ON COLUMN public.avi_reports.regime_state IS 'Anomaly detection state: Normal, ShiftDetected, or Quarantine';
COMMENT ON COLUMN public.avi_reports.elasticity IS 'Revenue elasticity metrics: {usdPerPoint, r2}';
COMMENT ON COLUMN public.avi_reports.pillars IS 'Five pillars scores: {seo, aeo, geo, ugc, geoLocal}';
COMMENT ON COLUMN public.avi_reports.modifiers IS 'Performance modifiers: {temporalWeight, entityConfidence, crawlBudgetMult, inventoryTruthMult}';
COMMENT ON COLUMN public.avi_reports.clarity IS 'Signal clarity metrics: {scs, sis, adi, scr, selComposite}';
COMMENT ON COLUMN public.avi_reports.ci95 IS '95% confidence intervals for all metrics';
COMMENT ON COLUMN public.avi_reports.counterfactual IS 'Revenue counterfactual analysis: {rarObservedUsd, rarCounterfactualUsd, deltaUsd}';
COMMENT ON COLUMN public.avi_reports.drivers IS 'Performance drivers array with metric, name, and contribution';
COMMENT ON COLUMN public.avi_reports.anomalies IS 'Detected anomalies array with signal, zScore, and note';
COMMENT ON COLUMN public.avi_reports.backlog_summary IS 'Optimization tasks with ROI projections';
