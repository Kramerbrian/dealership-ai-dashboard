#!/usr/bin/env node

// Test script for Google Analytics integration
const { GoogleAnalyticsService } = require('../lib/services/GoogleAnalyticsService');

async function testGoogleAnalytics() {
  console.log('🧪 Testing Google Analytics integration...');
  
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  
  if (!propertyId || propertyId === 'your_property_id_here') {
    console.error('❌ Please set GOOGLE_ANALYTICS_PROPERTY_ID in your .env.local file');
    console.log('💡 You can use any valid GA4 Property ID for testing (e.g., 123456789)');
    process.exit(1);
  }
  
  try {
    const gaService = new GoogleAnalyticsService();
    
    console.log('📊 Testing real-time data...');
    const realtimeData = await gaService.getRealtimeData(propertyId);
    console.log('✅ Real-time data:', JSON.stringify(realtimeData, null, 2));
    
    console.log('📈 Testing traffic data...');
    const trafficData = await gaService.getTrafficData(propertyId, '7d');
    console.log('✅ Traffic data:', JSON.stringify(trafficData, null, 2));
    
    console.log('🎯 Testing conversion data...');
    const conversionData = await gaService.getConversionData(propertyId, '7d');
    console.log('✅ Conversion data:', JSON.stringify(conversionData, null, 2));
    
    console.log('🎉 All tests passed! Google Analytics integration is working.');
    console.log('🚀 Ready to connect real dealer data!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 This is expected if you haven\'t set up real GA4 credentials yet.');
    console.log('📖 Check GOOGLE_ANALYTICS_SETUP_INSTRUCTIONS.md for setup guide.');
    process.exit(1);
  }
}

testGoogleAnalytics();
