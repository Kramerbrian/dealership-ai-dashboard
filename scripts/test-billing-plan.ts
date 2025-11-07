#!/usr/bin/env tsx
/**
 * Test script to verify billing plan retrieval
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getPlan, gate } from '@/lib/billing/plan';

async function testBillingPlan() {
  console.log('🧪 Testing Billing Plan Retrieval\n');

  // Verify env vars are loaded
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log(`📋 Environment Check:`);
  console.log(`  Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Service Role Key: ${serviceRole ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !serviceRole) {
    console.error('❌ Missing required Supabase environment variables');
    process.exit(1);
  }

  const tenantId = 'test-tenant-123';

  try {
    // Test 1: Get plan
    console.log(`📋 Fetching plan for tenant: ${tenantId}`);
    const plan = await getPlan(tenantId);
    console.log(`✅ Plan: ${plan}\n`);

    // Test 2: Feature gating
    console.log('🔒 Testing Feature Gates:');
    
    const freeFeature = gate(plan, 'free', '✅ Available', '❌ Locked');
    const proFeature = gate(plan, 'pro', '✅ Available', '❌ Locked');
    const enterpriseFeature = gate(plan, 'enterprise', '✅ Available', '❌ Locked');

    console.log(`  Free feature: ${freeFeature}`);
    console.log(`  Pro feature: ${proFeature}`);
    console.log(`  Enterprise feature: ${enterpriseFeature}\n`);

    // Test 3: Plan hierarchy
    console.log('📊 Plan Hierarchy:');
    const hierarchy = { free: 0, pro: 1, enterprise: 2 };
    const currentLevel = hierarchy[plan];
    console.log(`  Current plan level: ${currentLevel}`);
    console.log(`  Can access free: ${currentLevel >= 0}`);
    console.log(`  Can access pro: ${currentLevel >= 1}`);
    console.log(`  Can access enterprise: ${currentLevel >= 2}\n`);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testBillingPlan();

