#!/usr/bin/env tsx

/**
 * Apply Supabase migration directly via API
 * Uses Supabase client to execute SQL
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

async function applyMigration() {
  console.log('🚀 Applying Supabase Migration via API\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Read migration SQL
  const migrationFile = path.join(process.cwd(), 'supabase/migrations/20250112000001_onboarding_adaptive_ux.sql');
  const sql = await fs.readFile(migrationFile, 'utf-8');

  console.log('📄 Migration SQL loaded\n');
  console.log('⚠️  Note: Supabase REST API cannot execute DDL statements directly.');
  console.log('   This script will verify tables exist or provide SQL for manual execution.\n');

  // Check if tables exist
  console.log('🔍 Checking existing tables...\n');
  
  const tables = ['onboarding_step_durations', 'onboarding_step_metrics'];
  const missingTables: string[] = [];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log(`   ❌ ${table}: Not found`);
        missingTables.push(table);
      } else {
        console.log(`   ✅ ${table}: Exists`);
      }
    } catch (e: any) {
      console.log(`   ❌ ${table}: ${e.message}`);
      missingTables.push(table);
    }
  }

  if (missingTables.length > 0) {
    console.log('\n📋 To create missing tables, use one of these methods:\n');
    console.log('Method 1: Supabase Dashboard SQL Editor (Recommended)');
    console.log('   1. Visit: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new');
    console.log('   2. Copy SQL from: supabase/migrations/20250112000001_onboarding_adaptive_ux.sql');
    console.log('   3. Paste and run\n');
    
    console.log('Method 2: Supabase CLI (when connection works)');
    console.log('   export PGPASSWORD=\'Autonation2077$\'');
    console.log('   supabase db push --include-all\n');

    console.log('📄 Migration SQL:\n');
    console.log(sql);
  } else {
    console.log('\n✅ All tables exist! Migration already applied.');
  }
}

applyMigration().catch(console.error);

