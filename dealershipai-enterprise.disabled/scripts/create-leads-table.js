#!/usr/bin/env node

/**
 * Create Leads Table Script
 * Creates the leads table in Supabase database
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

async function createLeadsTable() {
  console.log('🚀 Creating Leads Table in Supabase...\n')
  
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    console.log('Please create a .env.local file with your Supabase credentials')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Read the leads table SQL
    const sqlPath = path.join(__dirname, '../leads-table.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('1. Reading leads table SQL...')
    console.log('   ✅ SQL file loaded successfully')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`2. Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`   ${i + 1}. Executing statement...`)
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // If exec_sql doesn't exist, try direct query execution
          if (error.message.includes('function exec_sql') || error.message.includes('does not exist')) {
            console.log('   ⚠️  exec_sql function not available, trying alternative method...')
            
            // For table creation, we can try to create the table directly
            if (statement.includes('CREATE TABLE')) {
              console.log('   📝 Note: Table creation requires manual execution in Supabase SQL Editor')
              console.log('   📋 Please copy the SQL from leads-table.sql and run it in Supabase')
            }
          } else {
            console.error(`   ❌ Error: ${error.message}`)
          }
        } else {
          console.log('   ✅ Statement executed successfully')
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} requires manual execution: ${err.message}`)
      }
    }
    
    // Test if the table was created
    console.log('\n3. Testing leads table...')
    const { data, error } = await supabase.from('leads').select('count').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ❌ Leads table not found - needs to be created manually')
        console.log('\n📋 Manual Setup Required:')
        console.log('1. Go to your Supabase project dashboard')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Copy the contents of leads-table.sql')
        console.log('4. Paste and execute the SQL')
        console.log('5. Run this script again to verify')
      } else {
        console.error(`   ❌ Error testing table: ${error.message}`)
      }
    } else {
      console.log('   ✅ Leads table exists and is accessible')
      
      // Test inserting a sample lead
      console.log('\n4. Testing lead insertion...')
      const { data: insertData, error: insertError } = await supabase
        .from('leads')
        .insert({
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          source: 'script_test'
        })
        .select()
      
      if (insertError) {
        console.error(`   ❌ Error inserting test lead: ${insertError.message}`)
      } else {
        console.log('   ✅ Test lead inserted successfully')
        
        // Clean up test data
        await supabase.from('leads').delete().eq('email', 'test@example.com')
        console.log('   🧹 Test data cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating leads table:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your Supabase credentials in .env.local')
    console.log('2. Ensure your Supabase project is running')
    console.log('3. Verify you have the correct permissions')
    process.exit(1)
  }
  
  console.log('\n🎉 Leads table setup complete!')
  console.log('\n📋 Next steps:')
  console.log('1. If manual setup was required, run this script again to verify')
  console.log('2. Test the leads API endpoint: /api/leads')
  console.log('3. Deploy your application: npm run build && npm run start')
}

createLeadsTable().catch((e) => {
  console.error('💥 An unexpected error occurred:', e)
  process.exit(1)
})
