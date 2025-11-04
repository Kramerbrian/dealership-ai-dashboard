/**
 * Get Upstash Redis Credentials
 * 
 * Uses @upstash/redis to check connection and get credentials
 */

import { Redis } from '@upstash/redis';

async function checkRedisConnection() {
  console.log('🔍 Checking Redis Configuration...\n');

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

  if (!url || !token) {
    console.log('❌ Redis credentials not found in environment variables\n');
    console.log('📋 Required variables:');
    console.log('   UPSTASH_REDIS_REST_URL');
    console.log('   UPSTASH_REDIS_REST_TOKEN\n');
    console.log('💡 Get them from: https://console.upstash.com/\n');
    return;
  }

  // Check if it's a placeholder
  if (url.includes('your_redis_url') || url.includes('placeholder') || 
      token.includes('your_redis_token') || token.includes('placeholder')) {
    console.log('⚠️  Placeholder values detected\n');
    console.log('📋 Update your .env with real Upstash credentials:');
    console.log('   Go to: https://console.upstash.com/');
    console.log('   Select your database → REST API section\n');
    return;
  }

  console.log('✅ Redis credentials found\n');
  console.log(`📝 REST URL: ${url.substring(0, 40)}...`);
  console.log(`📝 REST Token: ${token.substring(0, 20)}...\n`);

  // Try to connect
  try {
    console.log('🔌 Testing connection...\n');
    
    const redis = new Redis({
      url,
      token,
    });

    // Test connection with a simple ping
    const result = await redis.ping();
    
    if (result === 'PONG') {
      console.log('✅ Connection successful!\n');
      console.log('📋 Ready to add to Vercel:\n');
      console.log(`UPSTASH_REDIS_REST_URL=${url}`);
      console.log(`UPSTASH_REDIS_REST_TOKEN=${token}\n`);
      console.log('🔗 Add at: https://vercel.com/YOUR_PROJECT/settings/environment-variables\n');
    } else {
      console.log('⚠️  Connection test returned unexpected result:', result);
    }
  } catch (error) {
    console.log('❌ Connection failed\n');
    console.log('Error:', error instanceof Error ? error.message : String(error));
    console.log('\n💡 Check your credentials at: https://console.upstash.com/\n');
  }
}

// Run if executed directly
if (require.main === module) {
  checkRedisConnection().catch(console.error);
}

export { checkRedisConnection };

