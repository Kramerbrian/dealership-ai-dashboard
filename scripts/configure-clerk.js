#!/usr/bin/env node
/**
 * Clerk Configuration Helper
 * This script helps configure Clerk authentication for production
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔐 Clerk Configuration Helper\n');
console.log('==========================================\n');

// Check if Clerk keys exist in Vercel
console.log('📋 Checking current Vercel environment variables...\n');

try {
  const envList = execSync('vercel env ls production', { encoding: 'utf-8' });

  const hasClerkPublishable = envList.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  const hasClerkSecret = envList.includes('CLERK_SECRET_KEY');

  console.log(`✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${hasClerkPublishable ? '✅ Found' : '❌ Missing'}`);
  console.log(`✓ CLERK_SECRET_KEY: ${hasClerkSecret ? '✅ Found' : '❌ Missing'}`);
  console.log('');

  // Pull current values
  if (hasClerkPublishable && hasClerkSecret) {
    console.log('📥 Pulling current environment variables...\n');
    execSync('vercel env pull --environment production .env.clerk.check', { stdio: 'inherit' });

    const envContent = fs.readFileSync('.env.clerk.check', 'utf-8');
    const publishableKey = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="?([^"\n]+)"?/)?.[1];

    if (publishableKey) {
      if (publishableKey.startsWith('pk_test_')) {
        console.log('⚠️  WARNING: Currently using TEST keys!\n');
        console.log('   Test Key:', publishableKey.substring(0, 20) + '...\n');
        console.log('📋 TO UPGRADE TO PRODUCTION:\n');
        console.log('   1. Go to: https://dashboard.clerk.com/');
        console.log('   2. Switch to Production environment (top-right toggle)');
        console.log('   3. Go to API Keys section');
        console.log('   4. Copy your Production keys (pk_live_... and sk_live_...)');
        console.log('   5. Run these commands:\n');
        console.log('   vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production');
        console.log('   vercel env rm CLERK_SECRET_KEY production');
        console.log('   echo "YOUR_PK_LIVE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production');
        console.log('   echo "YOUR_SK_LIVE_KEY" | vercel env add CLERK_SECRET_KEY production');
        console.log('   vercel --prod\n');
      } else if (publishableKey.startsWith('pk_live_')) {
        console.log('✅ Using PRODUCTION keys!\n');
        console.log('   Production Key:', publishableKey.substring(0, 20) + '...\n');
      } else {
        console.log('❓ Unknown key format:', publishableKey.substring(0, 20) + '...\n');
      }
    }

    // Clean up temp file
    fs.unlinkSync('.env.clerk.check');
  }

  console.log('\n==========================================');
  console.log('📚 Clerk Dashboard: https://dashboard.clerk.com/');
  console.log('📖 Clerk Docs: https://clerk.com/docs');
  console.log('==========================================\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
