const axios = require('axios');
require('dotenv').config();

async function testMyBusiness() {
  try {
    const response = await axios.get('http://localhost:3000/api/my-business', {
      params: {
        accountId: process.env.GOOGLE_MY_BUSINESS_ACCOUNT_ID,
        locationId: process.env.GOOGLE_MY_BUSINESS_LOCATION_ID
      }
    });
    
    console.log('✓ My Business data:', response.data.business);
    console.log('✓ Reviews:', response.data.reviews);
    console.log('✓ Insights:', response.data.insights);
  } catch (error) {
    console.error('✗ My Business failed:', error.response?.data);
  }
}

testMyBusiness();
