#!/usr/bin/env node

/**
 * Middleware Audit Script
 * 
 * This script helps diagnose middleware issues by:
 * 1. Checking environment variables
 * 2. Verifying Clerk configuration
 * 3. Testing middleware logic
 * 4. Providing diagnostic information
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DealershipAI Middleware Audit\n');
console.log('='.repeat(50));

// 1. Check environment variables
console.log('\n1. Environment Variables Check:');
console.log('-'.repeat(50));

const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
];

let hasAllRequired = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${envVar}: ${masked}`);
  } else {
    console.log(`❌ ${envVar}: MISSING`);
    hasAllRequired = false;
  }
});

optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`ℹ️  ${envVar}: ${value}`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (optional)`);
  }
});

// 2. Check middleware.ts file
console.log('\n2. Middleware File Check:');
console.log('-'.repeat(50));

const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Check for onboarding in public routes
  if (middlewareContent.includes('/onboarding') && middlewareContent.includes('publicRoutes')) {
    console.log('✅ Onboarding found in publicRoutes');
  } else {
    console.log('⚠️  Onboarding may not be in publicRoutes');
  }
  
  // Check for onboarding in protected routes
  if (middlewareContent.includes('/onboarding') && middlewareContent.includes('protectedRouteMatcher')) {
    const protectedMatch = middlewareContent.match(/protectedRouteMatcher.*?\[(.*?)\]/s);
    if (protectedMatch && protectedMatch[1].includes('/onboarding')) {
      console.log('❌ Onboarding found in protectedRouteMatcher - THIS IS THE ISSUE!');
    } else {
      console.log('✅ Onboarding NOT in protectedRouteMatcher');
    }
  }
  
  // Check for error handling
  if (middlewareContent.includes('catch') && middlewareContent.includes('error')) {
    console.log('✅ Error handling present');
  } else {
    console.log('⚠️  Error handling may be missing');
  }
} else {
  console.log('❌ middleware.ts not found');
}

// 3. Check package.json for Clerk version
console.log('\n3. Dependencies Check:');
console.log('-'.repeat(50));

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const clerkVersion = packageJson.dependencies?.['@clerk/nextjs'] || packageJson.devDependencies?.['@clerk/nextjs'];
  
  if (clerkVersion) {
    console.log(`✅ @clerk/nextjs: ${clerkVersion}`);
    
    // Check if it's v5+
    const majorVersion = parseInt(clerkVersion.replace(/[^0-9]/g, '').charAt(0));
    if (majorVersion >= 5) {
      console.log('✅ Using Clerk v5+ (correct for current middleware pattern)');
    } else {
      console.log('⚠️  Using Clerk v4 or earlier (may need different middleware pattern)');
    }
  } else {
    console.log('❌ @clerk/nextjs not found in dependencies');
  }
} else {
  console.log('❌ package.json not found');
}

// 4. Recommendations
console.log('\n4. Recommendations:');
console.log('-'.repeat(50));

if (!hasAllRequired) {
  console.log('❌ Missing required environment variables');
  console.log('   → Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY');
  console.log('   → Use: vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  console.log('   → Use: vercel env add CLERK_SECRET_KEY');
}

console.log('\n📋 Common Issues and Fixes:');
console.log('1. MIDDLEWARE_INVOCATION_FAILED:');
console.log('   → Ensure /onboarding is in publicRoutes, NOT in protectedRouteMatcher');
console.log('   → Check that Clerk env vars are set in Vercel');
console.log('   → Verify Clerk middleware pattern matches your Clerk version');
console.log('\n2. Clerk Handshake Errors:');
console.log('   → /onboarding must be public during handshake');
console.log('   → Check domain configuration in Clerk Dashboard');
console.log('   → Verify cookie domain settings match your deployment');
console.log('\n3. Debug Steps:');
console.log('   → Check Vercel function logs: vercel logs');
console.log('   → Look for [Middleware] prefixed log messages');
console.log('   → Test with: curl -v https://dash.dealershipai.com/onboarding');

console.log('\n' + '='.repeat(50));
console.log('✅ Audit complete\n');

