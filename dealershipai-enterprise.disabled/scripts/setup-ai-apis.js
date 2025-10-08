#!/usr/bin/env node

/**
 * AI API Setup Helper Script
 * Helps configure AI API keys for the DealershipAI application
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

async function setupAIAPIs() {
  console.log('🤖 DealershipAI AI API Setup Helper\n')
  
  console.log('This script will help you configure AI API keys for your DealershipAI application.\n')
  
  console.log('Required API Keys:')
  console.log('1. Anthropic (Claude) - Primary AI engine')
  console.log('2. OpenAI (GPT-4) - Secondary AI engine') 
  console.log('3. Google AI (Gemini) - Third AI engine\n')
  
  // Get API keys
  const anthropicKey = await question('Enter your Anthropic API key (sk-ant-...): ')
  const openaiKey = await question('Enter your OpenAI API key (sk-...): ')
  const googleKey = await question('Enter your Google AI API key: ')
  
  // Optional model overrides
  const anthropicModel = await question('Anthropic model (press Enter for claude-3-5-sonnet-20241022): ') || 'claude-3-5-sonnet-20241022'
  const openaiModel = await question('OpenAI model (press Enter for gpt-4o): ') || 'gpt-4o'
  const googleModel = await question('Google model (press Enter for gemini-1.5-pro): ') || 'gemini-1.5-pro'
  
  // Create .env.local content
  const envContent = `# AI API Keys
ANTHROPIC_API_KEY="${anthropicKey}"
OPENAI_API_KEY="${openaiKey}"
GOOGLE_AI_API_KEY="${googleKey}"

# AI Model Configuration
ANTHROPIC_MODEL="${anthropicModel}"
OPENAI_MODEL="${openaiModel}"
GOOGLE_MODEL="${googleModel}"

# AI Configuration
ANTHROPIC_MAX_TOKENS="4000"
OPENAI_MAX_TOKENS="4000"
GOOGLE_MAX_TOKENS="4000"
AI_TEMPERATURE="0.7"

# Existing environment variables (preserve these)
DATABASE_URL="${process.env.DATABASE_URL || ''}"
NEXT_PUBLIC_SUPABASE_URL="${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}"
SUPABASE_SERVICE_ROLE_KEY="${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}"
NEXTAUTH_URL="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}"
NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET || 'your-secret-key-here'}"
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    // Read existing .env.local if it exists
    let existingEnv = ''
    if (fs.existsSync(envPath)) {
      existingEnv = fs.readFileSync(envPath, 'utf8')
    }
    
    // Merge with existing environment variables
    const mergedEnv = mergeEnvFiles(existingEnv, envContent)
    
    fs.writeFileSync(envPath, mergedEnv)
    console.log('\n✅ Updated .env.local file with AI API keys')
  } catch (error) {
    console.error('❌ Failed to update .env.local:', error.message)
    process.exit(1)
  }
  
  // Test AI APIs
  console.log('\n🧪 Testing AI API connectivity...')
  
  try {
    const { testAIConnectivity } = require('../src/lib/ai-apis')
    const connectivity = await testAIConnectivity()
    
    console.log('\n📊 AI API Test Results:')
    console.log(`   Anthropic: ${connectivity.anthropic ? '✅ Connected' : '❌ Failed'}`)
    console.log(`   OpenAI: ${connectivity.openai ? '✅ Connected' : '❌ Failed'}`)
    console.log(`   Google: ${connectivity.google ? '✅ Connected' : '❌ Failed'}`)
    
    const connectedCount = Object.values(connectivity).filter(Boolean).length
    if (connectedCount === 0) {
      console.log('\n⚠️  No AI APIs are working. Please check your API keys.')
    } else if (connectedCount < 3) {
      console.log(`\n⚠️  Only ${connectedCount}/3 AI APIs are working. Some features may be limited.`)
    } else {
      console.log('\n🎉 All AI APIs are working correctly!')
    }
    
  } catch (error) {
    console.error('❌ AI API test failed:', error.message)
    console.log('\n📋 Next steps:')
    console.log('1. Check your API keys are correct')
    console.log('2. Ensure you have internet connectivity')
    console.log('3. Try running: npm run test:ai-apis')
  }
  
  console.log('\n🎉 AI API setup completed!')
  console.log('\n📋 Next steps:')
  console.log('1. Start your development server: npm run dev')
  console.log('2. Test AI queries: curl "http://localhost:3000/api/ai/test?test=true"')
  console.log('3. View AI status: curl "http://localhost:3000/api/ai/test"')
  console.log('4. Deploy to production with environment variables')
  
  rl.close()
}

function mergeEnvFiles(existingEnv, newEnv) {
  const existingLines = existingEnv.split('\n')
  const newLines = newEnv.split('\n')
  
  const merged = []
  const processedKeys = new Set()
  
  // Add new environment variables
  for (const line of newLines) {
    if (line.trim() && !line.startsWith('#')) {
      const key = line.split('=')[0]
      if (key) {
        processedKeys.add(key)
        merged.push(line)
      }
    } else if (line.startsWith('#')) {
      merged.push(line)
    }
  }
  
  // Add existing environment variables that weren't overridden
  for (const line of existingLines) {
    if (line.trim() && !line.startsWith('#')) {
      const key = line.split('=')[0]
      if (key && !processedKeys.has(key)) {
        merged.push(line)
      }
    } else if (line.startsWith('#')) {
      merged.push(line)
    }
  }
  
  return merged.join('\n')
}

// Run the setup
setupAIAPIs()
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
