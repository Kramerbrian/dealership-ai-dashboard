const axios = require('axios');
require('dotenv').config();

async function testPageSpeed() {
  try {
    const response = await axios.get('http://localhost:3000/api/pagespeed', {
      params: {
        url: 'https://example.com',
        strategy: 'mobile'
      }
    });
    
    console.log('✓ PageSpeed scores:', response.data.scores);
    console.log('✓ Core Web Vitals:', response.data.metrics);
  } catch (error) {
    console.error('✗ PageSpeed failed:', error.response?.data);
  }
}

testPageSpeed();