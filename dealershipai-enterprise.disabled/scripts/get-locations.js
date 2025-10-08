const axios = require('axios');

async function getLocations(accessToken) {
  try {
    // List accounts
    const accounts = await axios.get(
      'https://mybusinessbusinessinformation.googleapis.com/v1/accounts',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    console.log('Accounts:', accounts.data);
    
    // Get locations for first account
    const accountId = accounts.data.accounts[0].name;
    const locations = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    console.log('Locations:', locations.data);
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
}

// Run after OAuth
getLocations('YOUR_ACCESS_TOKEN');