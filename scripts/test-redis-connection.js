#!/usr/bin/env node
/**
 * Test Redis/Upstash Connection
 * Quick script to verify Redis is working with your app
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || process.env.KV_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('❌ Missing Redis credentials!');
  console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  process.exit(1);
}

const redis = new Redis({
  url: url.trim(),
  token: token.trim(),
});

async function testConnection() {
  console.log('🔍 Testing Redis connection...\n');

  try {
    // Test 1: PING
    console.log('1. Testing PING...');
    const pingResult = await redis.ping();
    console.log(`   ✅ PING: ${pingResult}\n`);

    // Test 2: Set/Get
    console.log('2. Testing SET/GET...');
    await redis.set('test:connection', 'Hello from DealershipAI!', { ex: 60 });
    const value = await redis.get('test:connection');
    console.log(`   ✅ SET/GET: ${value}\n`);

    // Test 3: QAI Cache Pattern
    console.log('3. Testing QAI cache pattern...');
    const qaiData = { value: 87, delta: 3, factors: [] };
    await redis.set('qai:score:test.com', JSON.stringify(qaiData), { ex: 180 });
    const cached = await redis.get('qai:score:test.com');
    console.log(`   ✅ QAI Cache: ${cached}\n`);

    // Test 4: Rate Limit Pattern
    console.log('4. Testing rate limit pattern...');
    const count = await redis.incr('ratelimit:test:user123');
    await redis.pexpire('ratelimit:test:user123', 60000);
    console.log(`   ✅ Rate Limit: ${count} requests\n`);

    // Test 5: Fleet Cache
    console.log('5. Testing fleet cache pattern...');
    const fleetData = { origins: [{ id: '1', origin: 'https://test.com' }] };
    await redis.set('fleet:origins', JSON.stringify(fleetData), { ex: 300 });
    const fleet = await redis.get('fleet:origins');
    console.log(`   ✅ Fleet Cache: ${fleet ? 'cached' : 'miss'}\n`);

    // Test 6: Check existing keys
    console.log('6. Checking existing keys...');
    const keys = await redis.keys('*');
    console.log(`   ✅ Found ${keys.length} keys`);
    if (keys.length > 0 && keys.length <= 10) {
      console.log(`   Keys: ${keys.join(', ')}\n`);
    } else if (keys.length > 10) {
      console.log(`   First 10: ${keys.slice(0, 10).join(', ')}...\n`);
    }

    // Cleanup test keys
    await redis.del('test:connection', 'qai:score:test.com', 'ratelimit:test:user123');
    console.log('🧹 Cleaned up test keys\n');

    console.log('✅ All Redis tests passed!\n');
    console.log('📊 Your app can use these key patterns:');
    console.log('   - qai:score:<domain>');
    console.log('   - fleet:origins');
    console.log('   - ratelimit:<identifier>');
    console.log('   - rate-limit:<identifier>');

  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

