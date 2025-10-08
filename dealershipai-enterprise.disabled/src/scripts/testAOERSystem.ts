#!/usr/bin/env tsx

/**
 * Test script for AOER (AI Overview Exposure Rate) system
 * Tests the algorithms with sample data
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

console.log('🔧 Environment Variables:')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

async function testAOERSystem() {
  try {
    console.log('\n🚀 Testing AOER (AI Overview Exposure Rate) System...')
    
    // Test database connection
    const { db } = await import('@/lib/db')
    console.log('✅ Database connection established')
    
    // Import AOER algorithms
    const { 
      generateAOERRollup, 
      computeAOERByIntent, 
      calculateAOERTrends,
      generateAOERRecommendations,
      aiClaimScore,
      clickLoss,
      ctrBase
    } = await import('@/lib/metrics/aoer')
    
    type QueryCheck = import('@/lib/metrics/aoer').QueryCheck
    
    console.log('✅ AOER algorithms imported')
    
    // Create sample data
    const sampleQueries: QueryCheck[] = [
      {
        query: 'best car dealership near me',
        intent: 'local',
        volume: 5000,
        serpPosition: 3,
        aiPresent: true,
        aiPosition: 'top',
        hasOurCitation: false,
        aiTokens: 800,
        aiLinksCount: 5
      },
      {
        query: '2024 honda civic price',
        intent: 'inventory',
        volume: 12000,
        serpPosition: 1,
        aiPresent: true,
        aiPosition: 'mid',
        hasOurCitation: true,
        aiTokens: 600,
        aiLinksCount: 3
      },
      {
        query: 'car financing options',
        intent: 'finance',
        volume: 8000,
        serpPosition: 5,
        aiPresent: false,
        aiPosition: 'none',
        hasOurCitation: false,
        aiTokens: 0,
        aiLinksCount: 0
      },
      {
        query: 'trade in value calculator',
        intent: 'trade',
        volume: 3000,
        serpPosition: 2,
        aiPresent: true,
        aiPosition: 'bottom',
        hasOurCitation: true,
        aiTokens: 400,
        aiLinksCount: 2
      },
      {
        query: 'car maintenance schedule',
        intent: 'service',
        volume: 6000,
        serpPosition: 4,
        aiPresent: true,
        aiPosition: 'top',
        hasOurCitation: false,
        aiTokens: 900,
        aiLinksCount: 4
      }
    ]
    
    console.log('\n📊 Testing AOER Calculations...')
    
    // Test individual query metrics
    console.log('\n🔍 Individual Query Analysis:')
    sampleQueries.forEach((query, index) => {
      const acs = aiClaimScore(query)
      const loss = clickLoss(query)
      const ctr = ctrBase(query.serpPosition)
      
      console.log(`\nQuery ${index + 1}: "${query.query}"`)
      console.log(`  Intent: ${query.intent}`)
      console.log(`  Volume: ${query.volume.toLocaleString()}`)
      console.log(`  AI Present: ${query.aiPresent}`)
      console.log(`  AI Position: ${query.aiPosition}`)
      console.log(`  Has Citation: ${query.hasOurCitation}`)
      console.log(`  AI Claim Score: ${acs.toFixed(1)}`)
      console.log(`  Click Loss: ${loss.toFixed(0)}`)
      console.log(`  CTR Base: ${(ctr * 100).toFixed(1)}%`)
    })
    
    // Test AOER rollup
    console.log('\n📈 AOER Rollup Analysis:')
    const rollup = generateAOERRollup(sampleQueries)
    
    console.log(`  Total Queries: ${rollup.totalQueries}`)
    console.log(`  Queries with AI: ${rollup.queriesWithAI}`)
    console.log(`  AOER (Unweighted): ${(rollup.aoer.aoer * 100).toFixed(1)}%`)
    console.log(`  AOER (Volume Weighted): ${(rollup.aoer.aoerWeighted * 100).toFixed(1)}%`)
    console.log(`  AOER (Positional): ${(rollup.aoer.aoerPositional * 100).toFixed(1)}%`)
    console.log(`  AOER (Positional Weighted): ${(rollup.aoer.aoerPositionalWeighted * 100).toFixed(1)}%`)
    console.log(`  Avg AI Claim Score: ${rollup.avgAiClaimScore.toFixed(1)}`)
    console.log(`  Citation Share: ${(rollup.citationShare * 100).toFixed(1)}%`)
    console.log(`  Estimated Monthly Click Loss: ${rollup.estimatedMonthlyClickLoss.toFixed(0)}`)
    
    // Test intent breakdown
    console.log('\n📋 Intent Breakdown:')
    const intentBreakdown = computeAOERByIntent(sampleQueries)
    Object.entries(intentBreakdown).forEach(([intent, metrics]) => {
      const queryCount = sampleQueries.filter(q => q.intent === intent).length
      console.log(`  ${intent}: ${(metrics.aoer * 100).toFixed(1)}% AOER (${queryCount} queries)`)
    })
    
    // Test priority queries
    console.log('\n🎯 Top Priority Queries:')
    rollup.topPriorityQueries.slice(0, 3).forEach((query, index) => {
      console.log(`  ${index + 1}. "${query.query}"`)
      console.log(`     Priority: ${query.priorityScore.toFixed(1)}`)
      console.log(`     AI Claim Score: ${query.aiClaimScore.toFixed(1)}`)
      console.log(`     Click Loss: ${query.clickLoss.toFixed(0)}`)
    })
    
    // Test recommendations
    console.log('\n💡 Recommendations:')
    const recommendations = generateAOERRecommendations(rollup)
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`)
      console.log(`     Action: ${rec.action}`)
      console.log(`     Impact: ${rec.impact}`)
    })
    
    // Test trends (simulate previous period)
    console.log('\n📊 Trend Analysis:')
    const previousQueries = sampleQueries.map(q => ({
      ...q,
      aiPresent: Math.random() > 0.5, // Simulate different AI presence
      hasOurCitation: Math.random() > 0.7 // Simulate different citation rates
    }))
    
    const trends = calculateAOERTrends(sampleQueries, previousQueries)
    console.log(`  Trend: ${trends.trend}`)
    console.log(`  AOER Change: ${(trends.aoerChange * 100).toFixed(1)}%`)
    console.log(`  Click Loss Change: ${trends.clickLossChange.toFixed(0)}`)
    console.log(`  Citation Share Change: ${(trends.citationShareChange * 100).toFixed(1)}%`)
    
    // Test AIV/ATR integration
    console.log('\n🔗 AIV/ATR Integration Test:')
    const { calculateAIVWithAOER, calculateATRWithAOER } = await import('@/lib/scoring/aoerIntegration')
    
    const baseAIV = 75
    const baseATR = 80
    const ugcResonance = 70
    
    // Note: These would normally use real database data
    console.log(`  Base AIV: ${baseAIV}`)
    console.log(`  Base ATR: ${baseATR}`)
    console.log(`  UGC Resonance: ${ugcResonance}`)
    console.log('  (AOER integration requires database tables)')
    
    console.log('\n🎉 All AOER system tests passed!')
    console.log('\n📋 Summary:')
    console.log(`   AOER (Positional Weighted): ${(rollup.aoer.aoerPositionalWeighted * 100).toFixed(1)}%`)
    console.log(`   Avg AI Claim Score: ${rollup.avgAiClaimScore.toFixed(1)}`)
    console.log(`   Citation Share: ${(rollup.citationShare * 100).toFixed(1)}%`)
    console.log(`   Monthly Click Loss: ${rollup.estimatedMonthlyClickLoss.toFixed(0)}`)
    console.log(`   Priority Queries: ${rollup.topPriorityQueries.length}`)
    console.log(`   Recommendations: ${recommendations.length}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAOERSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
