-- Idempotency table for preventing duplicate requests
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id text PRIMARY KEY,
  tenant_id uuid NOT NULL,
  route text NOT NULL,
  key text NOT NULL,
  seen_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_idem_tenant_route ON idempotency_keys(tenant_id, route, key);

-- Add cleanup job to remove old entries (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys 
  WHERE seen_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;