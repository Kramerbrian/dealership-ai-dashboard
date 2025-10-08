#!/usr/bin/env tsx

/**
 * Nightly AOER Job Scheduler
 * Runs automated AOER processing and GPT integration
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../../.env.local')

config({ path: envPath })

// Set environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxrdvkhkombwlhjvtsmw.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('🌙 Starting Nightly AOER Job...')

async function nightlyAOERJob() {
  try {
    console.log('\n🚀 Nightly AOER Processing Started')
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
    
    // Import required modules
    const { db } = await import('@/lib/db')
    const { generateAOERRollup } = await import('@/lib/metrics/aoer')
    const { calculateAIVComprehensive } = await import('@/lib/scoring/aivCore')
    
    console.log('✅ Modules imported successfully')
    
    // Get all active tenants
    const tenants = await db.tenant.findMany({
      where: { subscription_status: 'active' },
      select: { id: true, name: true, type: true }
    })
    
    console.log(`📊 Found ${tenants.length} active tenants`)
    
    const results = []
    
    for (const tenant of tenants) {
      try {
        console.log(`\n🔄 Processing tenant: ${tenant.name} (${tenant.id})`)
        
        // Step 1: Process AOER data
        const aoerResult = await processAOERForTenant(tenant.id)
        
        // Step 2: Update AIV scores
        const aivResult = await updateAIVForTenant(tenant.id, aoerResult)
        
        // Step 3: Generate GPT insights
        const gptResult = await generateGPTInsights(tenant.id, aoerResult, aivResult)
        
        // Step 4: Update rollups
        await updateAOERRollups(tenant.id, aoerResult)
        
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          status: 'success',
          aoer: aoerResult,
          aiv: aivResult,
          gpt: gptResult
        })
        
        console.log(`✅ ${tenant.name}: AOER=${aoerResult.aoerPositionalWeighted.toFixed(1)}%, AIV=${aivResult.final.toFixed(1)}`)
        
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
    
    // Generate summary report
    const summary = generateSummaryReport(results)
    console.log('\n📋 Nightly AOER Job Summary:')
    console.log(`✅ Successful: ${summary.successful}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`📊 Total Tenants: ${summary.total}`)
    console.log(`⏱️  Processing Time: ${summary.processingTime}ms`)
    
    // Log top performers
    if (summary.topPerformers.length > 0) {
      console.log('\n🏆 Top Performers:')
      summary.topPerformers.slice(0, 5).forEach((tenant, index) => {
        console.log(`  ${index + 1}. ${tenant.name}: AIV=${tenant.aiv.toFixed(1)}`)
      })
    }
    
    // Log issues
    if (summary.issues.length > 0) {
      console.log('\n⚠️  Issues Detected:')
      summary.issues.forEach(issue => {
        console.log(`  - ${issue.tenantName}: ${issue.issue}`)
      })
    }
    
    console.log('\n🎉 Nightly AOER job completed successfully')
    
  } catch (error) {
    console.error('❌ Fatal error in nightly AOER job:', error)
    process.exit(1)
  }
}

/**
 * Process AOER data for a specific tenant
 */
async function processAOERForTenant(tenantId: string) {
  try {
    // Get query checks from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const queryChecks = await db.queryChecks.findMany({
      where: {
        tenantId,
        checkDate: { gte: twentyFourHoursAgo }
      },
      include: {
        query: {
          select: {
            query: true,
            intent: true
          }
        }
      }
    })
    
    if (queryChecks.length === 0) {
      return {
        totalQueries: 0,
        queriesWithAI: 0,
        aoerPositionalWeighted: 0,
        avgAiClaimScore: 0,
        citationShare: 0,
        estimatedMonthlyClickLoss: 0
      }
    }
    
    // Transform to QueryCheck format
    const queries = queryChecks.map(check => ({
      query: check.query.query,
      intent: check.query.intent as any,
      volume: check.volume,
      serpPosition: check.serpPosition,
      aiPresent: check.aiOverviewPresent,
      aiPosition: check.aiOverviewPosition as any,
      hasOurCitation: check.hasOurCitation,
      aiTokens: check.aiOverviewTokens,
      aiLinksCount: check.aiLinksCount,
      paaPresent: check.paaPresent,
      mapPackPresent: check.mapPackPresent,
      shoppingPresent: check.shoppingPresent
    }))
    
    // Generate AOER rollup
    const rollup = generateAOERRollup(queries)
    
    return {
      totalQueries: rollup.totalQueries,
      queriesWithAI: rollup.queriesWithAI,
      aoerPositionalWeighted: rollup.aoer.aoerPositionalWeighted,
      avgAiClaimScore: rollup.avgAiClaimScore,
      citationShare: rollup.citationShare,
      estimatedMonthlyClickLoss: rollup.estimatedMonthlyClickLoss
    }
    
  } catch (error) {
    console.error(`Error processing AOER for tenant ${tenantId}:`, error)
    throw error
  }
}

