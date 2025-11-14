/**
 * Environment Variables Verification Script
 * 
 * Run: npx tsx scripts/verify-env.ts
 * 
 * Checks all required and optional environment variables
 * and provides a detailed report.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local if it exists
config({ path: resolve(process.cwd(), '.env.local') });
// Also load .env as fallback
config();

const REQUIRED_VARS = {
  production: [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ],
  optional: [
    'NEXT_PUBLIC_BASE_URL',
    'DATABASE_URL',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'SENDGRID_API_KEY',
    'RESEND_API_KEY',
    'GOOGLE_ANALYTICS_ID',
  ],
};

interface EnvCheck {
  key: string;
  present: boolean;
  value?: string;
  masked?: string;
  category: 'required' | 'optional';
  notes?: string;
}

function maskValue(value: string): string {
  if (value.length <= 8) return '***';
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

function checkEnvVars(): EnvCheck[] {
  const checks: EnvCheck[] = [];

  // Check required vars
  for (const key of REQUIRED_VARS.production) {
    const value = process.env[key];
    checks.push({
      key,
      present: !!value,
      value: value,
      masked: value ? maskValue(value) : undefined,
      category: 'required',
      notes: !value ? '❌ MISSING - This will break /dash authentication' : undefined,
    });
  }

  // Check optional vars
  for (const key of REQUIRED_VARS.optional) {
    const value = process.env[key];
    checks.push({
      key,
      present: !!value,
      value: value,
      masked: value ? maskValue(value) : undefined,
      category: 'optional',
      notes: !value ? '⚠️  Not set (optional, but may be needed for some features)' : undefined,
    });
  }

  return checks;
}

function printReport(checks: EnvCheck[]) {
  console.log('\n🔍 Environment Variables Verification Report\n');
  console.log('=' .repeat(60));

  const required = checks.filter(c => c.category === 'required');
  const optional = checks.filter(c => c.category === 'optional');

  // Required vars
  console.log('\n📋 REQUIRED VARIABLES (Production)');
  console.log('-'.repeat(60));
  let allRequiredPresent = true;
  
  for (const check of required) {
    const status = check.present ? '✅' : '❌';
    console.log(`${status} ${check.key}`);
    if (check.present && check.masked) {
      console.log(`   Value: ${check.masked}`);
    }
    if (check.notes) {
      console.log(`   ${check.notes}`);
    }
    if (!check.present) {
      allRequiredPresent = false;
    }
  }

  // Optional vars
  console.log('\n📋 OPTIONAL VARIABLES');
  console.log('-'.repeat(60));
  
  for (const check of optional) {
    const status = check.present ? '✅' : '⚠️ ';
    console.log(`${status} ${check.key}`);
    if (check.present && check.masked) {
      console.log(`   Value: ${check.masked}`);
    }
    if (check.notes) {
      console.log(`   ${check.notes}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY\n');
  
  const requiredCount = required.filter(c => c.present).length;
  const optionalCount = optional.filter(c => c.present).length;
  
  console.log(`Required: ${requiredCount}/${required.length} set`);
  console.log(`Optional: ${optionalCount}/${optional.length} set`);
  
  if (allRequiredPresent) {
    console.log('\n✅ All required variables are set! Ready for production.');
  } else {
    console.log('\n❌ Missing required variables! Fix before deploying.');
    console.log('\nTo set in Vercel:');
    console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('2. Add each missing variable');
    console.log('3. Redeploy the project');
  }

  console.log('\n' + '='.repeat(60));
}

// Run the check
const checks = checkEnvVars();
printReport(checks);

// Exit with error code if required vars are missing
const missingRequired = checks.filter(c => c.category === 'required' && !c.present);
process.exit(missingRequired.length > 0 ? 1 : 0);

