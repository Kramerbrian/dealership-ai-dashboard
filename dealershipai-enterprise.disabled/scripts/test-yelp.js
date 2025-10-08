const axios = require('axios');
require('dotenv').config();

async function testYelp() {
  try {
    const response = await axios.get('http://localhost:3000/api/reviews/yelp', {
      params: {
        businessId: 'your-business-id'
      }
    });
    
    console.log('✓ Yelp business:', response.data.business.name);
    console.log('✓ Yelp reviews:', response.data.reviews.length);
  } catch (error) {
    console.error('✗ Yelp failed:', error.response?.data);
  }
}

testYelp();