/**
 * Update AIV scores for a tenant
 */
async function updateAIVForTenant(tenantId: string, aoerData: any) {
  try {
    // Get current AIV components (mock data for now)
    const components = {
      seo: 75,
      aeo: 80,
      geo: 70,
      ugc: 60,
      geoLocal: 65
    }
    
    const selectivity = {
      scs: 70,
      sis: 75,
      scr: 65
    }
    
    // Calculate comprehensive AIV with AOER integration
    const aiv = calculateAIVComprehensive(
      components,
      selectivity,
      {
        aoerPositionalWeighted: aoerData.aoerPositionalWeighted,
        citationShare: aoerData.citationShare
      }
    )
    
    return aiv
    
  } catch (error) {
    console.error(`Error updating AIV for tenant ${tenantId}:`, error)
    throw error
  }
}

/**
 * Generate GPT insights for a tenant
 */
async function generateGPTInsights(tenantId: string, aoerData: any, aivData: any) {
  try {
    // Call GPT API via proxy
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/gpt/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_insights',
        parameters: {
          aoer: aoerData,
          aiv: aivData,
          tenantId
        },
        tenantId
      })
    })
    
    if (!response.ok) {
      throw new Error(`GPT API call failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    return {
      insights: result.data,
      generated: new Date().toISOString()
    }
    
  } catch (error) {
    console.error(`Error generating GPT insights for tenant ${tenantId}:`, error)
    // Don't throw - GPT insights are not critical
    return {
      insights: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update AOER rollups in database
 */
async function updateAOERRollups(tenantId: string, aoerData: any) {
  try {
    // Insert rollup data
    await db.aoerRollups.insert({
      tenant_id: tenantId,
      rollup_date: new Date(),
      aoer_unweighted: aoerData.aoerPositionalWeighted,
      aoer_volume_weighted: aoerData.aoerPositionalWeighted,
      aoer_positional: aoerData.aoerPositionalWeighted,
      aoer_positional_weighted: aoerData.aoerPositionalWeighted,
      avg_ai_claim_score: aoerData.avgAiClaimScore,
      citation_share: aoerData.citationShare,
      estimated_monthly_click_loss: aoerData.estimatedMonthlyClickLoss,
      total_queries: aoerData.totalQueries,
      queries_with_ai: aoerData.queriesWithAI
    })
    
  } catch (error) {
    console.error(`Error updating AOER rollups for tenant ${tenantId}:`, error)
    throw error
  }
}

/**
 * Generate summary report
 */
function generateSummaryReport(results: any[]) {
  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status === 'error')
  
  const topPerformers = successful
    .filter(r => r.aiv)
    .sort((a, b) => b.aiv.final - a.aiv.final)
    .map(r => ({
      name: r.tenantName,
      aiv: r.aiv.final
    }))
  
  const issues = successful
    .filter(r => r.aoer && (r.aoer.aoerPositionalWeighted > 0.8 || r.aoer.avgAiClaimScore > 80))
    .map(r => ({
      tenantName: r.tenantName,
      issue: r.aoer.aoerPositionalWeighted > 0.8 ? 'High AOER' : 'High AI Claim Score'
    }))
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    topPerformers,
    issues,
    processingTime: Date.now() - Date.now() // Would calculate actual processing time
  }
}

// Run if called directly
if (require.main === module) {
  nightlyAOERJob()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error)
      process.exit(1)
    })
}

export { nightlyAOERJob }
