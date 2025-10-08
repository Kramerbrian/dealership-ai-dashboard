import { NextRequest, NextResponse } from 'next/server'

// Simple confidence interval calculation functions
function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateStandardDeviation(values: number[], mean: number): number {
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function calculateConfidenceInterval(values: number[], confidence: number = 0.95) {
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

function calculateProportionCI(successes: number, total: number, confidence: number = 0.95) {
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

export async function GET(request: NextRequest) {
  try {
    // Test AI Visibility Scores
    const aiScores = [78, 82, 75, 85, 79, 81, 77, 83, 80, 76]
    const aiCI = calculateConfidenceInterval(aiScores)
    
    // Test Conversion Rate
    const conversions = 45
    const total = 1000
    const conversionCI = calculateProportionCI(conversions, total)
    
    // Test Revenue Impact
    const revenues = [15000, 18000, 16500, 22000, 19500]
    const revenueCI = calculateConfidenceInterval(revenues)
    
    return NextResponse.json({
      success: true,
      examples: {
        ai_visibility: {
          scores: aiScores,
          result: aiCI,
          formatted: `${aiCI.mean} (95% CI: ${aiCI.lower}-${aiCI.upper})`
        },
        conversion_rate: {
          conversions,
          total,
          result: conversionCI,
          formatted: `${(conversionCI.mean * 100).toFixed(1)}% (95% CI: ${(conversionCI.lower * 100).toFixed(1)}%-${(conversionCI.upper * 100).toFixed(1)}%)`
        },
        revenue: {
          revenues,
          result: revenueCI,
          formatted: `$${revenueCI.mean.toLocaleString()} (95% CI: $${revenueCI.lower.toLocaleString()}-$${revenueCI.upper.toLocaleString()})`
        }
      }
    })
  } catch (error) {
    console.error('Confidence interval test error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate confidence intervals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, confidence = 0.95 } = body

    let result

    switch (type) {
      case 'ai_visibility':
        if (!data.scores || !Array.isArray(data.scores)) {
          return NextResponse.json(
            { error: 'AI visibility requires scores array' },
            { status: 400 }
          )
        }
        result = calculateConfidenceInterval(data.scores, confidence)
        break

      case 'conversion_rate':
        if (typeof data.conversions !== 'number' || typeof data.total !== 'number') {
          return NextResponse.json(
            { error: 'Conversion rate requires conversions and total numbers' },
            { status: 400 }
          )
        }
        result = calculateProportionCI(data.conversions, data.total, confidence)
        break

      case 'revenue':
        if (!data.revenues || !Array.isArray(data.revenues)) {
          return NextResponse.json(
            { error: 'Revenue requires revenues array' },
            { status: 400 }
          )
        }
        result = calculateConfidenceInterval(data.revenues, confidence)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported types: ai_visibility, conversion_rate, revenue' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      type,
      confidence: confidence * 100,
      result,
      formatted: type === 'revenue' 
        ? `$${result.mean.toLocaleString()} (95% CI: $${result.lower.toLocaleString()}-$${result.upper.toLocaleString()})`
        : type === 'conversion_rate'
        ? `${(result.mean * 100).toFixed(1)}% (95% CI: ${(result.lower * 100).toFixed(1)}%-${(result.upper * 100).toFixed(1)}%)`
        : `${result.mean} (95% CI: ${result.lower}-${result.upper})`
    })

  } catch (error) {
    console.error('Confidence interval calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate confidence interval' },
      { status: 500 }
    )
  }
}
