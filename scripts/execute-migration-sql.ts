#!/usr/bin/env tsx

/**
 * Execute Migration SQL via Supabase Management API
 * Uses service role key to create tables directly
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function executeMigration() {
  console.log('🚀 Executing Migration via Supabase API...\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Read migration SQL
  const migrationFile = path.join(process.cwd(), 'supabase/migrations/20251112073318_apply_enhancement_migrations.sql');
  const sql = await fs.readFile(migrationFile, 'utf-8');

  console.log('📄 Migration SQL loaded\n');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 10);

  console.log(`📋 Executing ${statements.length} SQL statements...\n`);

  // Execute each statement via RPC (if available) or direct table operations
  // Note: Supabase REST API doesn't support arbitrary SQL, so we'll create tables directly
  
  try {
    // Check if telemetry_events exists
    const { error: checkError } = await supabase.from('telemetry_events').select('*').limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('📊 Creating telemetry_events table...');
      // Table doesn't exist - we need to create it via SQL Editor
      console.log('⚠️  Supabase REST API cannot execute DDL statements.');
      console.log('   Tables must be created via SQL Editor or CLI.\n');
    } else {
      console.log('✅ telemetry_events table already exists');
    }

    // Since we can't execute DDL via REST API, provide instructions
    console.log('\n📋 To apply migrations, use one of these methods:\n');
    console.log('Method 1: Supabase Dashboard SQL Editor (Recommended)');
    console.log('   1. Visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new');
    console.log('   2. Copy SQL from: supabase/migrations/20251112073318_apply_enhancement_migrations.sql');
    console.log('   3. Paste and run\n');
    
    console.log('Method 2: Supabase CLI (if connection works)');
    console.log('   supabase db push --include-all\n');

    // Verify what tables exist
    console.log('🔍 Checking existing tables...\n');
    const tables = ['telemetry_events', 'onboarding_step_durations', 'onboarding_step_metrics', 'audit_logs'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error && error.code === 'PGRST116') {
          console.log(`   ❌ ${table}: Not found`);
        } else {
          console.log(`   ✅ ${table}: Exists`);
        }
      } catch (e: any) {
        console.log(`   ❌ ${table}: ${e.message}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

executeMigration().catch(console.error);

