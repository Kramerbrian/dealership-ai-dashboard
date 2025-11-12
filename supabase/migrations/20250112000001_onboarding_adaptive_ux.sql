-- DealershipAI · Onboarding Adaptive UX Migration
-- Tracks step durations and metrics for adaptive user experience

-- 1) Onboarding Step Durations
-- Tracks how long users spend on each onboarding step
CREATE TABLE IF NOT EXISTS public.onboarding_step_durations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  step_name TEXT NOT NULL,
  step_number INT NOT NULL,
  duration_ms INT NOT NULL,
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_step_user ON public.onboarding_step_durations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_step_session ON public.onboarding_step_durations (session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_step_name ON public.onboarding_step_durations (step_name);

COMMENT ON TABLE public.onboarding_step_durations IS 'Tracks time-to-complete for each onboarding step to enable adaptive pacing';
COMMENT ON COLUMN public.onboarding_step_durations.duration_ms IS 'Time spent on step in milliseconds';
COMMENT ON COLUMN public.onboarding_step_durations.completed IS 'Whether the step was completed successfully';
COMMENT ON COLUMN public.onboarding_step_durations.skipped IS 'Whether the user skipped this step';

-- 2) Onboarding Step Metrics (Aggregated)
-- Pre-computed metrics for faster dashboard queries
CREATE TABLE IF NOT EXISTS public.onboarding_step_metrics (
  id BIGSERIAL PRIMARY KEY,
  step_name TEXT NOT NULL,
  total_users INT NOT NULL DEFAULT 0,
  completed_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  avg_duration_ms INT,
  median_duration_ms INT,
  p95_duration_ms INT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_name)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_metrics_step ON public.onboarding_step_metrics (step_name);
CREATE INDEX IF NOT EXISTS idx_onboarding_metrics_updated ON public.onboarding_step_metrics (last_updated DESC);

COMMENT ON TABLE public.onboarding_step_metrics IS 'Aggregated metrics for onboarding steps, updated via cron or triggers';
COMMENT ON COLUMN public.onboarding_step_metrics.avg_duration_ms IS 'Average duration in milliseconds';
COMMENT ON COLUMN public.onboarding_step_metrics.median_duration_ms IS 'Median duration in milliseconds';
COMMENT ON COLUMN public.onboarding_step_metrics.p95_duration_ms IS '95th percentile duration in milliseconds';

-- 3) Function to update metrics (can be called by cron)
CREATE OR REPLACE FUNCTION public.update_onboarding_metrics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.onboarding_step_metrics (
    step_name,
    total_users,
    completed_count,
    skipped_count,
    avg_duration_ms,
    median_duration_ms,
    p95_duration_ms,
    last_updated
  )
  SELECT
    step_name,
    COUNT(DISTINCT user_id) as total_users,
    COUNT(*) FILTER (WHERE completed = true) as completed_count,
    COUNT(*) FILTER (WHERE skipped = true) as skipped_count,
    AVG(duration_ms)::INT as avg_duration_ms,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms)::INT as median_duration_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms)::INT as p95_duration_ms,
    NOW() as last_updated
  FROM public.onboarding_step_durations
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY step_name
  ON CONFLICT (step_name) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    completed_count = EXCLUDED.completed_count,
    skipped_count = EXCLUDED.skipped_count,
    avg_duration_ms = EXCLUDED.avg_duration_ms,
    median_duration_ms = EXCLUDED.median_duration_ms,
    p95_duration_ms = EXCLUDED.p95_duration_ms,
    last_updated = EXCLUDED.last_updated;
END;
$$;

COMMENT ON FUNCTION public.update_onboarding_metrics IS 'Updates aggregated onboarding metrics from step durations';

