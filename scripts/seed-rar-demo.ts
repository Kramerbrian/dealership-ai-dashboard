/**
 * Seed RaR demo data for 3 rooftops
 * Run: npx tsx scripts/seed-rar-demo.ts
 */

import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

interface RaREvent {
  dealerId: string;
  month: string;
  channel: string;
  impressions: number;
  shareAISnippet: number;
  ctrBaseline: number;
  ctrDropWhenAI: number;
  leadCR: number;
  closeRate: number;
  avgGross: number;
  recoverableShare: number;
  intentCluster: string;
}

const rooftops = [
  {
    id: 'germain-toyota-naples',
    name: 'Germain Toyota Naples',
    avgGross: 2100,
    clusters: [
      ['service_price', 0.35, 0.35, 300000],
      ['hours', 0.32, 0.30, 250000],
      ['oil_change', 0.38, 0.33, 180000],
      ['tire_rotation', 0.31, 0.29, 120000],
      ['dealer_near_me', 0.40, 0.37, 95000],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: 'lou-grubbs-motors',
    name: 'Lou Grubbs Motors',
    avgGross: 1950,
    clusters: [
      ['service_price', 0.33, 0.32, 280000],
      ['hours', 0.30, 0.28, 220000],
      ['oil_change', 0.36, 0.31, 160000],
      ['tire_rotation', 0.29, 0.27, 100000],
      ['dealer_near_me', 0.38, 0.35, 85000],
    ] as Array<[string, number, number, number]>,
  },
  {
    id: 'demo-rooftop',
    name: 'Demo Rooftop',
    avgGross: 2050,
    clusters: [
      ['service_price', 0.37, 0.34, 200000],
      ['hours', 0.34, 0.31, 150000],
      ['oil_change', 0.39, 0.35, 140000],
      ['tire_rotation', 0.32, 0.30, 90000],
      ['dealer_near_me', 0.41, 0.38, 75000],
    ] as Array<[string, number, number, number]>,
  },
];

const month = '2025-11-01';
const channel = 'google_organic';
const ctrBaseline = 0.055;
const leadCR = 0.04;
const closeRate = 0.18;
const recoverableShare = 0.45;

async function ingestEvent(event: RaREvent) {
  try {
    const response = await fetch(`${API_BASE}/api/rar/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error ingesting event for ${event.dealerId}/${event.intentCluster}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Seeding RaR demo data for 3 rooftops...\n');

  let totalEvents = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const rooftop of rooftops) {
    console.log(`📊 Processing ${rooftop.name} (${rooftop.id})...`);

    for (const [intent, share, drop, impressions] of rooftop.clusters) {
      totalEvents++;
      const event: RaREvent = {
        dealerId: rooftop.id,
        month,
        channel,
        impressions,
        shareAISnippet: share,
        ctrBaseline,
        ctrDropWhenAI: drop,
        leadCR,
        closeRate,
        avgGross: rooftop.avgGross,
        recoverableShare,
        intentCluster: intent,
      };

      try {
        await ingestEvent(event);
        successCount++;
        console.log(`  ✅ ${intent}: ${impressions.toLocaleString()} impressions, ${(share * 100).toFixed(0)}% AI snippet share`);
      } catch (error) {
        errorCount++;
        console.error(`  ❌ ${intent}: Failed to ingest`);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`\n📈 Summary:`);
  console.log(`  Total events: ${totalEvents}`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n✅ All events ingested successfully!');
    console.log(`\n🧮 Triggering computation for each rooftop...`);

    for (const rooftop of rooftops) {
      try {
        const computeResponse = await fetch(`${API_BASE}/api/rar/compute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dealerId: rooftop.id, month }),
        });

        if (computeResponse.ok) {
          console.log(`  ✅ Computed monthly RaR for ${rooftop.name}`);
        } else {
          console.error(`  ❌ Failed to compute for ${rooftop.name}`);
        }
      } catch (error) {
        console.error(`  ❌ Error computing for ${rooftop.name}:`, error);
      }
    }

    console.log('\n🎉 Demo data seeding complete!');
    console.log('\n📊 View results:');
    for (const rooftop of rooftops) {
      console.log(`  ${API_BASE}/api/rar/summary?dealerId=${rooftop.id}&month=${month}`);
    }
  } else {
    console.error('\n⚠️  Some events failed to ingest. Check errors above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

