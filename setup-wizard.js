#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 DealershipAI Stripe Integration Setup Wizard');
console.log('===============================================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupStripe() {
  console.log('💳 Setting up Stripe...\n');
  
  console.log('1. Go to: https://dashboard.stripe.com/test/apikeys');
  console.log('2. Copy your Publishable key (starts with pk_test_)');
  console.log('3. Copy your Secret key (starts with sk_test_)\n');
  
  const publishableKey = await askQuestion('Enter your Stripe Publishable Key: ');
  const secretKey = await askQuestion('Enter your Stripe Secret Key: ');
  
  console.log('\n4. Now create a product:');
  console.log('   - Go to: https://dashboard.stripe.com/test/products');
  console.log('   - Click "Add product"');
  console.log('   - Name: "DealershipAI Pro"');
  console.log('   - Add price: $99/month (recurring)');
  console.log('   - Copy the Price ID (starts with price_)\n');
  
  const priceId = await askQuestion('Enter your Stripe Price ID: ');
  
  console.log('\n5. Set up webhook:');
  console.log('   - Go to: https://dashboard.stripe.com/test/webhooks');
  console.log('   - Click "Add endpoint"');
  console.log('   - URL: http://localhost:3001/api/webhooks/stripe');
  console.log('   - Select events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed');
  console.log('   - Copy the Webhook signing secret (starts with whsec_)\n');
  
  const webhookSecret = await askQuestion('Enter your Webhook Signing Secret: ');
  
  return { publishableKey, secretKey, priceId, webhookSecret };
}

async function setupSupabase() {
  console.log('🗄️ Setting up Supabase...\n');
  
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Create a new project (if you don\'t have one)');
  console.log('3. Go to Settings → API');
  console.log('4. Copy your Project URL and API keys\n');
  
  const projectUrl = await askQuestion('Enter your Supabase Project URL: ');
  const anonKey = await askQuestion('Enter your Supabase Anon Key: ');
  const serviceKey = await askQuestion('Enter your Supabase Service Key: ');
  
  return { projectUrl, anonKey, serviceKey };
}

async function updateEnvFile(keys) {
  console.log('\n📝 Updating .env file...');
  
  const envContent = `# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=${keys.stripe.secretKey}
STRIPE_PUBLISHABLE_KEY=${keys.stripe.publishableKey}
STRIPE_WEBHOOK_SECRET=${keys.stripe.webhookSecret}
STRIPE_PRICE_ID_PRO_MONTHLY=${keys.stripe.priceId}

# Supabase Configuration
SUPABASE_URL=${keys.supabase.projectUrl}
SUPABASE_ANON_KEY=${keys.supabase.anonKey}
SUPABASE_SERVICE_KEY=${keys.supabase.serviceKey}

# App Configuration
NEXT_PUBLIC_URL=http://localhost:3001
NODE_ENV=development
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file updated successfully!');
}

async function setupDatabase() {
  console.log('\n🗄️ Setting up database...');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of database-schema.sql');
  console.log('4. Click "Run" to execute the SQL\n');
  
  const proceed = await askQuestion('Have you run the database schema? (y/n): ');
  
  if (proceed.toLowerCase() === 'y') {
    console.log('✅ Database setup complete!');
    return true;
  } else {
    console.log('⚠️ Please run the database schema before continuing.');
    return false;
  }
}

async function testIntegration() {
  console.log('\n🧪 Testing integration...');
  
  try {
    const { runTests } = require('./test-stripe.js');
    const success = await runTests();
    
    if (success) {
      console.log('🎉 All tests passed! Your integration is ready.');
    } else {
      console.log('⚠️ Some tests failed. Please check your configuration.');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Setup Stripe
    const stripeKeys = await setupStripe();
    
    // Setup Supabase
    const supabaseKeys = await setupSupabase();
    
    // Update .env file
    await updateEnvFile({
      stripe: stripeKeys,
      supabase: supabaseKeys
    });
    
    // Setup database
    const dbReady = await setupDatabase();
    
    if (!dbReady) {
      console.log('\n⚠️ Please complete the database setup and run this script again.');
      rl.close();
      return;
    }
    
    // Test integration
    const testsPassed = await testIntegration();
    
    if (testsPassed) {
      console.log('\n🎉 Setup Complete!');
      console.log('==================');
      console.log('✅ Stripe configured');
      console.log('✅ Supabase configured');
      console.log('✅ Database schema applied');
      console.log('✅ All tests passed');
      console.log('\n🚀 Your server is running at: http://localhost:3001');
      console.log('💰 Pricing page: http://localhost:3001/pricing.html');
      console.log('📊 Dashboard: http://localhost:3001/dealership-ai-dashboard.html');
    } else {
      console.log('\n⚠️ Setup completed but some tests failed.');
      console.log('Please check your configuration and try again.');
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main();
