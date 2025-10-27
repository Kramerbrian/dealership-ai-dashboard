#!/bin/bash

# Redis CLI Testing Script
echo "🔴 Testing Redis Connection..."

# Test Redis connection using Node.js
echo "📋 Testing Redis connection with dummy values..."

node -e "
const { Redis } = require('@upstash/redis');

// Use dummy values for testing
const redis = new Redis({
  url: 'https://dummy.upstash.io',
  token: 'dummy-token'
});

console.log('Testing Redis connection...');

// Test basic operations
redis.set('test', 'Hello World')
  .then(() => {
    console.log('✅ Redis SET operation successful');
    return redis.get('test');
  })
  .then((value) => {
    console.log('✅ Redis GET operation successful:', value);
    return redis.del('test');
  })
  .then(() => {
    console.log('✅ Redis DEL operation successful');
    console.log('🎉 Redis connection test completed!');
  })
  .catch((error) => {
    console.log('❌ Redis connection failed:', error.message);
    console.log('This is expected with dummy values.');
    console.log('Update environment variables with real Upstash credentials.');
  });
"
