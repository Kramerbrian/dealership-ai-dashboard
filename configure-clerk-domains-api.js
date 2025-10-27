#!/usr/bin/env node

/**
 * Clerk Domain Configuration API Script
 * 
 * This script uses the Clerk API to configure domains for your production instance
 * Instance ID: ins_33KM1OT8bmznnJnWoQOVxKIsZoD
 */

const https = require('https');

// Your Clerk instance configuration
const CLERK_INSTANCE_ID = 'ins_33KM1OT8bmznnJnWoQOVxKIsZoD';
const CLERK_APP_ID = 'app_33KM1Q3TCBfKXd0PqVn6gt32SFx';

// Domains to configure
const DOMAINS = [
  {
    name: 'dealershipai.com',
    is_satellite: false,
    proxy_url: 'https://dealershipai.com'
  },
  {
    name: 'www.dealershipai.com', 
    is_satellite: false,
    proxy_url: 'https://www.dealershipai.com'
  },
  {
    name: 'dealership-ai-dashboard.vercel.app',
    is_satellite: true,
    proxy_url: 'https://dealership-ai-dashboard.vercel.app'
  }
];

console.log('🔧 Clerk Domain Configuration');
console.log('=============================\n');

console.log('📋 Instance Details:');
console.log(`  - Instance ID: ${CLERK_INSTANCE_ID}`);
console.log(`  - App ID: ${CLERK_APP_ID}\n`);

console.log('📋 Domains to configure:');
DOMAINS.forEach((domain, index) => {
  console.log(`  ${index + 1}. ${domain.name} (satellite: ${domain.is_satellite})`);
});
console.log('');

// Function to make API request
function makeApiRequest(secretKey, endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to configure domains
async function configureDomains(secretKey) {
  console.log('🚀 Starting domain configuration...\n');
  
  for (const domain of DOMAINS) {
    console.log(`📝 Configuring domain: ${domain.name}`);
    
    try {
      const response = await makeApiRequest(
        secretKey,
        `/v1/instances/${CLERK_INSTANCE_ID}/domains`,
        'POST',
        domain
      );
      
      if (response.status === 200 || response.status === 201) {
        console.log(`  ✅ Successfully configured ${domain.name}`);
      } else if (response.status === 409) {
        console.log(`  ⚠️  Domain ${domain.name} already exists`);
      } else {
        console.log(`  ❌ Failed to configure ${domain.name}:`, response.data);
      }
    } catch (error) {
      console.log(`  ❌ Error configuring ${domain.name}:`, error.message);
    }
    
    console.log('');
  }
}

// Function to list current domains
async function listDomains(secretKey) {
  console.log('📋 Current domains:');
  
  try {
    const response = await makeApiRequest(
      secretKey,
      `/v1/instances/${CLERK_INSTANCE_ID}/domains`
    );
    
    if (response.status === 200) {
      const domains = response.data.data || response.data;
      if (domains.length > 0) {
        domains.forEach((domain, index) => {
          console.log(`  ${index + 1}. ${domain.name} (satellite: ${domain.is_satellite})`);
        });
      } else {
        console.log('  No domains configured');
      }
    } else {
      console.log('  ❌ Failed to fetch domains:', response.data);
    }
  } catch (error) {
    console.log('  ❌ Error fetching domains:', error.message);
  }
  
  console.log('');
}

// Main execution
async function main() {
  const secretKey = process.argv[2];
  
  if (!secretKey) {
    console.log('❌ Error: Clerk Secret Key required');
    console.log('');
    console.log('Usage: node configure-clerk-domains-api.js <CLERK_SECRET_KEY>');
    console.log('');
    console.log('Get your secret key from: https://dashboard.clerk.com/');
    console.log('Make sure to use your PRODUCTION secret key (sk_live_...)');
    process.exit(1);
  }
  
  if (!secretKey.startsWith('sk_live_')) {
    console.log('⚠️  Warning: This doesn\'t look like a production secret key');
    console.log('Production keys should start with "sk_live_"');
    console.log('');
  }
  
  try {
    // List current domains first
    await listDomains(secretKey);
    
    // Configure new domains
    await configureDomains(secretKey);
    
    // List domains again to confirm
    console.log('📋 Updated domains:');
    await listDomains(secretKey);
    
    console.log('✅ Domain configuration complete!');
    console.log('');
    console.log('🔗 Check your domains at:');
    console.log(`https://dashboard.clerk.com/apps/${CLERK_APP_ID}/instances/${CLERK_INSTANCE_ID}/domains/satellites`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
