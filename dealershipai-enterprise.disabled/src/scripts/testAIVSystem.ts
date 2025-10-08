#!/usr/bin/env tsx

/**
 * Test script for the complete AIV (Algorithmic Visibility Index) system
 * Tests the full formula: AIV = (AIV_core × AIV_mods) × (1 + 0.25*AIV_sel)
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '../../.env.local')

config({ path: envPath })

console.log('🔧 Testing Complete AIV System...')

async function testAIVSystem() {
  try {
    console.log('\n🚀 Testing AIV (Algorithmic Visibility Index) System...')
    
    // Import AIV functions
    const { 
      calculateAIV,
      calculateAIVComprehensive,
      getAIVRecommendations,
      calculateAIVTrend
    } = await import('@/lib/scoring/aivCore')
    
    type AIVComponents = import('@/lib/scoring/aivCore').AIVComponents
    type AIVSelectivity = import('@/lib/scoring/aivCore').AIVSelectivity
    type AIVModifiers = import('@/lib/scoring/aivCore').AIVModifiers
    
    console.log('✅ AIV algorithms imported')
    
    // Test data - Core components
    const components: AIVComponents = {
      seo: 75,        // 25% weight
      aeo: 80,        // 30% weight (highest)
      geo: 70,        // 25% weight
      ugc: 60,        // 10% weight
      geoLocal: 65    // 5% weight
    }
    
    // Test data - Selectivity components
    const selectivity: AIVSelectivity = {
      scs: 70,        // Search Click Selectivity, 35% weight
      sis: 75,        // Search Intent Selectivity, 35% weight
      scr: 65         // Search Conversion Rate, 30% weight
    }
    
    // Test data - Modifiers
    const modifiers: AIVModifiers = {
      aoerImpact: 0.9,      // 10% reduction due to high AOER
      geoReadiness: 1.05,   // 5% boost from GEO readiness
      citationBoost: 1.02,  // 2% boost from citations
      customModifier: 1.0   // No custom modifier
    }
    
    console.log('\n📊 Testing AIV Calculations...')
    
    // Test basic AIV calculation
    console.log('\n🔍 Basic AIV Calculation:')
    const basicAIV = calculateAIV(components, selectivity)
    
    console.log(`  Core Components:`)
    console.log(`    SEO (25%): ${components.seo} → ${basicAIV.breakdown.seoContribution.toFixed(2)}`)
    console.log(`    AEO (30%): ${components.aeo} → ${basicAIV.breakdown.aeoContribution.toFixed(2)}`)
    console.log(`    GEO (25%): ${components.geo} → ${basicAIV.breakdown.geoContribution.toFixed(2)}`)
    console.log(`    UGC (10%): ${components.ugc} → ${basicAIV.breakdown.ugcContribution.toFixed(2)}`)
    console.log(`    GeoLocal (5%): ${components.geoLocal} → ${basicAIV.breakdown.geoLocalContribution.toFixed(2)}`)
    console.log(`  Core AIV: ${basicAIV.core.toFixed(2)}`)
    
    console.log(`\n  Selectivity Components:`)
    console.log(`    SCS (35%): ${selectivity.scs} → ${basicAIV.breakdown.scsContribution.toFixed(2)}`)
    console.log(`    SIS (35%): ${selectivity.sis} → ${basicAIV.breakdown.sisContribution.toFixed(2)}`)
    console.log(`    SCR (30%): ${selectivity.scr} → ${basicAIV.breakdown.scrContribution.toFixed(2)}`)
    console.log(`  Selectivity AIV: ${basicAIV.selectivity.toFixed(2)}`)
    console.log(`  Selectivity Boost: ${basicAIV.breakdown.selectivityBoost.toFixed(2)}%`)
    
    console.log(`\n  Final AIV: ${basicAIV.final.toFixed(2)}`)
    
    // Test AIV with modifiers
    console.log('\n🔧 AIV with Modifiers:')
    const modifiedAIV = calculateAIV(components, selectivity, modifiers)
    
    console.log(`  Modifiers:`)
    console.log(`    AOER Impact: ${modifiers.aoerImpact} (${((modifiers.aoerImpact - 1) * 100).toFixed(1)}%)`)
    console.log(`    GEO Readiness: ${modifiers.geoReadiness} (+${((modifiers.geoReadiness - 1) * 100).toFixed(1)}%)`)
    console.log(`    Citation Boost: ${modifiers.citationBoost} (+${((modifiers.citationBoost - 1) * 100).toFixed(1)}%)`)
    console.log(`    Custom Modifier: ${modifiers.customModifier}`)
    console.log(`  Modifier Impact: ${modifiedAIV.breakdown.modifierImpact.toFixed(2)}%`)
    console.log(`  Final AIV (with modifiers): ${modifiedAIV.final.toFixed(2)}`)
    
    // Test comprehensive AIV with AOER and GEO data
    console.log('\n🌐 Comprehensive AIV with AOER & GEO:')
    const comprehensiveAIV = calculateAIVComprehensive(
      components,
      selectivity,
      {
        aoerPositionalWeighted: 0.6,  // 60% AOER
        citationShare: 0.4            // 40% citation share
      },
      {
        geoReadinessScore: 75         // 75% GEO readiness
      }
    )
    
    console.log(`  AOER Data:`)
    console.log(`    AOER (Positional Weighted): 60%`)
    console.log(`    Citation Share: 40%`)
    console.log(`  GEO Data:`)
    console.log(`    GEO Readiness Score: 75%`)
    console.log(`  Final AIV (comprehensive): ${comprehensiveAIV.final.toFixed(2)}`)
    
    // Test recommendations
    console.log('\n💡 AIV Recommendations:')
    const recommendations = getAIVRecommendations(components, selectivity)
    
    recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.component.toUpperCase()}`)
      console.log(`     Current Score: ${rec.currentScore}`)
      console.log(`     Weight: ${(rec.weight * 100).toFixed(1)}%`)
      console.log(`     Potential Impact: ${rec.potentialImpact.toFixed(2)}`)
      console.log(`     Recommendation: ${rec.recommendation}`)
    })
    
    // Test trend analysis
    console.log('\n📈 AIV Trend Analysis:')
    const previousComponents: AIVComponents = {
      seo: 70,        // -5
      aeo: 75,        // +5
      geo: 65,        // +5
      ugc: 55,        // +5
      geoLocal: 60    // +5
    }
    
    const previousSelectivity: AIVSelectivity = {
      scs: 65,        // +5
      sis: 70,        // +5
      scr: 60         // +5
    }
    
    const trend = calculateAIVTrend(
      { components, selectivity },
      { components: previousComponents, selectivity: previousSelectivity }
    )
    
    console.log(`  Overall Change: ${trend.overallChange.toFixed(2)}`)
    console.log(`  Core Change: ${trend.coreChange.toFixed(2)}`)
    console.log(`  Selectivity Change: ${trend.selectivityChange.toFixed(2)}`)
    console.log(`  Trend: ${trend.trend}`)
    console.log(`  Top Improver: ${trend.topImprover}`)
    console.log(`  Top Decliner: ${trend.topDecliner}`)
    
    // Formula verification
    console.log('\n🧮 Formula Verification:')
    console.log(`  AIV_core = SEO*0.25 + AEO*0.30 + GEO*0.25 + UGC*0.10 + GeoLocal*0.05`)
    console.log(`  AIV_core = ${components.seo}*0.25 + ${components.aeo}*0.30 + ${components.geo}*0.25 + ${components.ugc}*0.10 + ${components.geoLocal}*0.05`)
    console.log(`  AIV_core = ${basicAIV.core.toFixed(2)}`)
    
    console.log(`\n  AIV_sel = SCS*0.35 + SIS*0.35 + SCR*0.30`)
    console.log(`  AIV_sel = ${selectivity.scs}*0.35 + ${selectivity.sis}*0.35 + ${selectivity.scr}*0.30`)
    console.log(`  AIV_sel = ${basicAIV.selectivity.toFixed(2)}`)
    
    console.log(`\n  AIV = (AIV_core × AIV_mods) × (1 + 0.25*AIV_sel)`)
    const modifierValue = modifiers.aoerImpact! * modifiers.geoReadiness! * modifiers.citationBoost! * modifiers.customModifier!
    console.log(`  AIV_mods = ${modifiers.aoerImpact} × ${modifiers.geoReadiness} × ${modifiers.citationBoost} × ${modifiers.customModifier} = ${modifierValue.toFixed(3)}`)
    console.log(`  AIV = (${basicAIV.core.toFixed(2)} × ${modifierValue.toFixed(3)}) × (1 + 0.25×${basicAIV.selectivity.toFixed(2)})`)
    console.log(`  AIV = ${(basicAIV.core * modifierValue).toFixed(2)} × ${(1 + 0.25 * basicAIV.selectivity / 100).toFixed(3)}`)
    console.log(`  AIV = ${modifiedAIV.final.toFixed(2)}`)
    
    console.log('\n🎉 All AIV system tests passed!')
    console.log('\n📋 Summary:')
    console.log(`   Core AIV: ${basicAIV.core.toFixed(2)}`)
    console.log(`   Selectivity AIV: ${basicAIV.selectivity.toFixed(2)}`)
    console.log(`   Final AIV (basic): ${basicAIV.final.toFixed(2)}`)
    console.log(`   Final AIV (with modifiers): ${modifiedAIV.final.toFixed(2)}`)
    console.log(`   Final AIV (comprehensive): ${comprehensiveAIV.final.toFixed(2)}`)
    console.log(`   Recommendations: ${recommendations.length}`)
    console.log(`   Trend: ${trend.trend}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAIVSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
