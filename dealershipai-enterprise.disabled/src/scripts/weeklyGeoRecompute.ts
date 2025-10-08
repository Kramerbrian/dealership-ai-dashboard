#!/usr/bin/env tsx

/**
 * Weekly GEO signals recomputation job
 * Runs every Monday morning before elasticity calculations
 */

import { db } from '@/lib/db'
import { recomputeGeoSignalsForElasticity, checkGeoStability } from '@/lib/scoring/geoIntegration'

async function weeklyGeoRecompute() {
  console.log('Starting weekly GEO signals recomputation...')
  
  try {
    // Get all active tenants
    const tenants = await db.tenant.findMany({
      where: { subscription_status: 'active' },
      select: { id: true, name: true }
    })
    
    console.log(`Found ${tenants.length} active tenants`)
    
    const results = []
    
    for (const tenant of tenants) {
      try {
        console.log(`Processing tenant: ${tenant.name} (${tenant.id})`)
        
        // Recompute GEO signals
        await recomputeGeoSignalsForElasticity(tenant.id)
        
        // Check stability
        const stability = await checkGeoStability(tenant.id)
        
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          status: 'success',
          stability: stability.isStable ? 'stable' : 'unstable',
          maxChange: stability.maxChange
        })
        
        console.log(`✅ ${tenant.name}: ${stability.isStable ? 'Stable' : 'Unstable'} (max change: ${stability.maxChange})`)
        
      } catch (error) {
        console.error(`❌ Error processing tenant ${tenant.name}:`, error)
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Log summary
    const successful = results.filter(r => r.status === 'success').length
    const failed = results.filter(r => r.status === 'error').length
    const unstable = results.filter(r => r.stability === 'unstable').length
    
    console.log('\n📊 Weekly GEO Recompute Summary:')
    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Unstable: ${unstable}`)
    
    // Log unstable tenants for review
    if (unstable > 0) {
      console.log('\n⚠️  Unstable tenants requiring review:')
      results
        .filter(r => r.stability === 'unstable')
        .forEach(r => {
          console.log(`  - ${r.tenantName}: max change ${r.maxChange}`)
        })
    }
    
    // Log failed tenants
    if (failed > 0) {
      console.log('\n❌ Failed tenants:')
      results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`  - ${r.tenantName}: ${r.error}`)
        })
    }
    
    console.log('\n✅ Weekly GEO recompute completed successfully')
    
  } catch (error) {
    console.error('❌ Fatal error in weekly GEO recompute:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  weeklyGeoRecompute()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

export { weeklyGeoRecompute }
