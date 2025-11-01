-- =====================================================
-- OPPORTUNITIES TABLE MIGRATION
-- Migration: Add opportunities table with impact_score ordering
-- Created: 2025-01-31
-- =====================================================

-- Create opportunities table for cursor-based pagination
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
  "impactScore" DOUBLE PRECISION NOT NULL,
  priority INTEGER NOT NULL,
  "estimatedROI" DOUBLE PRECISION NOT NULL,
  "estimatedAIVGain" DOUBLE PRECISION NOT NULL,
  effort TEXT NOT NULL CHECK (effort IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Index for domain filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_domain ON opportunities(domain);

-- Performance index for cursor-based pagination (ORDER BY impactScore DESC, id DESC)
-- This is critical for efficient pagination queries
CREATE INDEX IF NOT EXISTS idx_opportunities_impact_id 
  ON opportunities("impactScore" DESC, id DESC);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);

-- Comment explaining the pagination index
COMMENT ON INDEX idx_opportunities_impact_id IS 
  'Supports cursor-based pagination queries ordering by impactScore DESC, id DESC';

