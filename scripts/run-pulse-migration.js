#!/usr/bin/env node
/**
 * Pulse Tables Migration Script
 *
 * This script creates the Pulse System V2.0 tables directly in Supabase
 * using the pg library to bypass IP restrictions.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.production
require('dotenv').config({ path: '.env.production' });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or DIRECT_URL not found in environment');
  console.error('   Make sure .env.production is properly configured');
  process.exit(1);
}

// Clean the connection string (remove escaped characters)
const cleanConnectionString = connectionString
  .replace(/\\n/g, '')
  .replace(/\\\$/g, '$')
  .trim();

console.log('========================================');
console.log('Pulse System V2.0 - Database Migration');
console.log('========================================\n');

console.log('📊 Database:', cleanConnectionString.split('@')[1]?.split('/')[0] || 'unknown');
console.log('🔄 Creating Pulse tables...\n');

async function runMigration() {
  const client = new Client({
    connectionString: cleanConnectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-pulse-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    console.log('🔄 Executing SQL migration...\n');
    const result = await client.query(sql);

    console.log('✅ Migration executed successfully!\n');

    // Verify tables were created
    const verifyResult = await client.query(`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_name LIKE 'Pulse%'
      ORDER BY table_name;
    `);

    console.log('📋 Pulse Tables Created:');
    console.log('─────────────────────────────────────');
    verifyResult.rows.forEach(row => {
      console.log(`   ${row.table_name.padEnd(20)} ${row.column_count} columns`);
    });
    console.log('');

    // Sample data insertion test
    console.log('🧪 Testing table write access...');

    const testDealerId = 'demo-dealer-123';
    const testId = `pulse_${Date.now()}`;

    await client.query(`
      INSERT INTO "PulseScore" (
        "id", "dealerId", "score", "signals", "trends",
        "recommendations", "confidence", "updatedAt"
      ) VALUES (
        $1, $2, 82.5,
        '{"aiv": 75, "ati": 80, "zero_click": 85, "ugc_health": 90, "geo_trust": 85}'::jsonb,
        '{"direction": "up", "velocity": 2.5, "acceleration": 0.3}'::jsonb,
        ARRAY['Optimize schema markup', 'Improve review response rate'],
        0.92,
        NOW()
      )
      ON CONFLICT ("id") DO NOTHING
    `, [testId, testDealerId]);

    const testResult = await client.query(
      'SELECT COUNT(*) as count FROM "PulseScore" WHERE "dealerId" = $1',
      [testDealerId]
    );

    console.log(`✅ Sample data written successfully (${testResult.rows[0].count} test records)\n`);

    console.log('🎉 Migration Complete!');
    console.log('═════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('1. Deploy to production: npx vercel --prod');
    console.log('2. Test API: GET /api/pulse/score?dealerId=demo-dealer-123');
    console.log('3. Verify in Supabase dashboard\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
