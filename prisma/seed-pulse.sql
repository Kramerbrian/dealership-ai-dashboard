-- ==============================================
-- DealershipAI Pulse System Seed Data
-- ==============================================
-- Seed data for Dealer, Guardrails, Auto-Fix Policy, and Pulse Events
-- Run this in Supabase/Postgres or via Prisma seed

-- ==============================================
-- 1. DEALER: Germain Toyota of Naples (Tier 3 Enterprise)
-- ==============================================
-- Note: Adapts to existing Dealer schema (id, domain, name, city, state, brands, userId, poolKey)

-- First, ensure we have a user to own the dealer
INSERT INTO "users" (
  id,
  email,
  name,
  role,
  tier,
  "createdAt",
  "updatedAt"
) VALUES (
  'seed_user_naples_toyota',
  'seed@germaintoyotaofnaples.com',
  'Seed User',
  'OWNER',
  'ENTERPRISE',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert the dealer
INSERT INTO "dealers" (
  id,
  domain,
  name,
  city,
  state,
  zip,
  brands,
  type,
  "poolKey",
  "userId",
  "createdAt",
  "updatedAt"
) VALUES (
  'crm_naples_toyota',
  'germain-toyota-of-naples.com',
  'Germain Toyota of Naples',
  'Naples',
  'FL',
  '34102',
  ARRAY['Toyota'],
  'FRANCHISE',
  'Naples-FL',
  'seed_user_naples_toyota',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 2. GUARDRAIL RULESET: Toyota default
-- ==============================================
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS "GuardrailRuleset" (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  "appliesTo" TEXT[],
  rules JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO "GuardrailRuleset" (
  id,
  brand,
  "appliesTo",
  rules,
  "createdAt",
  "updatedAt"
) VALUES (
  'toyota_default_v1',
  'Toyota',
  ARRAY['crm_naples_toyota'],
  '{
    "id": "toyota_default_v1",
    "brand": "Toyota",
    "appliesTo": ["crm_naples_toyota"],
    "priority_overrides": [
      {
        "when": {
          "kind": "market_signal",
          "brand": "Toyota",
          "tags_any": ["oem_program_change"]
        },
        "set_level": "critical",
        "route_to": ["orchestrator", "aim_gpt", "pulse_engine", "schema_engine"],
        "escalate_channels": ["slack", "dashboard"],
        "auto_fix_allowed": true
      },
      {
        "when": {
          "kind": "kpi_delta",
          "tags_any": ["ai_visibility_drop"]
        },
        "set_level": "critical",
        "route_to": ["orchestrator", "pulse_engine"],
        "escalate_channels": ["dashboard"],
        "auto_fix_allowed": false
      },
      {
        "when": {
          "kind": "kpi_delta",
          "tags_any": ["trade_capture_drop"]
        },
        "set_level": "high",
        "route_to": ["orchestrator", "aim_gpt", "pulse_engine"],
        "escalate_channels": ["dashboard"],
        "auto_fix_allowed": false
      }
    ]
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 3. AUTO-FIX POLICY: Tier 3 Enterprise
-- ==============================================
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AutoFixPolicy" (
  id TEXT PRIMARY KEY,
  tier TEXT NOT NULL,
  permissions JSONB NOT NULL,
  constraints JSONB NOT NULL,
  "channelDefaults" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO "AutoFixPolicy" (
  id,
  tier,
  permissions,
  constraints,
  "channelDefaults",
  "createdAt",
  "updatedAt"
) VALUES (
  'tier3_enterprise_default_v1',
  'enterprise',
  '{
    "schema_injection": "auto",
    "gbp_updates": "auto",
    "website_content_updates": "auto_with_review_log",
    "social_creative_refresh": "suggest_only",
    "sem_bid_adjustments": "suggest_only",
    "seo_content_rewrites": "suggest_only",
    "ctv_creative": "manual_only"
  }'::jsonb,
  '{
    "max_auto_changes_per_day": 10,
    "require_human_ack_for_critical": true,
    "log_destination": "orchestrator_audit_log"
  }'::jsonb,
  '{
    "critical": ["dashboard", "slack"],
    "high": ["dashboard"],
    "medium": ["dashboard"],
    "low": ["dashboard"],
    "info": ["dashboard"]
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 4. PULSE SCORES: Initial scores for dealer
-- ==============================================
INSERT INTO "pulse_scores" (
  id,
  "dealerId",
  "pulseScore",
  aiv,
  ati,
  "zeroClick",
  "ugcHealth",
  "geoTrust",
  trends,
  recommendations,
  confidence,
  "timeDelta",
  "createdAt",
  timestamp
) VALUES (
  'seed_pulse_score_naples_toyota',
  'crm_naples_toyota',
  78.0,
  78, -- AIV
  82, -- ATI
  65, -- Zero-Click
  72, -- UGC Health
  75, -- Geo Trust
  '{"direction": "up", "velocity": 1.2, "acceleration": 0.3}'::jsonb,
  '["Improve schema coverage", "Add review responses", "Optimize for AI Overviews"]'::jsonb,
  0.85,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- Success message
-- ==============================================
SELECT '✅ Seed data inserted successfully' AS status;

