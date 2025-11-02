-- Idempotency table for preventing duplicate requests
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id text PRIMARY KEY,
  tenant_id uuid NOT NULL,
  route text NOT NULL,
  key text NOT NULL,
  seen_at timestamptz DEFAULT now()
);

-- Only create index if route column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'idempotency_keys' AND column_name = 'route'
  ) THEN
    CREATE INDEX IF NOT EXISTS ix_idem_tenant_route ON idempotency_keys(tenant_id, route, key);
  END IF;
END $$;

-- Add cleanup job to remove old entries (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys 
  WHERE seen_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;
