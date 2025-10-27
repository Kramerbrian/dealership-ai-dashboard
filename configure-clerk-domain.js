const https = require('https');

// Your production Clerk secret key
const CLERK_SECRET_KEY = 'sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl';

// Your domain
const DOMAIN = 'dealershipai.com';

async function configureClerkDomain() {
  console.log('🔧 Configuring Clerk domain via API...');
  
  try {
    // Get your instance info
    const instanceInfo = await getInstanceInfo();
    console.log('✅ Instance info retrieved:', instanceInfo);
    
    // Add domain to Clerk
    const result = await addDomainToClerk(DOMAIN);
    console.log('✅ Domain added to Clerk:', result);
    
  } catch (error) {
    console.error('❌ Error configuring Clerk domain:', error.message);
    console.log('\n🔧 Manual steps required:');
    console.log('1. Go to: https://dashboard.clerk.com');
    console.log('2. Select your PRODUCTION instance');
    console.log('3. Go to: Domains → Satellites');
    console.log('4. Add domain:', DOMAIN);
    console.log('5. Add domain: www.' + DOMAIN);
  }
}

async function getInstanceInfo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1/instances',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse instance info: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function addDomainToClerk(domain) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      domain: domain,
      is_satellite: true
    });

    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1/domains',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to add domain: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the configuration
configureClerkDomain();
