#!/usr/bin/env node

/**
 * Simple Confidence Interval Test
 * Demonstrates the calculations without TypeScript imports
 */

console.log('🧮 DealershipAI Confidence Interval Calculations\n')

// Simple confidence interval calculation functions
function calculateMean(values) {
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateStandardDeviation(values, mean) {
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function calculateConfidenceInterval(values, confidence = 0.95) {
  const n = values.length
  const mean = calculateMean(values)
  const stdDev = calculateStandardDeviation(values, mean)
  const standardError = stdDev / Math.sqrt(n)
  
  // Z-value for 95% confidence
  const zValue = 1.96
  const marginOfError = zValue * standardError
  
  return {
    mean: Math.round(mean * 10) / 10,
    lower: Math.round((mean - marginOfError) * 10) / 10,
    upper: Math.round((mean + marginOfError) * 10) / 10,
    confidence: confidence * 100,
    sampleSize: n
  }
}

function calculateProportionCI(successes, total, confidence = 0.95) {
  const p = successes / total
  const n = total
  
  // Normal approximation
  const standardError = Math.sqrt((p * (1 - p)) / n)
  const zValue = 1.96
  const marginOfError = zValue * standardError
  
  return {
    mean: Math.round(p * 1000) / 1000,
    lower: Math.max(0, Math.round((p - marginOfError) * 1000) / 1000),
    upper: Math.min(1, Math.round((p + marginOfError) * 1000) / 1000),
    confidence: confidence * 100,
    sampleSize: n
  }
}

// Test AI Visibility Scores
console.log('1. AI Visibility Scores:')
const aiScores = [78, 82, 75, 85, 79, 81, 77, 83, 80, 76]
const aiCI = calculateConfidenceInterval(aiScores)
console.log(`   Scores: [${aiScores.join(', ')}]`)
console.log(`   Result: ${aiCI.mean} (95% CI: ${aiCI.lower}-${aiCI.upper})`)
console.log(`   Sample Size: ${aiCI.sampleSize}`)
console.log()

// Test Conversion Rate
console.log('2. Conversion Rate:')
const conversions = 45
const total = 1000
const conversionCI = calculateProportionCI(conversions, total)
console.log(`   Conversions: ${conversions} out of ${total}`)
console.log(`   Result: ${conversionCI.mean} (95% CI: ${conversionCI.lower}-${conversionCI.upper})`)
console.log(`   Percentage: ${(conversionCI.mean * 100).toFixed(1)}% (95% CI: ${(conversionCI.lower * 100).toFixed(1)}%-${(conversionCI.upper * 100).toFixed(1)}%)`)
console.log()

// Test Revenue Impact
console.log('3. Revenue Impact:')
const revenues = [15000, 18000, 16500, 22000, 19500]
const revenueCI = calculateConfidenceInterval(revenues)
console.log(`   Revenues: [${revenues.map(r => `$${r.toLocaleString()}`).join(', ')}]`)
console.log(`   Result: $${revenueCI.mean.toLocaleString()} (95% CI: $${revenueCI.lower.toLocaleString()}-$${revenueCI.upper.toLocaleString()})`)
console.log(`   Sample Size: ${revenueCI.sampleSize}`)
console.log()

// Additional examples
console.log('4. Additional Examples:')

// Click-through rate
const ctrCI = calculateProportionCI(120, 5000)
console.log(`   Click-through Rate: ${(ctrCI.mean * 100).toFixed(2)}% (95% CI: ${(ctrCI.lower * 100).toFixed(2)}%-${(ctrCI.upper * 100).toFixed(2)}%)`)

// Session duration
const sessionDurations = [180, 220, 195, 250, 210, 185, 230, 200, 175, 240]
const durationCI = calculateConfidenceInterval(sessionDurations)
console.log(`   Session Duration: ${durationCI.mean}s (95% CI: ${durationCI.lower}s-${durationCI.upper}s)`)

// Bounce rate
const bounceCI = calculateProportionCI(350, 1000)
console.log(`   Bounce Rate: ${(bounceCI.mean * 100).toFixed(1)}% (95% CI: ${(bounceCI.lower * 100).toFixed(1)}%-${(bounceCI.upper * 100).toFixed(1)}%)`)

console.log('\n✅ All confidence interval calculations completed successfully!')
console.log('\n📊 Key Insights:')
console.log(`   • AI Visibility is ${aiCI.mean} with a range of ${aiCI.upper - aiCI.lower} points`)
console.log(`   • Conversion rate is ${(conversionCI.mean * 100).toFixed(1)}% with ${conversionCI.sampleSize} total visitors`)
console.log(`   • Average revenue is $${revenueCI.mean.toLocaleString()} with ${revenueCI.sampleSize} data points`)
console.log(`   • All calculations use 95% confidence intervals for statistical reliability`)

console.log('\n🔬 Statistical Notes:')
console.log('   • Confidence intervals provide a range of plausible values for the true population parameter')
console.log('   • 95% confidence means that if we repeated this process 100 times, 95 of the intervals would contain the true value')
console.log('   • Smaller sample sizes result in wider confidence intervals')
console.log('   • For proportions, we use normal approximation when np ≥ 5 and n(1-p) ≥ 5')
