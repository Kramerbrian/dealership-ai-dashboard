#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the connection to Supabase and verifies schema
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testDatabaseConnection() {
  console.log('🔍 Testing DealershipAI Database Connection...\n')
  
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    console.log('1. Testing Supabase connection...')
    const { data, error } = await supabase.from('tenants').select('count').limit(1)
    
    if (error && error.code === 'PGRST205') {
      console.log('   ✅ Supabase connection successful (tables not yet created)\n')
    } else if (error) {
      throw new Error(`Connection failed: ${error.message}`)
    } else {
      console.log('   ✅ Supabase connection successful\n')
    }
    
    // Test schema tables
    console.log('2. Testing schema tables...')
    
    const tables = [
      'tenants',
      'users', 
      'dealership_data',
      'score_history',
      'competitors',
      'market_analysis',
      'audit_log',
      'api_usage'
    ]
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        
        if (error && error.code === 'PGRST205') {
          console.log(`   ❌ Table '${table}' not found`)
        } else {
          console.log(`   ✅ Table '${table}' exists`)
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}' error: ${err.message}`)
      }
    }
    
    // Test sample data
    console.log('\n3. Testing sample data...')
    
    try {
      const { data: tenants, error: tenantError } = await supabase.from('tenants').select('*')
      if (!tenantError && tenants) {
        console.log(`   ✅ Tenants: ${tenants.length} records`)
        if (tenants.length > 0) {
          console.log(`      - ${tenants[0].name} (${tenants[0].type})`)
        }
      }
    } catch (err) {
      console.log('   ❌ Tenants: Error checking data')
    }
    
    try {
      const { data: users, error: userError } = await supabase.from('users').select('*')
      if (!userError && users) {
        console.log(`   ✅ Users: ${users.length} records`)
        if (users.length > 0) {
          console.log(`      - ${users[0].full_name} (${users[0].role})`)
        }
      }
    } catch (err) {
      console.log('   ❌ Users: Error checking data')
    }
    
    try {
      const { data: dealerships, error: dealerError } = await supabase.from('dealership_data').select('*')
      if (!dealerError && dealerships) {
        console.log(`   ✅ Dealerships: ${dealerships.length} records`)
        if (dealerships.length > 0) {
          console.log(`      - ${dealerships[0].name} (AI Score: ${dealerships[0].ai_visibility_score})`)
        }
      }
    } catch (err) {
      console.log('   ❌ Dealerships: Error checking data')
    }
    
    // Test tRPC database integration
    console.log('\n4. Testing tRPC database integration...')
    try {
      // Test the db module we created
      const { db } = require('../src/lib/db.js')
      
      const users = await db.user.findMany()
      console.log(`   ✅ tRPC db.user.findMany(): ${users.length} users`)
      
      const tenants = await db.tenant.findMany()
      console.log(`   ✅ tRPC db.tenant.findMany(): ${tenants.length} tenants`)
      
      const dealerships = await db.dealershipData.findMany()
      console.log(`   ✅ tRPC db.dealershipData.findMany(): ${dealerships.length} dealerships`)
      
    } catch (err) {
      console.log(`   ❌ tRPC database integration error: ${err.message}`)
    }
    
    console.log('\n🎉 Database setup verification complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Visit: http://localhost:3000/dashboard')
    console.log('3. Test tRPC endpoints: http://localhost:3000/api/trpc')
    console.log('4. Test tRPC page: http://localhost:3000/trpc-test')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your Supabase credentials in .env.local')
    console.log('2. Verify your Supabase project is running')
    console.log('3. Run the schema migration in Supabase SQL Editor')
    console.log('4. Check your database password and connection string')
    process.exit(1)
  }
}

testDatabaseConnection().catch((e) => {
  console.error('💥 An unexpected error occurred during database test:', e)
  process.exit(1)
})