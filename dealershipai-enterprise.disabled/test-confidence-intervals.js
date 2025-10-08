#!/usr/bin/env node

/**
 * Test Confidence Interval Calculations
 * Demonstrates the confidence interval functions with your examples
 */

// Import the confidence interval functions
const { 
  aiVisibilityCI, 
  conversionRateCI, 
  revenueCI, 
  formatCI 
} = require('./src/lib/confidence-intervals.ts')

console.log('🧮 DealershipAI Confidence Interval Calculations\n')

// Test AI Visibility Scores
console.log('1. AI Visibility Scores:')
const aiScores = [78, 82, 75, 85, 79, 81, 77, 83, 80, 76]
const aiCI = aiVisibilityCI(aiScores)
console.log(`   Scores: [${aiScores.join(', ')}]`)
console.log(`   Result: ${aiCI.mean} (95% CI: ${aiCI.lower}-${aiCI.upper})`)
console.log(`   Sample Size: ${aiCI.sampleSize}`)
console.log()

// Test Conversion Rate
console.log('2. Conversion Rate:')
const conversions = 45
const total = 1000
const conversionCI = conversionRateCI(conversions, total)
console.log(`   Conversions: ${conversions} out of ${total}`)
console.log(`   Result: ${conversionCI.mean} (95% CI: ${conversionCI.lower}-${conversionCI.upper})`)
console.log(`   Percentage: ${(conversionCI.mean * 100).toFixed(1)}% (95% CI: ${(conversionCI.lower * 100).toFixed(1)}%-${(conversionCI.upper * 100).toFixed(1)}%)`)
console.log()

// Test Revenue Impact
console.log('3. Revenue Impact:')
const revenues = [15000, 18000, 16500, 22000, 19500]
const revenueCI = revenueCI(revenues)
console.log(`   Revenues: [${revenues.map(r => `$${r.toLocaleString()}`).join(', ')}]`)
console.log(`   Result: $${revenueCI.mean.toLocaleString()} (95% CI: $${revenueCI.lower.toLocaleString()}-$${revenueCI.upper.toLocaleString()})`)
console.log(`   Sample Size: ${revenueCI.sampleSize}`)
console.log()

// Additional examples
console.log('4. Additional Examples:')

// Click-through rate
const ctrCI = conversionRateCI(120, 5000)
console.log(`   Click-through Rate: ${(ctrCI.mean * 100).toFixed(2)}% (95% CI: ${(ctrCI.lower * 100).toFixed(2)}%-${(ctrCI.upper * 100).toFixed(2)}%)`)

// Session duration
const sessionDurations = [180, 220, 195, 250, 210, 185, 230, 200, 175, 240]
const durationCI = sessionDurationCI(sessionDurations)
console.log(`   Session Duration: ${durationCI.mean}s (95% CI: ${durationCI.lower}s-${durationCI.upper}s)`)

// Bounce rate
const bounceCI = conversionRateCI(350, 1000)
console.log(`   Bounce Rate: ${(bounceCI.mean * 100).toFixed(1)}% (95% CI: ${(bounceCI.lower * 100).toFixed(1)}%-${(bounceCI.upper * 100).toFixed(1)}%)`)

console.log('\n✅ All confidence interval calculations completed successfully!')
console.log('\n📊 Key Insights:')
console.log(`   • AI Visibility is ${aiCI.mean} with a range of ${aiCI.upper - aiCI.lower} points`)
console.log(`   • Conversion rate is ${(conversionCI.mean * 100).toFixed(1)}% with ${conversionCI.sampleSize} total visitors`)
console.log(`   • Average revenue is $${revenueCI.mean.toLocaleString()} with ${revenueCI.sampleSize} data points`)
console.log(`   • All calculations use 95% confidence intervals for statistical reliability`)
