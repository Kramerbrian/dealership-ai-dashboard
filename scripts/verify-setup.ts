/**
 * Verify DealershipAI Setup
 * Checks if all required environment variables and configurations are set
 */

import { env } from '@/lib/env';

function checkEnvVar(name: string, value: string | undefined, required = false) {
  if (!value && required) {
    console.error(`❌ Missing required: ${name}`);
    return false;
  } else if (!value) {
    console.log(`⚠️  Optional (not set): ${name}`);
    return true;
  } else {
    console.log(`✅ ${name}: Set`);
    return true;
  }
}

console.log('🔍 Checking DealershipAI Setup...\n');

// Required for core functionality
const required = [
  checkEnvVar('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, true),
  checkEnvVar('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY, true),
];

// Optional (demo mode works without)
const optional = [
  checkEnvVar('FLEET_API_BASE', env.FLEET_API_BASE, false),
  checkEnvVar('X_API_KEY', env.X_API_KEY, false),
  checkEnvVar('DEFAULT_TENANT', env.DEFAULT_TENANT, false),
  checkEnvVar('UPSTASH_REDIS_REST_URL', process.env.UPSTASH_REDIS_REST_URL, false),
  checkEnvVar('UPSTASH_REDIS_REST_TOKEN', process.env.UPSTASH_REDIS_REST_TOKEN, false),
];

console.log('\n📊 Summary:');
const allRequired = required.every(r => r);
if (allRequired) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Ready to run: npm run dev');
} else {
  console.log('❌ Missing required environment variables');
  console.log('   Set them in .env.local or Vercel dashboard');
}

console.log('\n💡 Optional variables enable additional features:');
console.log('   - Fleet API: Real backend integration');
console.log('   - Redis: Caching and rate limiting');
console.log('   - Without these: Demo mode (works fine for testing)');

