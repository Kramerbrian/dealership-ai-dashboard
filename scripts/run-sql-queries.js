#!/usr/bin/env node

/**
 * Execute SQL queries via Supabase connection
 * This uses the Supabase client to execute queries
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL');
  console.error('   Required: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runQuery(query, description) {
  console.log(`\n📋 ${description}`);
  console.log('─'.repeat(50));
  
  try {
    // Note: Supabase client doesn't support arbitrary SQL queries
    // We can only use RPC functions or table queries
    // For direct SQL, you need to use the SQL Editor or psql
    
    console.log('⚠️  Supabase JavaScript client cannot execute arbitrary SQL queries.');
    console.log('✅ Use Supabase SQL Editor instead:');
    console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql/new`);
    console.log('\n📄 Query to run:');
    console.log(query);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  const fs = require('fs').promises;
  
  console.log('🔧 Supabase SQL Query Runner');
  console.log('============================\n');
  
  // Read queries from files
  try {
    const policyQuery = await fs.readFile('scripts/run-policy-check.sql', 'utf-8');
    const indexQuery = await fs.readFile('scripts/run-index-check.sql', 'utf-8');
    
    await runQuery(policyQuery, 'Query 1: RLS Policy Optimization Check');
    await runQuery(indexQuery, 'Query 2: Index Count Check');
    
    console.log('\n✅ Queries ready to copy/paste into SQL Editor');
    console.log('\n💡 Tip: Supabase CLI doesn\'t support direct SQL execution.');
    console.log('   The SQL Editor is the recommended method.');
    
  } catch (error) {
    console.error('❌ Error reading query files:', error.message);
    process.exit(1);
  }
}

main();

