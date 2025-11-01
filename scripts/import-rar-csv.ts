/**
 * Import RaR events from CSV file
 * Usage: npx tsx scripts/import-rar-csv.ts path/to/rar-ingest-template.csv
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

interface RaREventRow {
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
  intentCluster?: string;
}

function parseCSV(csvPath: string): RaREventRow[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  const rows: RaREventRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: any = {};

    headers.forEach((header, idx) => {
      const value = values[idx];
      if (header === 'impressions') {
        row[header] = parseInt(value, 10);
      } else if (
        [
          'shareAISnippet',
          'ctrBaseline',
          'ctrDropWhenAI',
          'leadCR',
          'closeRate',
          'avgGross',
          'recoverableShare',
        ].includes(header)
      ) {
        row[header] = parseFloat(value);
      } else {
        row[header] = value || undefined;
      }
    });

    rows.push(row as RaREventRow);
  }

  return rows;
}

async function importEvent(event: RaREventRow) {
  try {
    const response = await fetch(`${API_BASE}/api/rar/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error importing event for ${event.dealerId}/${event.intentCluster}:`, error);
    throw error;
  }
}

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-rar-csv.ts <path-to-csv>');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📥 Importing RaR events from ${csvPath}...\n`);

  const events = parseCSV(csvPath);
  console.log(`Found ${events.length} events to import\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const event of events) {
    try {
      await importEvent(event);
      successCount++;
      console.log(
        `✅ ${event.dealerId} / ${event.intentCluster || 'no intent'}: ${event.impressions.toLocaleString()} impressions`
      );
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to import event:`, error);
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total events: ${events.length}`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);

  if (errorCount === 0) {
    // Trigger computation for each unique dealerId
    const uniqueDealers = [...new Set(events.map((e) => e.dealerId))];
    const uniqueMonths = [...new Set(events.map((e) => e.month))];

    console.log(`\n🧮 Triggering computation...`);
    for (const dealerId of uniqueDealers) {
      for (const month of uniqueMonths) {
        try {
          const response = await fetch(`${API_BASE}/api/rar/compute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealerId, month }),
          });

          if (response.ok) {
            console.log(`  ✅ Computed monthly RaR for ${dealerId} (${month})`);
          }
        } catch (error) {
          console.error(`  ❌ Failed to compute for ${dealerId}:`, error);
        }
      }
    }
  }

  console.log(`\n🎉 Import complete!`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

