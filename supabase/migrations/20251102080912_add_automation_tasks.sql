-- Create automation_tasks table
CREATE TABLE IF NOT EXISTS automation_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  kind TEXT NOT NULL,
  "dealerId" TEXT,
  "modelId" TEXT,
  payload JSONB NOT NULL,
  "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "approvedAt" TIMESTAMPTZ,
  "approvedBy" TEXT,
  "executedAt" TIMESTAMPTZ,
  error TEXT
);

-- Create index on status and createdAt for efficient querying
CREATE INDEX IF NOT EXISTS automation_tasks_status_created_at_idx ON automation_tasks(status, "createdAt");

-- Add comment to table
COMMENT ON TABLE automation_tasks IS 'Stores automation tasks for PRICE, ADS, and NOTIFY operations with approval workflow';

