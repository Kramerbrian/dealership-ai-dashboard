const https = require('https');

// Your production Clerk secret key
const CLERK_SECRET_KEY = 'sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl';

// Redirect URLs to add
const REDIRECT_URLS = [
  'https://dealershipai.com/dashboard',
  'https://dealershipai.com/auth/signin',
  'https://dealershipai.com/auth/signup',
  'https://www.dealershipai.com/dashboard',
  'https://www.dealershipai.com/auth/signin',
  'https://www.dealershipai.com/auth/signup'
];

async function configureClerkRedirects() {
  console.log('🔧 Configuring Clerk redirect URLs via API...');
  
  try {
    // Get current application settings
    const currentApp = await getCurrentApplication();
    console.log('✅ Current application retrieved:', currentApp);
    
    // Update redirect URLs
    const result = await updateRedirectUrls(REDIRECT_URLS);
    console.log('✅ Redirect URLs updated:', result);
    
    console.log('\n🎉 Clerk redirect URLs configured successfully!');
    console.log('Added URLs:');
    REDIRECT_URLS.forEach(url => console.log(`  - ${url}`));
    
  } catch (error) {
    console.error('❌ Error configuring Clerk redirect URLs:', error.message);
    console.log('\n🔧 Manual steps required:');
    console.log('1. Go to: https://dashboard.clerk.com');
    console.log('2. Select your PRODUCTION instance');
    console.log('3. Go to: Configure → SSO Connections');
    console.log('4. Add these redirect URLs:');
    REDIRECT_URLS.forEach(url => console.log(`   - ${url}`));
  }
}

async function getCurrentApplication() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1/applications',
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
          reject(new Error('Failed to parse application info: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function updateRedirectUrls(urls) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      redirect_urls: urls
    });

    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: '/v1/applications',
      method: 'PATCH',
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
          reject(new Error('Failed to update redirect URLs: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the configuration
configureClerkRedirects();
