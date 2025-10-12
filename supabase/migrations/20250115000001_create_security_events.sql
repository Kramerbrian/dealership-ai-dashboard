-- Migration: Create security_events table with RLS policies
-- Date: 2025-01-15
-- Description: Creates security_events table for tracking security-related events in the VDP-TOP + AEMD system

-- Step 1: Verify current context
SELECT current_database(), current_schema(), current_user;
SHOW search_path;
SELECT to_regclass('public.security_events');
SELECT pg_is_in_recovery(); -- must be false (not a read-replica)

-- Step 2: Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Step 3: Create the security_events table
CREATE TABLE public.security_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  actor_id uuid NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid, -- Add tenant_id for multi-tenant support
  severity text DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source text, -- Source of the event (e.g., 'vdp-generate', 'aemd-analyze', 'content-audit')
  ip_address inet, -- IP address of the actor
  user_agent text, -- User agent string
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_actor_id ON public.security_events(actor_id);
CREATE INDEX idx_security_events_tenant_id ON public.security_events(tenant_id);
CREATE INDEX idx_security_events_occurred_at ON public.security_events(occurred_at);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_source ON public.security_events(source);

-- Step 5: Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for multi-tenant support

-- Policy for authenticated users to select their tenant's events
CREATE POLICY "tenant_isolation_select_security_events"
  ON public.security_events
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    OR 
    actor_id = auth.uid()
  );

-- Policy for authenticated users to insert events for their tenant
CREATE POLICY "tenant_isolation_insert_security_events"
  ON public.security_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    AND
    actor_id = auth.uid()
  );

-- Policy for super admins to select all events
CREATE POLICY "super_admin_select_security_events"
  ON public.security_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'super_admin'
    )
  );

-- Policy for system/service accounts to insert events
CREATE POLICY "system_insert_security_events"
  ON public.security_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_actor_id uuid,
  p_payload jsonb,
  p_tenant_id uuid DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_source text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS bigint AS $$
DECLARE
  event_id bigint;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    actor_id,
    payload,
    tenant_id,
    severity,
    source,
    ip_address,
    user_agent
  ) VALUES (
    p_event_type,
    p_actor_id,
    p_payload,
    p_tenant_id,
    p_severity,
    p_source,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant necessary permissions
GRANT SELECT, INSERT ON public.security_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_events TO service_role;
GRANT USAGE ON SEQUENCE public.security_events_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.security_events_id_seq TO service_role;

-- Step 10: Verify the table was created successfully
SELECT to_regclass('public.security_events'); -- should return public.security_events
SELECT * FROM pg_policies WHERE tablename='security_events';

-- Step 11: Insert a test event to verify everything works
SELECT log_security_event(
  'test_event',
  auth.uid(),
  '{"message": "Security events table created successfully"}'::jsonb,
  current_setting('app.current_tenant_id', true)::uuid,
  'info',
  'migration',
  '127.0.0.1'::inet,
  'Migration Script'
);

-- Step 12: Show table structure
\d public.security_events;
