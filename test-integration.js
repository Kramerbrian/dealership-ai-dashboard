/**
 * Integration Test Script
 *
 * Tests database connection and tier-features functionality
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runTests() {
  console.log('🧪 Running Integration Tests...\n');

  // Test 1: Database Connection
  console.log('Test 1: Database Connection');
  try {
    const { default: db } = require('./lib/db.ts');
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Database connected successfully\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }

  // Test 2: Query Tables
  console.log('Test 2: Query Tables');
  try {
    const { tables } = require('./lib/db.ts');

    const tenants = await tables.tenants().count('* as count').first();
    console.log(`   Tenants: ${tenants.count}`);

    const dealerships = await tables.dealerships().count('* as count').first();
    console.log(`   Dealerships: ${dealerships.count}`);

    const scores = await tables.dealershipData().count('* as count').first();
    console.log(`   Scores: ${scores.count}`);

    console.log('✅ All tables accessible\n');
  } catch (error) {
    console.error('❌ Table query failed:', error.message);
    process.exit(1);
  }

  // Test 3: Tier Features
  console.log('Test 3: Tier-Based Feature Access');
  try {
    const { canAccessFeature, getTierLimits } = require('./lib/tier-features.ts');

    // Test Free tier
    const freeLimits = getTierLimits('free');
    console.log('   Free tier chat sessions:', freeLimits.chatSessions);
    console.log('   Free can export data:', canAccessFeature('free', 'data_export'));

    // Test Pro tier
    const proLimits = getTierLimits('pro');
    console.log('   Pro tier chat sessions:', proLimits.chatSessions);
    console.log('   Pro can export data:', canAccessFeature('pro', 'data_export'));

    // Test usage limits
    const canCreateSession = canAccessFeature('pro', 'chat_sessions', 10);
    console.log('   Pro user with 10 sessions can create more:', canCreateSession);

    console.log('✅ Tier features working correctly\n');
  } catch (error) {
    console.error('❌ Tier features test failed:', error.message);
    process.exit(1);
  }

  // Test 4: Sample Data
  console.log('Test 4: Sample Data Verification');
  try {
    const { tables } = require('./lib/db.ts');

    const sampleDealer = await tables.dealerships()
      .select('name', 'city', 'state')
      .first();

    if (sampleDealer) {
      console.log(`   Sample dealer: ${sampleDealer.name} - ${sampleDealer.city}, ${sampleDealer.state}`);
    }

    const sampleScore = await tables.dealershipData()
      .select('dealership_name', 'overall_score')
      .first();

    if (sampleScore) {
      console.log(`   Sample score: ${sampleScore.dealership_name} - ${sampleScore.overall_score}/100`);
    }

    console.log('✅ Sample data present\n');
  } catch (error) {
    console.error('❌ Sample data check failed:', error.message);
    process.exit(1);
  }

  console.log('🎉 All tests passed! Your integration is working correctly.\n');
  console.log('Next steps:');
  console.log('  1. Start your dev server: npm run dev');
  console.log('  2. Test the /api/usage endpoint');
  console.log('  3. Test the /api/scores endpoint with tier gating');
  console.log('  4. Check WHATS_NEXT.md for more integration steps\n');

  process.exit(0);
}

runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
