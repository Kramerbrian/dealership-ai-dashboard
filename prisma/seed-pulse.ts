/**
 * DealershipAI Pulse System Seed Data
 * 
 * Seeds:
 * - Dealer: Germain Toyota of Naples
 * - Guardrail Ruleset: Toyota default
 * - Auto-Fix Policy: Tier 3 Enterprise
 * - Pulse Scores: Initial scores
 * 
 * Run with: npx tsx prisma/seed-pulse.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pulse System data...');

  // 1. Create or get seed user
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

  console.log('✅ User created/updated:', user.email);

  // 2. Create dealer
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

  console.log('✅ Dealer created/updated:', dealer.name);

  // 3. Create initial pulse score
  const pulseScore = await prisma.pulseScore.upsert({
    where: { id: 'seed_pulse_score_naples_toyota' },
    update: {
      pulseScore: 78.0,
      aiv: 78,
      ati: 82,
      zeroClick: 65,
      ugcHealth: 72,
      geoTrust: 75,
      trends: {
        direction: 'up',
        velocity: 1.2,
        acceleration: 0.3,
      },
      recommendations: [
        'Improve schema coverage',
        'Add review responses',
        'Optimize for AI Overviews',
      ],
      confidence: 0.85,
    },
    create: {
      id: 'seed_pulse_score_naples_toyota',
      dealerId: dealer.id,
      pulseScore: 78.0,
      aiv: 78,
      ati: 82,
      zeroClick: 65,
      ugcHealth: 72,
      geoTrust: 75,
      trends: {
        direction: 'up',
        velocity: 1.2,
        acceleration: 0.3,
      },
      recommendations: [
        'Improve schema coverage',
        'Add review responses',
        'Optimize for AI Overviews',
      ],
      confidence: 0.85,
      timeDelta: 0,
    },
  });

  console.log('✅ Pulse score created/updated:', pulseScore.id);

  // Note: GuardrailRuleset and AutoFixPolicy would need to be added to Prisma schema
  // For now, use the SQL seed file (prisma/seed-pulse.sql) for those tables

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Run prisma/seed-pulse.sql for GuardrailRuleset and AutoFixPolicy');
  console.log('2. Test PulseEvent ingestion with examples in canonical/agentic/pulse-events/');
  console.log('3. Verify guardrails route events correctly');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

