#!/usr/bin/env tsx
// Mock ADA Environment
// DealershipAI - Mock environment for testing ADA APIs without full infrastructure

// Set up mock environment variables
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ADA_ENGINE_URL = 'https://mock-ada-engine.com';
process.env.ADA_ENGINE_TOKEN = 'mock-ada-token';
process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/mock';
process.env.ALERT_EMAIL = 'admin@dealershipai.com';
process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';

console.log('🔧 Mock ADA environment variables set:');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('  REDIS_URL:', process.env.REDIS_URL);
console.log('  ADA_ENGINE_URL:', process.env.ADA_ENGINE_URL);
console.log('  ADA_ENGINE_TOKEN:', process.env.ADA_ENGINE_TOKEN ? '***set***' : 'not set');
console.log('  SLACK_WEBHOOK_URL:', process.env.SLACK_WEBHOOK_URL ? '***set***' : 'not set');
console.log('  ALERT_EMAIL:', process.env.ALERT_EMAIL);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '***set***' : 'not set');

export default process.env;
