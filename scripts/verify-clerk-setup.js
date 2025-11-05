#!/usr/bin/env node

/**
 * Verify Clerk Environment Variables Setup
 * 
 * Checks if Clerk keys are properly configured locally and provides
 * instructions for Vercel setup.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Clerk Setup...\n');

// Check .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
let hasLocalKeys = false;
let publishableKey = '';
let secretKey = '';

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=')) {
      publishableKey = line.split('=')[1]?.trim() || '';
      if (publishableKey && (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))) {
        hasLocalKeys = true;
      }
    }
    if (line.startsWith('CLERK_SECRET_KEY=')) {
      secretKey = line.split('=')[1]?.trim() || '';
      if (secretKey && (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_'))) {
        hasLocalKeys = hasLocalKeys && true;
      }
    }
  });
}

console.log('📋 Local Environment (.env.local):');
if (hasLocalKeys && publishableKey && secretKey) {
  console.log('  ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Found');
  console.log(`     Key: ${publishableKey.substring(0, 20)}...${publishableKey.substring(publishableKey.length - 4)}`);
  console.log('  ✅ CLERK_SECRET_KEY: Found');
  console.log(`     Key: ${secretKey.substring(0, 20)}...${secretKey.substring(secretKey.length - 4)}`);
  console.log('\n  ✅ Local setup complete!');
} else {
  console.log('  ❌ Clerk keys not found or invalid');
  console.log('     Expected format:');
  console.log('     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... or pk_live_...');
  console.log('     - CLERK_SECRET_KEY=sk_test_... or sk_live_...');
}

// Check Vercel CLI
console.log('\n📋 Vercel Environment:');
try {
  const { execSync } = require('child_process');
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('  ✅ Vercel CLI installed');
  
  // Try to check if keys are set in Vercel
  try {
    const vercelEnv = execSync('vercel env ls 2>/dev/null | grep CLERK || echo ""', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (vercelEnv.trim()) {
      console.log('  ✅ Clerk keys found in Vercel:');
      vercelEnv.trim().split('\n').forEach(line => {
        if (line.includes('CLERK')) {
          console.log(`     ${line.trim()}`);
        }
      });
    } else {
      console.log('  ⚠️  Clerk keys not found in Vercel');
      console.log('     Run: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
      console.log('     Run: vercel env add CLERK_SECRET_KEY');
    }
  } catch (e) {
    console.log('  ⚠️  Could not check Vercel environment (may need to login)');
    console.log('     Run: vercel login');
  }
} catch (e) {
  console.log('  ⚠️  Vercel CLI not installed');
  console.log('     Install: npm i -g vercel');
  console.log('     Or configure via Vercel Dashboard');
}

// Next steps
console.log('\n📝 Next Steps:');
if (hasLocalKeys) {
  console.log('  1. ✅ Local environment configured');
  console.log('  2. Test locally: npm run dev');
  console.log('  3. Configure Vercel environment variables:');
  console.log('     - Go to Vercel Dashboard → Project → Settings → Environment Variables');
  console.log('     - Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (for Production, Preview, Development)');
  console.log('     - Add CLERK_SECRET_KEY (for Production, Preview, Development)');
  console.log('  4. Configure Clerk Dashboard redirect URLs:');
  console.log('     - https://dealershipai.com/onboarding');
  console.log('     - https://dealershipai.com/dashboard');
  console.log('     - http://localhost:3000/onboarding');
} else {
  console.log('  1. Get Clerk keys from: https://clerk.com → Your App → API Keys');
  console.log('  2. Add to .env.local:');
  console.log('     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...');
  console.log('     CLERK_SECRET_KEY=sk_test_...');
  console.log('  3. Restart dev server: npm run dev');
}

console.log('\n✨ Setup verification complete!\n');

