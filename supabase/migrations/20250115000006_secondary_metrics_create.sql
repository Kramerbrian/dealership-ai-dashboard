-- 0001_secondary_metrics_create.sql
-- Creates secondary_metrics table used to store SCS/SIS/ADI/SCR per tenant per week.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS secondary_metrics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL,
  date_week   date NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE secondary_metrics IS 'Per-tenant weekly secondary signals (clarity, authority, schema).';
