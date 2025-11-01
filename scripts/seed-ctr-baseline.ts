/**
 * Seed CTR Baseline Data
 * 
 * Creates sample CTR baseline entries for testing
 * Run with: npx tsx scripts/seed-ctr-baseline.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = process.env.TENANT_ID || 'demo-tenant';

  console.log(`Seeding CTR baselines for tenant: ${tenantId}`);

  // Seed multiple baseline cohorts
  const baselines = [
    {
      tenantId,
      device: 'mobile',
      cohort: 'brand_pos_1_3',
      ctr: 0.18 // 18% CTR for brand queries in positions 1-3 on mobile
    },
    {
      tenantId,
      device: 'desktop',
      cohort: 'brand_pos_1_3',
      ctr: 0.15 // 15% CTR for brand queries in positions 1-3 on desktop
    },
    {
      tenantId,
      device: 'mobile',
      cohort: 'nonbrand_pos_1_3',
      ctr: 0.12 // 12% CTR for non-brand queries in positions 1-3 on mobile
    },
    {
      tenantId,
      device: 'desktop',
      cohort: 'nonbrand_pos_1_3',
      ctr: 0.10 // 10% CTR for non-brand queries in positions 1-3 on desktop
    },
    {
      tenantId,
      device: 'mobile',
      cohort: 'nonbrand_pos_4_10',
      ctr: 0.06 // 6% CTR for non-brand queries in positions 4-10 on mobile
    },
    {
      tenantId,
      device: 'desktop',
      cohort: 'nonbrand_pos_4_10',
      ctr: 0.05 // 5% CTR for non-brand queries in positions 4-10 on desktop
    }
  ];

  for (const baseline of baselines) {
    await prisma.ctrBaseline.upsert({
      where: {
        tenantId_device_cohort: {
          tenantId: baseline.tenantId,
          device: baseline.device,
          cohort: baseline.cohort
        }
      },
      update: {
        ctr: baseline.ctr,
        updatedAt: new Date()
      },
      create: baseline
    });

    console.log(
      `✓ Upserted baseline: ${baseline.device}/${baseline.cohort} = ${(baseline.ctr * 100).toFixed(1)}%`
    );
  }

  console.log('\n✅ Seeded CTR baselines successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding baselines:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

