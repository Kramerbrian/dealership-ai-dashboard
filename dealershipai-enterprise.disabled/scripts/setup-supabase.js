#!/usr/bin/env node

/**
 * Supabase Setup Helper Script
 * Helps configure Supabase database and environment variables
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupSupabase() {
  console.log('🚀 DealershipAI Supabase Setup Helper\n')
  
  console.log('This script will help you configure Supabase for your DealershipAI application.\n')
  
  // Get Supabase credentials
  const projectUrl = await question('Enter your Supabase Project URL (https://[project-ref].supabase.co): ')
  const anonKey = await question('Enter your Supabase Anon Key: ')
  const serviceRoleKey = await question('Enter your Supabase Service Role Key: ')
  const databaseUrl = await question('Enter your Database URL (postgresql://...): ')
  
  // Create .env.local file
  const envContent = `# Supabase Configuration
DATABASE_URL="${databaseUrl}"
NEXT_PUBLIC_SUPABASE_URL="${projectUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"
SUPABASE_SERVICE_ROLE_KEY="${serviceRoleKey}"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ Created .env.local file with your Supabase credentials')
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message)
    process.exit(1)
  }
  
  // Test database connection
  console.log('\n🔍 Testing database connection...')
  
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if schema exists
    const tenantCount = await prisma.tenant.count()
    console.log(`✅ Found ${tenantCount} tenants in database`)
    
    if (tenantCount === 0) {
      console.log('\n⚠️  No data found in database. You may need to run the schema migration.')
      console.log('   Go to your Supabase dashboard → SQL Editor')
      console.log('   Copy and paste the contents of supabase-schema.sql')
      console.log('   Run the query to create the database schema')
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.log('\n📋 Next steps:')
    console.log('1. Make sure your Supabase project is fully initialized')
    console.log('2. Check your DATABASE_URL format')
    console.log('3. Run the schema migration in Supabase SQL Editor')
    process.exit(1)
  }
  
  console.log('\n🎉 Supabase setup completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Run: npm run db:generate')
  console.log('2. Run: npm run db:test')
  console.log('3. Start your development server: npm run dev')
  console.log('4. Visit: http://localhost:3000/test-auth')
  
  rl.close()
}

// Run the setup
setupSupabase()
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
