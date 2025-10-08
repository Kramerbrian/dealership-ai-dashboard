const axios = require('axios');
require('dotenv').config();

async function testAI() {
  try {
    const response = await axios.post('http://localhost:3000/api/ai/citations', {
      businessName: 'Premium Auto Dealership',
      location: 'Cape Coral, FL',
      website: 'https://premiumauto.com'
    });
    
    console.log('✓ AI Analysis:', response.data);
  } catch (error) {
    console.error('✗ AI failed:', error.response?.data);
  }
}

testAI();