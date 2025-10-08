#!/usr/bin/env node

/**
 * Run Database Schema Script using Supabase Client
 * Executes the clean-schema.sql file against the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runSchema() {
  console.log('🚀 Running DealershipAI Database Schema via Supabase...\n');

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Test connection
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.from('tenants').select('count').limit(1);
    
    if (error && error.code === 'PGRST205') {
      console.log('   ✅ Connected successfully (tables not yet created)\n');
    } else if (error) {
      throw new Error(`Connection failed: ${error.message}`);
    } else {
      console.log('   ✅ Connected successfully\n');
    }

    // Read the schema file
    console.log('2. Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'clean-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('   ✅ Schema file loaded\n');

    // Split the SQL into individual statements
    console.log('3. Executing database schema...');
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`   📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.log(`   ⚠️  Statement ${i + 1} warning: ${error.message}`);
        } else {
          console.log(`   ✅ Statement ${i + 1} executed`);
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} error: ${err.message}`);
      }
    }

    console.log('\n4. Verifying tables...');
    
    // Check if tables exist by trying to query them
    const tables = ['tenants', 'users', 'dealership_data', 'score_history', 'competitors', 'market_analysis', 'audit_log', 'api_usage'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error && error.code === 'PGRST205') {
          console.log(`   ❌ Table '${table}' not found`);
        } else {
          console.log(`   ✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}' error: ${err.message}`);
      }
    }

    console.log('\n🎉 Database schema execution attempted!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify tables were created');
    console.log('2. Run: npm run db:test');
    console.log('3. Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase credentials in .env.local');
    console.log('2. Verify your Supabase project is running');
    console.log('3. Try running the schema manually in Supabase SQL Editor');
    process.exit(1);
  }
}

runSchema().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
