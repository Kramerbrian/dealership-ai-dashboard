#!/usr/bin/env tsx
/**
 * Test script for Google Analytics Data API integration
 * Usage: npx tsx scripts/test-google-analytics.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

// Import after env vars are loaded
import { getAnalyticsClient } from '../lib/analytics/google-analytics-client';

async function testGoogleAnalytics() {
  console.log('🔍 Testing Google Analytics Data API Integration\n');

  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log(`  GA_PROPERTY_ID: ${process.env.GA_PROPERTY_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`  GA_SERVICE_ACCOUNT_EMAIL: ${process.env.GA_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Missing'}`);
  console.log(`  GA_PRIVATE_KEY: ${process.env.GA_PRIVATE_KEY ? '✓ Set' : '✗ Missing'}`);
  console.log(`  GA_PROJECT_ID: ${process.env.GA_PROJECT_ID ? '✓ Set' : '✗ Missing'}`);
  console.log('');

  if (!process.env.GA_PROPERTY_ID) {
    console.error('❌ Error: GA_PROPERTY_ID not configured');
    console.log('\nPlease follow these steps:');
    console.log('1. Copy .env.example to .env.local');
    console.log('2. Follow GOOGLE_ANALYTICS_SETUP.md to get your credentials');
    console.log('3. Add GA_PROPERTY_ID and other GA_* variables to .env.local');
    process.exit(1);
  }

  try {
    const client = getAnalyticsClient();

    // Test 1: Health Check
    console.log('1️⃣ Running health check...');
    const healthCheck = await client.healthCheck();
    if (healthCheck.success) {
      console.log(`   ✅ ${healthCheck.message}\n`);
    } else {
      console.error(`   ❌ ${healthCheck.message}\n`);
      process.exit(1);
    }

    // Test 2: Active Users
    console.log('2️⃣ Fetching active users (last 30 days)...');
    const activeUsers = await client.getActiveUsers('30daysAgo', 'today');
    console.log(`   ✅ Active Users: ${activeUsers.toLocaleString()}\n`);

    // Test 3: Realtime Users
    console.log('3️⃣ Fetching realtime users...');
    const realtimeUsers = await client.getRealtimeUsers();
    console.log(`   ✅ Realtime Users: ${realtimeUsers}\n`);

    // Test 4: User Engagement
    console.log('4️⃣ Fetching user engagement (last 7 days)...');
    const engagement = await client.getUserEngagement('7daysAgo', 'today');
    console.log(`   ✅ Retrieved ${engagement.length} days of data`);
    if (engagement.length > 0) {
      const latestDay = engagement[engagement.length - 1];
      console.log(`   Latest day (${latestDay.dimensions.date}):`);
      console.log(`     - Active Users: ${latestDay.metrics.activeUsers}`);
      console.log(`     - Sessions: ${latestDay.metrics.sessions}`);
      console.log(`     - Engagement Rate: ${(latestDay.metrics.engagementRate! * 100).toFixed(2)}%`);
    }
    console.log('');

    // Test 5: Top Pages
    console.log('5️⃣ Fetching top pages...');
    const topPages = await client.getTopPages('30daysAgo', 'today', 5);
    console.log(`   ✅ Top ${topPages.length} pages:`);
    topPages.forEach((page, index) => {
      console.log(`     ${index + 1}. ${page.dimensions.pageTitle}`);
      console.log(`        Path: ${page.dimensions.pagePath}`);
      console.log(`        Views: ${page.metrics.screenPageViews?.toLocaleString()}`);
    });
    console.log('');

    // Test 6: Traffic Sources
    console.log('6️⃣ Fetching traffic sources...');
    const sources = await client.getTrafficSources('30daysAgo', 'today');
    console.log(`   ✅ Top traffic sources:`);
    sources.slice(0, 5).forEach((source, index) => {
      console.log(`     ${index + 1}. ${source.dimensions.source} / ${source.dimensions.medium}`);
      console.log(`        Sessions: ${source.metrics.sessions?.toLocaleString()}`);
      console.log(`        Engagement: ${(source.metrics.engagementRate! * 100).toFixed(2)}%`);
    });
    console.log('');

    // Test 7: Device Breakdown
    console.log('7️⃣ Fetching device breakdown...');
    const devices = await client.getDeviceBreakdown('30daysAgo', 'today');
    console.log(`   ✅ Device distribution:`);
    devices.forEach((device) => {
      console.log(`     ${device.dimensions.deviceCategory}: ${device.metrics.sessions?.toLocaleString()} sessions`);
    });
    console.log('');

    // Test 8: Geographic Data
    console.log('8️⃣ Fetching geographic data...');
    const geoData = await client.getGeographicData('30daysAgo', 'today', 5);
    console.log(`   ✅ Top locations:`);
    geoData.forEach((location, index) => {
      console.log(`     ${index + 1}. ${location.dimensions.city}, ${location.dimensions.country}`);
      console.log(`        Users: ${location.metrics.activeUsers?.toLocaleString()}`);
    });
    console.log('');

    console.log('✅ All tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - 30-day active users: ${activeUsers.toLocaleString()}`);
    console.log(`  - Current realtime users: ${realtimeUsers}`);
    console.log(`  - Days of engagement data: ${engagement.length}`);
    console.log(`  - Top pages tracked: ${topPages.length}`);
    console.log(`  - Traffic sources: ${sources.length}`);
    console.log(`  - Device categories: ${devices.length}`);
    console.log(`  - Geographic locations: ${geoData.length}`);
    console.log('\n🎉 Google Analytics integration is ready for production!\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('\n   Stack trace:', error.stack);
    }
    console.log('\n💡 Troubleshooting tips:');
    console.log('  1. Verify your GA_PROPERTY_ID is correct (numeric only)');
    console.log('  2. Check that the service account has Viewer access in GA4');
    console.log('  3. Ensure the private key is properly formatted with \\n characters');
    console.log('  4. Confirm the Google Analytics Data API is enabled in GCP');
    console.log('\n  See GOOGLE_ANALYTICS_SETUP.md for detailed setup instructions.\n');
    process.exit(1);
  }
}

// Run the test
testGoogleAnalytics();
