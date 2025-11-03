#!/usr/bin/env tsx
/**
 * Environment Variables Verification Script
 * 
 * Checks that all required environment variables are set
 * Usage: tsx scripts/verify-env-vars.ts
 */

const requiredVars = {
  // Core App
  NODE_ENV: { required: true, description: 'Node environment (production/development)' },
  NEXT_PUBLIC_APP_URL: { required: true, description: 'Public app URL' },
  
  // Database
  DATABASE_URL: { required: true, description: 'PostgreSQL database connection string' },
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: { required: true, description: 'Clerk publishable key' },
  CLERK_SECRET_KEY: { required: true, description: 'Clerk secret key' },
  
  // Supabase (if using)
  NEXT_PUBLIC_SUPABASE_URL: { required: false, description: 'Supabase project URL' },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: { required: false, description: 'Supabase anonymous key' },
  SUPABASE_SERVICE_ROLE_KEY: { required: false, description: 'Supabase service role key' },
  
  // Rate Limiting
  UPSTASH_REDIS_REST_URL: { required: false, description: 'Upstash Redis REST URL' },
  UPSTASH_REDIS_REST_TOKEN: { required: false, description: 'Upstash Redis REST token' },
  
  // Monitoring (Optional)
  SENTRY_DSN: { required: false, description: 'Sentry DSN for error tracking' },
  NEXT_PUBLIC_SENTRY_DSN: { required: false, description: 'Sentry public DSN' },
  SENTRY_ORG: { required: false, description: 'Sentry organization' },
  SENTRY_PROJECT: { required: false, description: 'Sentry project' },
  LOGTAIL_TOKEN: { required: false, description: 'LogTail token for structured logging' },
  
  // Analytics
  NEXT_PUBLIC_GA: { required: false, description: 'Google Analytics ID' },
  
  // AI Providers (if using)
  OPENAI_API_KEY: { required: false, description: 'OpenAI API key' },
  ANTHROPIC_API_KEY: { required: false, description: 'Anthropic API key' },
  GEMINI_API_KEY: { required: false, description: 'Google Gemini API key' },
  
  // Stripe (if using)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: { required: false, description: 'Stripe publishable key' },
  STRIPE_SECRET_KEY: { required: false, description: 'Stripe secret key' },
  STRIPE_WEBHOOK_SECRET: { required: false, description: 'Stripe webhook secret' },
};

interface VarStatus {
  name: string;
  set: boolean;
  required: boolean;
  description: string;
  value?: string;
  masked: boolean;
}

function maskValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, visibleChars)}...${value.slice(-visibleChars)}`;
}

function checkEnvVars(): VarStatus[] {
  const results: VarStatus[] = [];
  
  for (const [name, config] of Object.entries(requiredVars)) {
    const value = process.env[name];
    const isSet = !!value;
    const isSecret = name.includes('SECRET') || name.includes('KEY') || name.includes('TOKEN') || name.includes('DSN');
    
    results.push({
      name,
      set: isSet,
      required: config.required,
      description: config.description,
      value: isSet ? value : undefined,
      masked: isSecret,
    });
  }
  
  return results;
}

function printResults(results: VarStatus[]) {
  console.log('\n🔍 Environment Variables Verification\n');
  console.log('=' .repeat(60));
  
  const required = results.filter(r => r.required);
  const optional = results.filter(r => !r.required);
  
  let allRequiredSet = true;
  
  // Required variables
  console.log('\n📋 Required Variables:\n');
  for (const result of required) {
    const status = result.set ? '✅' : '❌';
    const valueDisplay = result.set && result.masked 
      ? maskValue(result.value!) 
      : result.set 
        ? result.value 
        : 'NOT SET';
    
    if (!result.set) allRequiredSet = false;
    
    console.log(`  ${status} ${result.name.padEnd(40)} ${valueDisplay}`);
    console.log(`     ${result.description}`);
  }
  
  // Optional variables
  console.log('\n📋 Optional Variables:\n');
  for (const result of optional) {
    const status = result.set ? '✅' : '⚪';
    const valueDisplay = result.set && result.masked 
      ? maskValue(result.value!) 
      : result.set 
        ? result.value 
        : 'NOT SET';
    
    console.log(`  ${status} ${result.name.padEnd(40)} ${valueDisplay}`);
    console.log(`     ${result.description}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const requiredSet = required.filter(r => r.set).length;
  const requiredTotal = required.length;
  const optionalSet = optional.filter(r => r.set).length;
  const optionalTotal = optional.length;
  
  console.log(`  Required: ${requiredSet}/${requiredTotal} set ${allRequiredSet ? '✅' : '❌'}`);
  console.log(`  Optional: ${optionalSet}/${optionalTotal} set`);
  console.log(`  Total:    ${requiredSet + optionalSet}/${requiredTotal + optionalTotal} set`);
  
  if (!allRequiredSet) {
    console.log('\n❌ Missing required environment variables!');
    console.log('   Add them to Vercel: https://vercel.com/your-project/settings/environment-variables');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are set!');
  }
  
  // Recommendations
  if (optionalSet < optionalTotal) {
    console.log('\n💡 Recommendations:\n');
    const missingImportant = optional.filter(r => !r.set && (
      r.name.includes('SENTRY') || 
      r.name.includes('LOGTAIL') || 
      r.name.includes('REDIS') ||
      r.name.includes('STRIPE')
    ));
    
    if (missingImportant.length > 0) {
      console.log('  Consider adding these for better production monitoring:');
      for (const var_ of missingImportant) {
        console.log(`    - ${var_.name}: ${var_.description}`);
      }
    }
  }
  
  console.log('');
}

// Main execution
try {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config({ path: '.env' });
  
  const results = checkEnvVars();
  printResults(results);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error checking environment variables:', error);
  process.exit(1);
}

