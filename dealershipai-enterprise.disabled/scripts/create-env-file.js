#!/usr/bin/env node

/**
 * Environment File Creation Helper
 * Helps create .env.local file with proper structure
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

async function createEnvFile() {
  console.log('🚀 DealershipAI Environment File Setup\n')
  
  console.log('This script will help you create a .env.local file with your Supabase credentials.\n')
  
  // Get Supabase credentials
  const projectUrl = await question('Enter your Supabase Project URL (https://[project-ref].supabase.co): ')
  const anonKey = await question('Enter your Supabase Anon Key: ')
  const serviceRoleKey = await question('Enter your Supabase Service Role Key: ')
  const databaseUrl = await question('Enter your Database URL (postgresql://...): ')
  
  // Create .env.local content
  const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="${projectUrl}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"
SUPABASE_SERVICE_ROLE_KEY="${serviceRoleKey}"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Clerk Authentication (Alternative)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Google APIs
GOOGLE_API_KEY="AIza..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# SEO Tools
AHREFS_API_KEY="..."
SEMRUSH_API_KEY="..."
PAGESPEED_API_KEY="AIzaSyBVvR8Q_VqMVHCbvQGqG7LqVW0m8h6QDIY"

# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Feature Flags
ENABLE_REAL_AI_QUERIES="false"
SYNTHETIC_CONFIDENCE="0.9"
CACHE_TTL_HOURS="24"
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('\n✅ Created .env.local file with your Supabase credentials')
    console.log('\n📋 Next steps:')
    console.log('1. Run the database schema in Supabase SQL Editor')
    console.log('2. Test the connection: npm run db:test')
    console.log('3. Start development server: npm run dev')
    console.log('4. Test tRPC: http://localhost:3000/trpc-test')
    
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message)
    console.log('\n🔧 Manual setup:')
    console.log('1. Create a file called .env.local in your project root')
    console.log('2. Copy the template from env.example')
    console.log('3. Replace the placeholder values with your real credentials')
    process.exit(1)
  }
  
  rl.close()
}

// Run the setup
createEnvFile()
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
