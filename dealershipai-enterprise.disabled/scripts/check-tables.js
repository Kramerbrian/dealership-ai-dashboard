#!/usr/bin/env node

/**
 * Check Existing Tables Script
 * Shows what tables already exist in the database
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function checkTables() {
  console.log('🔍 Checking existing tables in Supabase...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Check each table
    const tables = [
      'tenants',
      'users', 
      'dealership_data',
      'score_history',
      'competitors',
      'market_analysis',
      'audit_log',
      'api_usage'
    ];

    console.log('📋 Table Status:');
    console.log('='.repeat(50));

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        
        if (error && error.code === 'PGRST205') {
          console.log(`❌ ${table.padEnd(20)} - Not found`);
        } else if (error) {
          console.log(`⚠️  ${table.padEnd(20)} - Error: ${error.message}`);
        } else {
          console.log(`✅ ${table.padEnd(20)} - Exists`);
        }
      } catch (err) {
        console.log(`❌ ${table.padEnd(20)} - Error: ${err.message}`);
      }
    }

    console.log('\n📊 Sample Data Check:');
    console.log('='.repeat(50));

    // Check for sample data
    try {
      const { data: tenants, error: tenantError } = await supabase.from('tenants').select('count');
      if (!tenantError && tenants) {
        console.log(`✅ Tenants: ${tenants.length} records`);
      }
    } catch (err) {
      console.log('❌ Tenants: Error checking data');
    }

    try {
      const { data: users, error: userError } = await supabase.from('users').select('count');
      if (!userError && users) {
        console.log(`✅ Users: ${users.length} records`);
      }
    } catch (err) {
      console.log('❌ Users: Error checking data');
    }

    try {
      const { data: dealerships, error: dealerError } = await supabase.from('dealership_data').select('count');
      if (!dealerError && dealerships) {
        console.log(`✅ Dealerships: ${dealerships.length} records`);
      }
    } catch (err) {
      console.log('❌ Dealerships: Error checking data');
    }

    console.log('\n🎯 Recommendations:');
    console.log('='.repeat(50));
    
    // Check if we have all tables
    const allTablesExist = tables.every(async (table) => {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        return !error || error.code !== 'PGRST205';
      } catch {
        return false;
      }
    });

    console.log('If some tables are missing:');
    console.log('1. Run the remaining parts of the schema manually');
    console.log('2. Or reset and recreate all tables');
    console.log('\nIf all tables exist:');
    console.log('1. Run: npm run db:test');
    console.log('2. Start development: npm run dev');

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

checkTables();
