-- Pulse System V2.0 Tables
-- DealershipAI Production Database Schema
-- Run this script in Supabase SQL Editor or via psql

BEGIN;

-- PulseScore: Real-time dealer health scores
CREATE TABLE IF NOT EXISTS "PulseScore" (
  "id" TEXT NOT NULL,
  "dealerId" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "signals" JSONB NOT NULL,
  "trends" JSONB NOT NULL,
  "recommendations" TEXT[],
  "confidence" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PulseScore_pkey" PRIMARY KEY ("id")
);

-- PulseScenario: Strategic scenario forecasts
CREATE TABLE IF NOT EXISTS "PulseScenario" (
  "id" TEXT NOT NULL,
  "dealerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "inputs" JSONB NOT NULL,
  "forecast" JSONB NOT NULL,
  "gain" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PulseScenario_pkey" PRIMARY KEY ("id")
);

-- PulseRadarData: Market events and competitive intelligence
CREATE TABLE IF NOT EXISTS "PulseRadarData" (
  "id" TEXT NOT NULL,
  "dealerId" TEXT NOT NULL,
  "events" JSONB NOT NULL,
  "alerts" JSONB NOT NULL,
  "impacts" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PulseRadarData_pkey" PRIMARY KEY ("id")
);

-- PulseTrend: Time-series metrics and velocity tracking
CREATE TABLE IF NOT EXISTS "PulseTrend" (
  "id" TEXT NOT NULL,
  "dealerId" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "dataPoints" JSONB NOT NULL,
  "direction" TEXT NOT NULL,
  "velocity" DOUBLE PRECISION NOT NULL,
  "acceleration" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PulseTrend_pkey" PRIMARY KEY ("id")
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS "PulseScore_dealerId_idx" ON "PulseScore"("dealerId");
CREATE INDEX IF NOT EXISTS "PulseScore_createdAt_idx" ON "PulseScore"("createdAt");
CREATE INDEX IF NOT EXISTS "PulseScore_score_idx" ON "PulseScore"("score");

CREATE INDEX IF NOT EXISTS "PulseScenario_dealerId_idx" ON "PulseScenario"("dealerId");
CREATE INDEX IF NOT EXISTS "PulseScenario_createdAt_idx" ON "PulseScenario"("createdAt");

CREATE INDEX IF NOT EXISTS "PulseRadarData_dealerId_idx" ON "PulseRadarData"("dealerId");
CREATE INDEX IF NOT EXISTS "PulseRadarData_createdAt_idx" ON "PulseRadarData"("createdAt");

CREATE INDEX IF NOT EXISTS "PulseTrend_dealerId_metric_idx" ON "PulseTrend"("dealerId", "metric");
CREATE INDEX IF NOT EXISTS "PulseTrend_createdAt_idx" ON "PulseTrend"("createdAt");

COMMIT;

-- Verification Query
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'Pulse%'
ORDER BY table_name;

SELECT '✅ Pulse tables created successfully!' as status;
