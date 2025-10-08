#!/usr/bin/env node

/**
 * Production Deployment Script
 * Helps deploy DealershipAI Enterprise to production
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completed`)
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message)
    process.exit(1)
  }
}

function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${description} not found: ${filePath}`)
    console.log('Please create this file before deploying')
    process.exit(1)
  }
  console.log(`✅ ${description} found`)
}

function checkEnvVar(envVar, description) {
  if (!process.env[envVar]) {
    console.error(`❌ ${description} not set: ${envVar}`)
    console.log('Please set this environment variable before deploying')
    process.exit(1)
  }
  console.log(`✅ ${description} configured`)
}

async function deployProduction() {
  console.log('🚀 DealershipAI Enterprise Production Deployment\n')
  
  // Pre-deployment checks
  console.log('📋 Running pre-deployment checks...')
  
  // Check required files
  checkFileExists('.env.local', 'Environment file')
  checkFileExists('supabase-schema.sql', 'Database schema')
  checkFileExists('package.json', 'Package configuration')
  checkFileExists('next.config.js', 'Next.js configuration')
  
  // Check required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ]
  
  console.log('\n🔍 Checking environment variables...')
  for (const envVar of requiredEnvVars) {
    checkEnvVar(envVar, envVar)
  }
  
  // Optional environment variables
  const optionalEnvVars = [
    'STRIPE_SECRET_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'GOOGLE_AI_API_KEY',
  ]
  
  console.log('\n🔍 Checking optional environment variables...')
  let optionalCount = 0
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} configured`)
      optionalCount++
    } else {
      console.log(`⚠️  ${envVar} not set (optional)`)
    }
  }
  
  if (optionalCount === 0) {
    console.log('\n⚠️  No optional services configured. Some features may not work.')
    console.log('Consider setting up Stripe and AI APIs for full functionality.')
  }
  
  // Build and test
  console.log('\n🔨 Building application...')
  runCommand('npm run build', 'Application build')
  
  // Run tests
  console.log('\n🧪 Running tests...')
  try {
    runCommand('npm run db:test', 'Database connection test')
  } catch (error) {
    console.log('⚠️  Database test failed - make sure DATABASE_URL is correct')
  }
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' })
    console.log('✅ Vercel CLI found')
  } catch (error) {
    console.log('⚠️  Vercel CLI not found. Install with: npm i -g vercel')
    console.log('You can still deploy via Vercel dashboard')
  }
  
  // Deployment options
  console.log('\n🚀 Deployment Options:')
  console.log('1. Deploy with Vercel CLI (recommended)')
  console.log('2. Deploy via Vercel Dashboard')
  console.log('3. Deploy to other platform')
  
  console.log('\n📋 Next Steps:')
  console.log('1. Set up Supabase database with schema')
  console.log('2. Configure Stripe products and webhooks')
  console.log('3. Set up AI API keys')
  console.log('4. Deploy to Vercel')
  console.log('5. Configure environment variables in Vercel')
  console.log('6. Test all functionality')
  
  console.log('\n📚 Documentation:')
  console.log('- Database setup: SUPABASE-SETUP-GUIDE.md')
  console.log('- AI APIs: AI-API-SETUP-GUIDE.md')
  console.log('- Stripe: Check Stripe documentation')
  console.log('- Deployment: FINAL-DEPLOYMENT-GUIDE.md')
  
  console.log('\n🎉 Pre-deployment checks completed!')
  console.log('Your application is ready for production deployment.')
}

// Run deployment
deployProduction()
  .catch((error) => {
    console.error('💥 Deployment preparation failed:', error)
    process.exit(1)
  })
