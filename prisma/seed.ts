/**
 * DealershipAI Pulse System Seed
 * 
 * Seeds:
 * - User: Seed user for Germain Toyota
 * - Dealer: Germain Toyota of Naples (Tier 3 Enterprise)
 * - Guardrail Ruleset: Toyota default (via raw SQL)
 * - Auto-Fix Policy: Tier 3 Enterprise (via raw SQL)
 * - Pulse Tasks: Test tasks for queue wiring
 * 
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DealershipAI Pulse System...\n');

  // 1) Create seed user
  const user = await prisma.user.upsert({
    where: { email: 'seed@germaintoyotaofnaples.com' },
    update: {},
    create: {
      id: 'seed_user_naples_toyota',
      email: 'seed@germaintoyotaofnaples.com',
      name: 'Seed User',
      role: 'OWNER',
      tier: 'ENTERPRISE',
    },
  });
  console.log('✅ User:', user.email);

  // 2) Dealer: Germain Toyota of Naples (Tier 3 Enterprise)
  const dealer = await prisma.dealer.upsert({
    where: { id: 'crm_naples_toyota' },
    update: {
      name: 'Germain Toyota of Naples',
      city: 'Naples',
      state: 'FL',
      brands: ['Toyota'],
      poolKey: 'Naples-FL',
    },
    create: {
      id: 'crm_naples_toyota',
      domain: 'germain-toyota-of-naples.com',
      name: 'Germain Toyota of Naples',
      city: 'Naples',
      state: 'FL',
      zip: '34102',
      brands: ['Toyota'],
      type: 'FRANCHISE',
      poolKey: 'Naples-FL',
      userId: user.id,
    },
  });
  console.log('✅ Dealer:', dealer.name);

  // 3) Guardrail Ruleset: Toyota default (via raw SQL since not in Prisma schema)
  const toyotaRules = {
    id: 'toyota_default_v1',
    brand: 'Toyota',
    appliesTo: ['crm_naples_toyota'],
    priority_overrides: [
      {
        when: {
          kind: 'market_signal',
          brand: 'Toyota',
          tags_any: ['oem_program_change'],
        },
        set_level: 'critical',
        route_to: ['orchestrator', 'aim_gpt', 'pulse_engine', 'schema_engine'],
        escalate_channels: ['slack', 'dashboard'],
        auto_fix_allowed: true,
      },
      {
        when: {
          kind: 'kpi_delta',
          tags_any: ['ai_visibility_drop'],
        },
        set_level: 'critical',
        route_to: ['orchestrator', 'pulse_engine'],
        escalate_channels: ['dashboard'],
        auto_fix_allowed: false,
      },
      {
        when: {
          kind: 'kpi_delta',
          tags_any: ['trade_capture_drop'],
        },
        set_level: 'high',
        route_to: ['orchestrator', 'aim_gpt', 'pulse_engine'],
        escalate_channels: ['dashboard'],
        auto_fix_allowed: false,
      },
    ],
  };

  // Create GuardrailRuleset table if it doesn't exist and upsert
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GuardrailRuleset" (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      "appliesTo" TEXT[],
      rules JSONB NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "GuardrailRuleset" (id, brand, "appliesTo", rules, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      brand = EXCLUDED.brand,
      "appliesTo" = EXCLUDED."appliesTo",
      rules = EXCLUDED.rules,
      "updatedAt" = NOW();
  `, 'toyota_default_v1', 'Toyota', ['crm_naples_toyota'], JSON.stringify(toyotaRules));
  console.log('✅ Guardrail Ruleset: toyota_default_v1');

  // 4) Auto-Fix Policy: Tier 3 Enterprise
  const tier3Policy = {
    schema_injection: 'auto',
    gbp_updates: 'auto',
    website_content_updates: 'auto_with_review_log',
    social_creative_refresh: 'suggest_only',
    sem_bid_adjustments: 'suggest_only',
    seo_content_rewrites: 'suggest_only',
    ctv_creative: 'manual_only',
  };

  const tier3Constraints = {
    max_auto_changes_per_day: 10,
    require_human_ack_for_critical: true,
    log_destination: 'orchestrator_audit_log',
  };

  const tier3Channels = {
    critical: ['dashboard', 'slack'],
    high: ['dashboard'],
    medium: ['dashboard'],
    low: ['dashboard'],
    info: ['dashboard'],
  };

  // Create AutoFixPolicy table if it doesn't exist and upsert
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AutoFixPolicy" (
      id TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      permissions JSONB NOT NULL,
      constraints JSONB NOT NULL,
      "channelDefaults" JSONB NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "AutoFixPolicy" (id, tier, permissions, constraints, "channelDefaults", "createdAt", "updatedAt")
    VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      tier = EXCLUDED.tier,
      permissions = EXCLUDED.permissions,
      constraints = EXCLUDED.constraints,
      "channelDefaults" = EXCLUDED."channelDefaults",
      "updatedAt" = NOW();
  `, 
    'tier3_enterprise_default_v1',
    'enterprise',
    JSON.stringify(tier3Policy),
    JSON.stringify(tier3Constraints),
    JSON.stringify(tier3Channels)
  );
  console.log('✅ Auto-Fix Policy: tier3_enterprise_default_v1');

  // 5) (Optional) Seed a couple of PulseTasks to prove queue wiring
  // Note: PulseTask model doesn't exist in current schema, so we'll create the table if needed
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PulseTask" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      agent TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      payload JSONB DEFAULT '{}'::jsonb,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "PulseTask" (agent, status, payload)
    VALUES 
      ($1, $2, $3::jsonb),
      ($4, $5, $6::jsonb)
    ON CONFLICT DO NOTHING;
  `,
    'aim_gpt',
    'queued',
    JSON.stringify({ seed: true, note: 'Test AIM task wiring' }),
    'pulse_engine',
    'queued',
    JSON.stringify({ seed: true, note: 'Test Pulse Engine task wiring' })
  );
  console.log('✅ Pulse Tasks: 2 test tasks queued');

  console.log('\n✅ Seed completed!');
  console.log('📋 Seeded:');
  console.log('  - User: seed@germaintoyotaofnaples.com');
  console.log('  - Dealer: crm_naples_toyota (Germain Toyota of Naples)');
  console.log('  - Guardrail Ruleset: toyota_default_v1');
  console.log('  - Auto-Fix Policy: tier3_enterprise_default_v1');
  console.log('  - Pulse Tasks: 2 test tasks');
  console.log('\n🚀 Next steps:');
  console.log('  1. Fire test PulseEvents via /api/pulse/debug/seed');
  console.log('  2. Visit /triage to see cards appear');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
