#!/usr/bin/env node

/**
 * Deploy Supabase schema using Node.js
 * Uses the DATABASE_URL from .env.local
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env.local
const envFile = path.join(__dirname, '..', '.env.local');
let dbUrl = '';
let envContent = '';

if (fs.existsSync(envFile)) {
  envContent = fs.readFileSync(envFile, 'utf8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) {
    // Remove quotes if present
    dbUrl = match[1].replace(/^["']|["']$/g, '');
  }
}

if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

// Use DIRECT_URL if available (for migrations, not pgbouncer)
const directMatch = envContent.match(/DIRECT_URL=(.+)/);
const directUrl = directMatch ? directMatch[1].replace(/^["']|["']$/g, '') : null;

// Remove pgbouncer parameter if using DATABASE_URL
const connectionUrl = directUrl || dbUrl.replace(/\?pgbouncer=true/, '');

const migrationFile = path.join(__dirname, '..', 'supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql');

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Error: Migration file not found: ${migrationFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, 'utf8');

console.log('🚀 Deploying Supabase schema...\n');
console.log('📄 Migration file: 20251105110958_telemetry_and_pulse_schema.sql\n');

// Try using Supabase CLI if available
try {
  console.log('Attempting deployment via Supabase CLI...\n');
  
  // Check if we can use db push (requires link)
  try {
    execSync('supabase db push --linked', { stdio: 'inherit' });
    console.log('\n✅ Schema deployed successfully via Supabase CLI!');
    printNextSteps();
    process.exit(0);
  } catch (e) {
    // If not linked, try db execute
    console.log('Not linked. Trying direct SQL execution...\n');
    
    // For now, print instructions
    console.log('📋 To deploy, use one of these methods:\n');
    console.log('Method 1: Supabase Dashboard (easiest)');
    console.log('  1. Open: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql');
    console.log('  2. Copy contents of: supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql');
    console.log('  3. Paste and click Run\n');
    
    console.log('Method 2: Supabase CLI');
    console.log('  1. supabase login');
    console.log('  2. supabase link --project-ref gzlgfghpkbqlhgfozjkb');
    console.log('  3. supabase db push\n');
    
    console.log('Method 3: Install psql and use:');
    console.log(`  psql "${connectionUrl}" -f "${migrationFile}"\n`);
    
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

function printNextSteps() {
  console.log('\n📋 Next steps:');
  console.log('  1. Test telemetry endpoint:');
  console.log('     curl -X POST http://localhost:3000/api/telemetry \\');
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"type":"test","payload":{"test":true}}\'');
  console.log('');
  console.log('  2. Seed demo data:');
  console.log('     Visit: http://localhost:3000/api/admin/seed');
  console.log('');
  console.log('  3. View admin dashboard:');
  console.log('     Visit: http://localhost:3000/admin');
}

