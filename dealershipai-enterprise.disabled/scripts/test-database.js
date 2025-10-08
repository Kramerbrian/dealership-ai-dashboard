#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the Supabase database connection and schema
 */

const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  
  const prisma = new PrismaClient()
  
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test tenant table
    const tenantCount = await prisma.tenant.count()
    console.log(`✅ Found ${tenantCount} tenants`)
    
    // Test user table
    const userCount = await prisma.user.count()
    console.log(`✅ Found ${userCount} users`)
    
    // Test dealership_data table
    const dataCount = await prisma.dealershipData.count()
    console.log(`✅ Found ${dataCount} dealership records`)
    
    // Test sample data
    const sampleTenant = await prisma.tenant.findFirst({
      where: { name: { contains: 'Terry Reid' } },
      include: {
        users: true,
        dealershipData: true
      }
    })
    
    if (sampleTenant) {
      console.log(`✅ Sample tenant found: ${sampleTenant.name}`)
      console.log(`   - Users: ${sampleTenant.users.length}`)
      console.log(`   - Data records: ${sampleTenant.dealershipData.length}`)
    }
    
    // Test RLS policies (if JWT is available)
    console.log('✅ Database schema and data look good!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    
    if (error.code === 'P1001') {
      console.error('   → Check your DATABASE_URL in .env.local')
    } else if (error.code === 'P2002') {
      console.error('   → Database schema might be missing')
    } else if (error.code === 'P2021') {
      console.error('   → Table does not exist - run the schema migration')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabase()
  .then(() => {
    console.log('🎉 Database test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Database test failed:', error)
    process.exit(1)
  })
