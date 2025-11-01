-- Migration: Add ShareEvent table for share-to-unlock tracking
-- Created: 2025-01-31

-- Create ShareEvent table (matches Prisma schema)
CREATE TABLE IF NOT EXISTS share_events (
  id TEXT PRIMARY KEY,
  domain TEXT,
  "featureName" TEXT NOT NULL,
  platform TEXT NOT NULL,
  "shareUrl" TEXT NOT NULL,
  "referralCode" TEXT,
  "unlockExpiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "sessionId" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_share_events_domain ON share_events(domain);
CREATE INDEX IF NOT EXISTS idx_share_events_feature_name ON share_events("featureName");
CREATE INDEX IF NOT EXISTS idx_share_events_unlock_expires ON share_events("unlockExpiresAt");
CREATE INDEX IF NOT EXISTS idx_share_events_session_id ON share_events("sessionId");

-- Create composite index for domain + status queries (opportunities table)
-- Note: This assumes opportunities table already exists
CREATE INDEX IF NOT EXISTS idx_opportunities_domain_status 
  ON opportunities (domain, status);

-- Create additional index for opportunities cursor-based pagination
CREATE INDEX IF NOT EXISTS idx_opportunities_impact_id
  ON opportunities (impact_score DESC, id DESC);

-- Add comments
COMMENT ON TABLE share_events IS 'Tracks share events for unlock-to-share viral mechanics';
COMMENT ON INDEX idx_opportunities_impact_id IS 'Optimizes cursor-based pagination queries';
