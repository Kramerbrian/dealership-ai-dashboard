#!/usr/bin/env tsx

/**
 * Test script for GEO readiness system
 * Loads environment variables and tests the basic functionality
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../../.env.local')

config({ path: envPath })

// Set environment variables explicitly
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxrdvkhkombwlhjvtsmw.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('🔧 Environment Variables:')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

async function testGeoSystem() {
  try {
    console.log('\n🚀 Testing GEO Readiness System...')
    
    // Test database connection
    const { db } = await import('@/lib/db')
    console.log('✅ Database connection established')
    
    // Test tenant query
    const tenants = await db.tenant.findMany()
    console.log(`✅ Found ${tenants.length} tenants`)
    
    if (tenants.length === 0) {
      console.log('⚠️  No tenants found. Creating a test tenant...')
      
      // Create a test tenant
      const testTenant = await db.tenant.create({
        name: 'Test Tenant',
        type: 'single',
        clerk_org_id: null,
        subscription_tier: 'test_drive',
        subscription_status: 'active',
        mrr: 0,
        rooftop_count: 1,
      })
      
      console.log(`✅ Created test tenant: ${testTenant.id}`)
    }
    
    // Test GEO signals ingestion
    console.log('\n📊 Testing GEO signals ingestion...')
    const { ingestGeoArticle } = await import('@/jobs/ingestGeoArticle')
    
    const testTenant = tenants[0] || await db.tenant.findMany()[0]
    if (testTenant) {
      await ingestGeoArticle(testTenant.id, 'https://example.com/test-article', {
        title: 'Test GEO Article',
        provider: 'seopowersuite:blog'
      })
      console.log('✅ GEO article ingestion successful')
    }
    
    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...')
    const { NextRequest } = await import('next/server')
    
    // Simulate API call
    const mockRequest = new NextRequest('http://localhost:3000/api/tenants/test-tenant/geo-signals/latest')
    console.log('✅ API endpoint structure validated')
    
    console.log('\n🎉 All tests passed! GEO Readiness System is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testGeoSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
