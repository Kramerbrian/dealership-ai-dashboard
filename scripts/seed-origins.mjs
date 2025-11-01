#!/usr/bin/env node

/**
 * Seed Origins Script
 * Bulk ingest origins from CSV file
 * 
 * Usage: node scripts/seed-origins.mjs ./data/dealers.csv
 */

import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
const KEY = process.env.X_API_KEY || '';

async function seedOrigins(filePath) {
  if (!filePath) {
    console.error('❌ Usage: node scripts/seed-origins.mjs ./data/dealers.csv');
    process.exit(1);
  }

  if (!BASE || !KEY) {
    console.error('❌ Error: FLEET_API_BASE and X_API_KEY must be set');
    process.exit(1);
  }

  try {
    // Read CSV file
    const fullPath = join(process.cwd(), filePath);
    const csv = fs.readFileSync(fullPath, 'utf8')
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (csv.length === 0) {
      console.error('❌ CSV file is empty');
      process.exit(1);
    }

    // Parse origins (assume first column is origin/URL)
    const origins = csv.map(line => {
      const parts = line.split(',');
      const origin = parts[0].trim();
      
      // Normalize URL
      if (!origin.startsWith('http')) {
        return `https://${origin}`;
      }
      return origin;
    });

    console.log(`📋 Found ${origins.length} origins to seed`);

    // Call bulk ingest API
    const url = new URL('/api/origins/bulk', BASE);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': KEY,
        'content-type': 'application/json',
        'X-Orchestrator-Role': 'AI_CSO',
      },
      body: JSON.stringify({ origins: origins.map(origin => ({ origin })) }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Bulk ingest failed: ${response.status} ${error}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ Bulk ingest complete:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const filePath = process.argv[2];
seedOrigins(filePath);

