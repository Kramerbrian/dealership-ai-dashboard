-- Production Performance Indexes
-- This migration adds critical indexes for query performance optimization

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_dealership ON users("dealershipId") WHERE "dealershipId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created ON users("createdAt" DESC);

-- Dealerships table indexes
CREATE INDEX IF NOT EXISTS idx_dealerships_domain ON dealerships(domain);
CREATE INDEX IF NOT EXISTS idx_dealerships_status ON dealerships(status);
CREATE INDEX IF NOT EXISTS idx_dealerships_plan ON dealerships(plan);
CREATE INDEX IF NOT EXISTS idx_dealerships_city_state ON dealerships(city, state);

-- Scores table indexes
CREATE INDEX IF NOT EXISTS idx_scores_dealership_date ON scores("dealershipId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_scores_dealership_id ON scores("dealershipId");
CREATE INDEX IF NOT EXISTS idx_scores_created ON scores("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_scores_visibility ON scores("aiVisibility" DESC);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions("stripeSubscriptionId") WHERE "stripeSubscriptionId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions("trialEnd") WHERE "trialEnd" IS NOT NULL;

-- Audits table indexes
CREATE INDEX IF NOT EXISTS idx_audits_dealership_date ON audits("dealershipId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_audits_dealership_id ON audits("dealershipId");
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_domain ON audits(domain);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits("createdAt" DESC);

-- Accounts table indexes (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
    CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts("userId");
    CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, "providerAccountId");
  END IF;
END $$;

-- Sessions table indexes (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions("userId");
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions("sessionToken");
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
  END IF;
END $$;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_dealerships_active_plan ON dealerships(status, plan) WHERE status = 'ACTIVE';

-- Partial indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions("userId", status) WHERE status IN ('ACTIVE', 'TRIAL');

-- Analyze tables after creating indexes (helps PostgreSQL query planner)
ANALYZE users;
ANALYZE dealerships;
ANALYZE scores;
ANALYZE subscriptions;
ANALYZE audits;

COMMENT ON INDEX idx_users_email IS 'Index for user email lookups';
COMMENT ON INDEX idx_dealerships_domain IS 'Index for domain-based dealership lookups';
COMMENT ON INDEX idx_scores_dealership_date IS 'Index for time-series score queries';
COMMENT ON INDEX idx_subscriptions_user IS 'Index for user subscription lookups';

