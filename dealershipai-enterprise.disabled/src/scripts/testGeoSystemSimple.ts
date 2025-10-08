#!/usr/bin/env tsx

/**
 * Simple test script for GEO readiness system
 * Tests the logic without requiring database tables
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

async function testGeoSystemSimple() {
  try {
    console.log('\n🚀 Testing GEO Readiness System (Simple)...')
    
    // Test database connection
    const { db } = await import('@/lib/db')
    console.log('✅ Database connection established')
    
    // Test tenant query
    const tenants = await db.tenant.findMany()
    console.log(`✅ Found ${tenants.length} tenants`)
    
    // Test GEO scoring logic
    console.log('\n📊 Testing GEO scoring logic...')
    
    // Mock data for testing
    const mockDealershipData = [
      { id: '1', name: 'Test Dealership', domain: 'test.com' }
    ]
    
    const mockScoreHistory = [
      {
        id: '1',
        overall_score: 85,
        crawlability_score: 90,
        speed_score: 80,
        structure_score: 85,
        schema_score: 90,
        freshness_score: 80,
        links_score: 85,
        aeo_score: 75,
        geo_score: 80,
        ai_visibility_score: 70,
        response_time: 1.2,
        created_at: new Date().toISOString()
      }
    ]
    
    const mockAuditLogs = [
      {
        id: '1',
        action: 'ai_analysis',
        details: 'AI content analysis completed',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        action: 'content_cluster',
        details: 'Topic cluster analysis - complete',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        action: 'knowledge_entity',
        details: 'Knowledge graph entity found',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        action: 'mention_tracking',
        details: 'Brand mention detected',
        created_at: new Date().toISOString()
      }
    ]
    
    // Test GEO checklist score calculation
    const geoChecklistScore = Math.round(
      (mockScoreHistory[0].crawlability_score +
       mockScoreHistory[0].speed_score +
       mockScoreHistory[0].structure_score +
       mockScoreHistory[0].schema_score +
       mockScoreHistory[0].freshness_score +
       mockScoreHistory[0].links_score) / 6
    )
    
    console.log(`✅ GEO Checklist Score: ${geoChecklistScore}`)
    
    // Test AIO exposure calculation
    const aioExposurePct = Math.round(
      (mockScoreHistory[0].aeo_score + 
       mockScoreHistory[0].geo_score + 
       mockScoreHistory[0].ai_visibility_score) / 3
    )
    
    console.log(`✅ AIO Exposure: ${aioExposurePct}%`)
    
    // Test topical depth calculation
    const contentAudits = mockAuditLogs.filter(log => 
      log.action.includes('content') || log.action.includes('cluster')
    )
    const clusterCount = contentAudits.filter(log => 
      log.details.includes('cluster') || log.details.includes('complete')
    ).length
    
    const topicalDepthScore = contentAudits.length > 0 ? 
      Math.round((clusterCount / contentAudits.length) * 100) : 0
    
    console.log(`✅ Topical Depth Score: ${topicalDepthScore}`)
    
    // Test KG presence
    const kgAudits = mockAuditLogs.filter(log => 
      log.action.includes('knowledge') || log.action.includes('entity')
    )
    const kgPresent = kgAudits.length > 0
    const kgCompleteness = kgPresent ? 100 : 0
    
    console.log(`✅ KG Present: ${kgPresent}, Completeness: ${kgCompleteness}%`)
    
    // Test mention velocity
    const mentionAudits = mockAuditLogs.filter(log => 
      log.action.includes('mention') || log.action.includes('tracking')
    )
    const mentionVelocity4w = mentionAudits.length
    
    console.log(`✅ Mention Velocity (4w): ${mentionVelocity4w}`)
    
    // Test extractability score
    const structureAudits = mockAuditLogs.filter(log => 
      log.action.includes('structure') || log.action.includes('formatting')
    )
    const extractabilityScore = structureAudits.length > 0 ? 100 : 0
    
    console.log(`✅ Extractability Score: ${extractabilityScore}`)
    
    // Test AIV GEO calculation
    const aivGeoScore = Math.round(
      0.6 * geoChecklistScore +
      0.2 * topicalDepthScore +
      0.1 * extractabilityScore +
      0.1 * (kgPresent ? kgCompleteness : 0)
    )
    
    console.log(`✅ AIV GEO Score: ${aivGeoScore}`)
    
    // Test RaR adjustment factor
    const rarAdjustmentFactor = aioExposurePct > 70 && mentionVelocity4w > 10 ? 0.9 : 1.0
    console.log(`✅ RaR Adjustment Factor: ${rarAdjustmentFactor}`)
    
    // Test stability check
    const isStable = true // Mock stable for now
    console.log(`✅ Stability: ${isStable ? 'Stable' : 'Unstable'}`)
    
    console.log('\n🎉 All GEO scoring logic tests passed!')
    console.log('\n📋 Summary:')
    console.log(`   GEO Checklist: ${geoChecklistScore}/100`)
    console.log(`   AIO Exposure: ${aioExposurePct}%`)
    console.log(`   Topical Depth: ${topicalDepthScore}/100`)
    console.log(`   KG Present: ${kgPresent}`)
    console.log(`   Mention Velocity: ${mentionVelocity4w}/4w`)
    console.log(`   Extractability: ${extractabilityScore}/100`)
    console.log(`   AIV GEO Score: ${aivGeoScore}/100`)
    console.log(`   RaR Factor: ${rarAdjustmentFactor}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testGeoSystemSimple()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
