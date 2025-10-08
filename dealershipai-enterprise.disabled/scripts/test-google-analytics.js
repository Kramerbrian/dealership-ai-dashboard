const axios = require('axios');
require('dotenv').config();

async function testGoogleAnalytics() {
  try {
    const response = await axios.get('http://localhost:3000/api/analytics/google', {
      params: {
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
        startDate: '7daysAgo',
        endDate: 'today'
      }
    });
    
    console.log('✓ Google Analytics data:', response.data.summary);
    console.log('✓ Traffic data points:', response.data.trafficData.length);
    console.log('✓ Conversion events:', response.data.conversionData.length);
  } catch (error) {
    console.error('✗ Google Analytics failed:', error.response?.data);
  }
}

testGoogleAnalytics();
