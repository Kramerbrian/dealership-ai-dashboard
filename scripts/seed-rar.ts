/**
 * Seed RaR Events
 * Run: npx tsx scripts/seed-rar.ts
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
const dealerId = process.env.SEED_DEALER_ID || 'demo-rooftop';
const month = process.env.SEED_MONTH || '2025-11-01';

const clusters: [string, number, number][] = [
  ['service_price', 0.35, 0.35],
  ['hours', 0.32, 0.30],
  ['oil_change', 0.38, 0.33],
  ['tire_rotation', 0.31, 0.29],
  ['dealer_near_me', 0.40, 0.37]
];

async function seedRaREvents() {
  console.log(`🌱 Seeding RaR events for ${dealerId} (${month})...\n`);

  for (const [intent, share, drop] of clusters) {
    const payload = {
      dealerId,
      month,
      channel: 'google_organic',
      impressions: 300000,
      shareAISnippet: share,
      ctrBaseline: 0.055,
      ctrDropWhenAI: drop,
      leadCR: 0.04,
      closeRate: 0.18,
      avgGross: 2100,
      recoverableShare: 0.45,
      intentCluster: intent
    };

    try {
      const response = await fetch(`${BASE_URL}/api/rar/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Failed to ingest ${intent}:`, error);
      } else {
        console.log(`✅ Ingested: ${intent} (share: ${share}, drop: ${drop})`);
      }
    } catch (error) {
      console.error(`❌ Error ingesting ${intent}:`, error);
    }
  }

  console.log(`\n✅ Seeded ${clusters.length} RaR events.`);
  console.log(`\n📊 Fetch summary: ${BASE_URL}/api/rar/summary?dealerId=${dealerId}&month=${month}`);
}

seedRaREvents().catch(console.error);

