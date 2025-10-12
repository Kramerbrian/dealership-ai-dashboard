-- Create Security Events Table
-- Run this in your Supabase SQL Editor if the table doesn't exist

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS public.security_events (
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

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_actor_id ON public.security_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON public.security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_occurred_at ON public.security_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_source ON public.security_events(source);

-- Step 3: Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy for authenticated users to select their tenant's events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_events'
      AND policyname='tenant_isolation_select_security_events'
  ) THEN
    CREATE POLICY "tenant_isolation_select_security_events"
      ON public.security_events
      FOR SELECT
      TO authenticated
      USING (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        OR 
        actor_id = auth.uid()
      );
  END IF;
END $$;

-- Policy for authenticated users to insert events for their tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_events'
      AND policyname='tenant_isolation_insert_security_events'
  ) THEN
    CREATE POLICY "tenant_isolation_insert_security_events"
      ON public.security_events
      FOR INSERT
      TO authenticated
      WITH CHECK (
        tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND
        actor_id = auth.uid()
      );
  END IF;
END $$;

-- Policy for super admins to select all events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_events'
      AND policyname='super_admin_select_security_events'
  ) THEN
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
  END IF;
END $$;

-- Policy for system/service accounts to insert events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_events'
      AND policyname='system_insert_security_events'
  ) THEN
    CREATE POLICY "system_insert_security_events"
      ON public.security_events
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

-- Step 5: Create helper functions
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_security_events_updated_at ON public.security_events;
CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON public.security_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to log security events
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

-- Step 6: Grant permissions
GRANT SELECT, INSERT ON public.security_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_events TO service_role;
GRANT USAGE ON SEQUENCE public.security_events_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.security_events_id_seq TO service_role;

-- Step 7: Test the setup
DO $$
DECLARE
  test_event_id bigint;
BEGIN
  -- Test the log function
  SELECT log_security_event(
    'test_event',
    '00000000-0000-0000-0000-000000000000'::uuid,
    '{"message": "Security events table created successfully"}'::jsonb,
    NULL,
    'info',
    'migration',
    '127.0.0.1'::inet,
    'Migration Script'
  ) INTO test_event_id;
  
  RAISE NOTICE 'Test event created with ID: %', test_event_id;
  
  -- Clean up test record
  DELETE FROM public.security_events WHERE id = test_event_id;
  RAISE NOTICE 'Test record cleaned up';
  
  RAISE NOTICE 'Security events table setup completed successfully!';
END $$;
