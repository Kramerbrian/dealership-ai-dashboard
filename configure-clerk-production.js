#!/usr/bin/env node

/**
 * 🚀 CLERK PRODUCTION CONFIGURATION SCRIPT
 * 
 * This script helps you configure Clerk production keys and domains
 * Run with: node configure-clerk-production.js YOUR_SECRET_KEY
 */

const https = require('https');

const CLERK_API_BASE = 'https://api.clerk.com/v1';

async function makeClerkRequest(endpoint, method = 'GET', data = null, secretKey) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function getInstanceInfo(secretKey) {
  console.log('🔍 Getting Clerk instance information...');
  
  try {
    const response = await makeClerkRequest('/instances', 'GET', null, secretKey);
    
    if (response.status === 200) {
      console.log('✅ Successfully connected to Clerk API');
      console.log(`📊 Found ${response.data.length} instance(s)`);
      
      response.data.forEach((instance, index) => {
        console.log(`\n${index + 1}. Instance: ${instance.name}`);
        console.log(`   ID: ${instance.id}`);
        console.log(`   Environment: ${instance.environment}`);
        console.log(`   Created: ${new Date(instance.created_at).toLocaleDateString()}`);
      });
      
      return response.data;
    } else {
      console.error('❌ Failed to get instance info:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error connecting to Clerk API:', error.message);
    return null;
  }
}

async function getDomains(secretKey) {
  console.log('\n🌐 Getting current domains...');
  
  try {
    const response = await makeClerkRequest('/domains', 'GET', null, secretKey);
    
    if (response.status === 200) {
      console.log(`✅ Found ${response.data.length} domain(s)`);
      
      response.data.forEach((domain, index) => {
        console.log(`\n${index + 1}. Domain: ${domain.name}`);
        console.log(`   Status: ${domain.status}`);
        console.log(`   Type: ${domain.type}`);
        console.log(`   Created: ${new Date(domain.created_at).toLocaleDateString()}`);
      });
      
      return response.data;
    } else {
      console.error('❌ Failed to get domains:', response.data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting domains:', error.message);
    return null;
  }
}

async function addDomain(domainName, secretKey) {
  console.log(`\n➕ Adding domain: ${domainName}`);
  
  try {
    const response = await makeClerkRequest('/domains', 'POST', {
      name: domainName
    }, secretKey);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ Successfully added domain: ${domainName}`);
      return true;
    } else {
      console.error(`❌ Failed to add domain ${domainName}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error adding domain ${domainName}:`, error.message);
    return false;
  }
}

async function main() {
  const secretKey = process.argv[2];
  
  if (!secretKey) {
    console.log('❌ Please provide your Clerk secret key');
    console.log('Usage: node configure-clerk-production.js YOUR_SECRET_KEY');
    console.log('\nTo get your secret key:');
    console.log('1. Go to https://dashboard.clerk.com');
    console.log('2. Select your PRODUCTION instance');
    console.log('3. Go to API Keys');
    console.log('4. Copy the Secret Key (starts with sk_live_...)');
    process.exit(1);
  }

  if (!secretKey.startsWith('sk_live_')) {
    console.log('⚠️  Warning: This doesn\'t look like a production secret key');
    console.log('Production keys should start with "sk_live_"');
    console.log('Are you sure you want to continue? (Ctrl+C to cancel)');
  }

  console.log('🚀 CLERK PRODUCTION CONFIGURATION');
  console.log('=====================================\n');

  // Get instance info
  const instances = await getInstanceInfo(secretKey);
  if (!instances) {
    process.exit(1);
  }

  // Get current domains
  const domains = await getDomains(secretKey);
  if (!domains) {
    process.exit(1);
  }

  // Check if we need to add domains
  const requiredDomains = [
    'dealershipai.com',
    'www.dealershipai.com'
  ];

  const existingDomains = domains.map(d => d.name);
  const domainsToAdd = requiredDomains.filter(d => !existingDomains.includes(d));

  if (domainsToAdd.length === 0) {
    console.log('\n✅ All required domains are already configured!');
  } else {
    console.log(`\n📝 Need to add ${domainsToAdd.length} domain(s):`);
    domainsToAdd.forEach(domain => {
      console.log(`   - ${domain}`);
    });

    console.log('\n🔧 Adding domains...');
    for (const domain of domainsToAdd) {
      await addDomain(domain, secretKey);
    }
  }

  console.log('\n🎉 CLERK PRODUCTION CONFIGURATION COMPLETE!');
  console.log('\n📋 Next steps:');
  console.log('1. Update Vercel environment variables with your production keys');
  console.log('2. Redeploy to Vercel: npx vercel --prod');
  console.log('3. Test authentication flow on your production site');
  console.log('4. Verify no "development keys" warnings in browser console');
  
  console.log('\n💰 Ready to start collecting $499 deals! 🚀');
}

main().catch(console.error);
