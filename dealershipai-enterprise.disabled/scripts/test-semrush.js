const axios = require('axios');
require('dotenv').config();

async function testSEMrush() {
  try {
    const response = await axios.get('http://localhost:3000/api/seo/semrush', {
      params: {
        domain: 'example.com',
        database: 'us'
      }
    });
    
    console.log('✓ SEMrush data:', response.data);
  } catch (error) {
    console.error('✗ SEMrush failed:', error.response?.data);
  }
}

testSEMrush();