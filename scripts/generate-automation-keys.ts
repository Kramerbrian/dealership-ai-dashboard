/**
 * Generate Secure Automation Keys
 * 
 * Run: npm run generate:automation-keys
 * 
 * This generates secure random keys for automation endpoints
 */

import crypto from 'crypto';

function generateSecureKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Key(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

console.log('🔐 Generating secure automation keys...\n');

const automationApiKey = generateSecureKey(32);
const cronSecret = generateSecureKey(32);
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

console.log('Add these to your .env file:\n');
console.log('# Automation Keys');
console.log(`AUTOMATION_API_KEY=${automationApiKey}`);
console.log(`CRON_SECRET=${cronSecret}`);
console.log(`NEXT_PUBLIC_APP_URL=${appUrl}`);
console.log('\n');

console.log('For Vercel, add these as environment variables:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Add each variable for Production, Preview, and Development');
console.log('\n');

console.log('📋 Copy-paste ready .env additions:');
console.log('─'.repeat(60));
console.log(`AUTOMATION_API_KEY=${automationApiKey}`);
console.log(`CRON_SECRET=${cronSecret}`);
console.log(`NEXT_PUBLIC_APP_URL=${appUrl}`);
console.log('─'.repeat(60));
console.log('\n');

console.log('✅ Keys generated successfully!');
console.log('⚠️  Keep these keys secure and never commit them to git!');

