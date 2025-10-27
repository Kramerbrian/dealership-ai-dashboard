#!/usr/bin/env node

/**
 * Clerk Production Setup Script
 * 
 * This script helps configure Clerk for production deployment
 * Run with: node setup-clerk-production.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Clerk Production Setup Script');
console.log('================================\n');

// Step 1: Check current environment
console.log('📋 Step 1: Checking current configuration...\n');

const envPath = '.env.local';
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found .env.local file');
} else {
  console.log('❌ No .env.local file found');
}

// Check for test keys
const hasTestKeys = envContent.includes('pk_test_') || envContent.includes('sk_test_');
if (hasTestKeys) {
  console.log('⚠️  WARNING: Found test keys in environment');
} else {
  console.log('✅ No test keys detected');
}

// Step 2: Create production environment template
console.log('\n📋 Step 2: Creating production environment template...\n');

const productionEnvTemplate = `# ==========================================
# CLERK AUTHENTICATION (PRODUCTION KEYS)
# ==========================================
# Get your production keys from: https://dashboard.clerk.com/
# Replace these with your actual production keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_KEY_HERE

# ==========================================
# PRODUCTION URLS
# ==========================================
NEXTAUTH_URL=https://dealershipai.com
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXT_PUBLIC_DASHBOARD_URL=https://dealershipai.com

# ==========================================
# GOOGLE OAUTH (PRODUCTION)
# ==========================================
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# ==========================================
# ENCRYPTION
# ==========================================
ENCRYPTION_KEY=your-production-encryption-key-here

# ==========================================
# GOOGLE ANALYTICS 4
# ==========================================
NEXT_PUBLIC_GA=G-YOUR_GA4_ID
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id_here
`;

fs.writeFileSync('.env.production.template', productionEnvTemplate);
console.log('✅ Created .env.production.template');

// Step 3: Create domain configuration script
console.log('\n📋 Step 3: Creating domain configuration script...\n');

const domainConfigScript = `#!/bin/bash

# Clerk Domain Configuration Script
# Run this after setting up your production keys

echo "🔧 Configuring Clerk domains..."

# Your Clerk instance details
CLERK_INSTANCE_ID="ins_33KM1OT8bmznnJnWoQOVxKIsZoD"
CLERK_SECRET_KEY="sk_live_YOUR_SECRET_KEY_HERE"

# Domains to add
DOMAINS=(
  "dealershipai.com"
  "www.dealershipai.com"
  "dealership-ai-dashboard.vercel.app"
)

echo "Adding domains to Clerk instance: $CLERK_INSTANCE_ID"

for domain in "\${DOMAINS[@]}"; do
  echo "Adding domain: $domain"
  
  curl -X POST "https://api.clerk.com/v1/instances/$CLERK_INSTANCE_ID/domains" \\
    -H "Authorization: Bearer $CLERK_SECRET_KEY" \\
    -H "Content-Type: application/json" \\
    -d "{
      \"name\": \"$domain\",
      \"is_satellite\": false,
      \"proxy_url\": \"https://$domain\"
    }"
  
  echo ""
done

echo "✅ Domain configuration complete!"
echo "Check your domains at: https://dashboard.clerk.com/apps/app_33KM1Q3TCBfKXd0PqVn6gt32SFx/instances/$CLERK_INSTANCE_ID/domains"
`;

fs.writeFileSync('configure-clerk-domains.sh', domainConfigScript);
fs.chmodSync('configure-clerk-domains.sh', '755');
console.log('✅ Created configure-clerk-domains.sh');

// Step 4: Create Vercel deployment script
console.log('\n📋 Step 4: Creating Vercel deployment script...\n');

const vercelDeployScript = `#!/bin/bash

# Vercel Production Deployment Script
# Run this after configuring Clerk

echo "🚀 Deploying to Vercel..."

# Set environment variables in Vercel
echo "Setting Clerk environment variables..."

# You need to replace these with your actual production keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

echo "Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "Check your app at: https://dealershipai.com"
`;

fs.writeFileSync('deploy-to-vercel.sh', vercelDeployScript);
fs.chmodSync('deploy-to-vercel.sh', '755');
console.log('✅ Created deploy-to-vercel.sh');

// Step 5: Create verification script
console.log('\n📋 Step 5: Creating verification script...\n');

const verificationScript = `#!/bin/bash

# Clerk Production Verification Script

echo "🔍 Verifying Clerk production setup..."

# Check if running in keyless mode
echo "Checking for keyless mode warnings..."

# Test the production URL
PROD_URL="https://dealershipai.com"

echo "Testing production URL: $PROD_URL"

# Check for Clerk warnings in the response
response=$(curl -s "$PROD_URL" | grep -i "keyless\\|development\\|test")

if [ -n "$response" ]; then
  echo "❌ Still seeing keyless/development warnings"
  echo "Response: $response"
else
  echo "✅ No keyless mode warnings detected"
fi

echo "✅ Verification complete!"
`;

fs.writeFileSync('verify-clerk-production.sh', verificationScript);
fs.chmodSync('verify-clerk-production.sh', '755');
console.log('✅ Created verify-clerk-production.sh');

// Summary
console.log('\n🎉 Setup Complete!');
console.log('==================\n');

console.log('📁 Files created:');
console.log('  - .env.production.template');
console.log('  - configure-clerk-domains.sh');
console.log('  - deploy-to-vercel.sh');
console.log('  - verify-clerk-production.sh\n');

console.log('📋 Next steps:');
console.log('1. Get your production Clerk keys from: https://dashboard.clerk.com/');
console.log('2. Update .env.production.template with your keys');
console.log('3. Run: ./configure-clerk-domains.sh');
console.log('4. Run: ./deploy-to-vercel.sh');
console.log('5. Run: ./verify-clerk-production.sh\n');

console.log('🔗 Important URLs:');
console.log('  - Clerk Dashboard: https://dashboard.clerk.com/apps/app_33KM1Q3TCBfKXd0PqVn6gt32SFx/instances/ins_33KM1OT8bmznnJnWoQOVxKIsZoD/domains/satellites');
console.log('  - Vercel Project: https://vercel.com/[your-team]/dealership-ai-dashboard/settings');
console.log('  - Production URL: https://dealershipai.com\n');

console.log('⚠️  Remember to:');
console.log('  - Replace all placeholder keys with real production keys');
console.log('  - Add domains in Clerk Dashboard');
console.log('  - Deploy to Vercel with production environment variables');
console.log('  - Test the authentication flow on production\n');
