#!/usr/bin/env node

const jwt = require('jsonwebtoken');

// Generate a test JWT token
const payload = {
  tenant_id: '00000000-0000-0000-0000-000000000000',
  aud: 'dealershipai',
  iss: 'supabase',
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  nbf: Math.floor(Date.now() / 1000),
  jti: 'test-jti-' + Date.now()
};

const secret = 'your-jwt-secret-here';
const token = jwt.sign(payload, secret);

console.log('Test JWT Token:');
console.log(token);
console.log('\nPayload:');
console.log(JSON.stringify(payload, null, 2));
console.log('\nUse this token in your test requests:');
console.log(`Authorization: Bearer ${token}`);
