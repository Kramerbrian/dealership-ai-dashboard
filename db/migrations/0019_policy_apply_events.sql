-- Policy Apply Events for SSE Progress Stream
CREATE TABLE IF NOT EXISTS policy_apply_events (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  kind text NOT NULL,            -- START, BLOCK, RELEASE, DONE, ERROR
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE policy_apply_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY policy_apply_events_tenant_select ON policy_apply_events
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY policy_apply_events_tenant_insert ON policy_apply_events
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_pae_tenant_time ON policy_apply_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pae_tenant_id ON policy_apply_events(tenant_id, id ASC);
