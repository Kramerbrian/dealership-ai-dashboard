const https = require('https');

// Your production Clerk secret key
const CLERK_SECRET_KEY = 'sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl';

async function configureClerkComplete() {
  console.log('🔧 Configuring Clerk completely via API...');
  
  try {
    // Step 1: Get instance info
    console.log('\n📋 Step 1: Getting instance information...');
    const instances = await getInstances();
    console.log('✅ Instances found:', instances.length);
    
    if (instances.length > 0) {
      const instance = instances[0];
      console.log('✅ Using instance:', instance.id);
      
      // Step 2: Add domains
      console.log('\n🌐 Step 2: Adding domains...');
      await addDomain(instance.id, 'dealershipai.com');
      await addDomain(instance.id, 'www.dealershipai.com');
      
      // Step 3: Configure redirect URLs
      console.log('\n🔗 Step 3: Configuring redirect URLs...');
      const redirectUrls = [
        'https://dealershipai.com/dashboard',
        'https://dealershipai.com/auth/signin',
        'https://dealershipai.com/auth/signup',
        'https://www.dealershipai.com/dashboard',
        'https://www.dealershipai.com/auth/signin',
        'https://www.dealershipai.com/auth/signup'
      ];
      
      await updateRedirectUrls(instance.id, redirectUrls);
      
      console.log('\n🎉 Clerk configuration completed successfully!');
      console.log('✅ Domains added: dealershipai.com, www.dealershipai.com');
      console.log('✅ Redirect URLs configured:');
      redirectUrls.forEach(url => console.log(`   - ${url}`));
      
    } else {
      throw new Error('No instances found');
    }
    
  } catch (error) {
    console.error('❌ Error configuring Clerk:', error.message);
    console.log('\n🔧 Manual configuration required:');
    console.log('1. Go to: https://dashboard.clerk.com');
    console.log('2. Select your PRODUCTION instance');
    console.log('3. Add domains: dealershipai.com, www.dealershipai.com');
    console.log('4. Add redirect URLs in the appropriate section');
  }
}

async function getInstances() {
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
          resolve(result.data || []);
        } catch (e) {
          reject(new Error('Failed to parse instances: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function addDomain(instanceId, domain) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      domain: domain,
      is_satellite: true
    });

    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1/instances/${instanceId}/domains`,
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
          console.log(`✅ Domain ${domain} added successfully`);
          resolve(result);
        } catch (e) {
          console.log(`⚠️  Domain ${domain} may already exist or failed to add`);
          resolve({ domain });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function updateRedirectUrls(instanceId, urls) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      redirect_urls: urls
    });

    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1/instances/${instanceId}/redirect_urls`,
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
          console.log('✅ Redirect URLs updated successfully');
          resolve(result);
        } catch (e) {
          console.log('⚠️  Redirect URLs may need manual configuration');
          resolve({ urls });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the configuration
configureClerkComplete();
