-- DealershipAI v2.0 - Security Events Table Migration
-- Creates and secures the security_events table with RLS

-- Create security_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  actor_id uuid NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create Supabase-friendly policy for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_events'
      AND policyname='Auth select security_events'
  ) THEN
    CREATE POLICY "Auth select security_events"
    ON public.security_events FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Create policy for inserting security events (authenticated users only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_events'
      AND policyname='Auth insert security_events'
  ) THEN
    CREATE POLICY "Auth insert security_events"
    ON public.security_events FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_events_actor_id ON public.security_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_occurred_at ON public.security_events(occurred_at);

-- Add comment for documentation
COMMENT ON TABLE public.security_events IS 'Security event logging for DealershipAI v2.0 - tracks user actions and system events';
COMMENT ON COLUMN public.security_events.event_type IS 'Type of security event (login, logout, api_call, etc.)';
COMMENT ON COLUMN public.security_events.actor_id IS 'User ID who performed the action';
COMMENT ON COLUMN public.security_events.payload IS 'JSON payload containing event details';
COMMENT ON COLUMN public.security_events.occurred_at IS 'Timestamp when the event occurred';
