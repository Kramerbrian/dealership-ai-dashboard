import { NextRequest, NextResponse } from 'next/server'
import { 
  aiVisibilityCI, 
  conversionRateCI, 
  revenueCI, 
  clickThroughRateCI,
  sessionDurationCI,
  bounceRateCI,
  formatCI,
  examples
} from '@/lib/confidence-intervals'

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
        result = aiVisibilityCI(data.scores, confidence)
        break

      case 'conversion_rate':
        if (typeof data.conversions !== 'number' || typeof data.total !== 'number') {
          return NextResponse.json(
            { error: 'Conversion rate requires conversions and total numbers' },
            { status: 400 }
          )
        }
        result = conversionRateCI(data.conversions, data.total, confidence)
        break

      case 'revenue':
        if (!data.revenues || !Array.isArray(data.revenues)) {
          return NextResponse.json(
            { error: 'Revenue requires revenues array' },
            { status: 400 }
          )
        }
        result = revenueCI(data.revenues, confidence)
        break

      case 'click_through_rate':
        if (typeof data.clicks !== 'number' || typeof data.impressions !== 'number') {
          return NextResponse.json(
            { error: 'Click-through rate requires clicks and impressions numbers' },
            { status: 400 }
          )
        }
        result = clickThroughRateCI(data.clicks, data.impressions, confidence)
        break

      case 'session_duration':
        if (!data.durations || !Array.isArray(data.durations)) {
          return NextResponse.json(
            { error: 'Session duration requires durations array' },
            { status: 400 }
          )
        }
        result = sessionDurationCI(data.durations, confidence)
        break

      case 'bounce_rate':
        if (typeof data.bounces !== 'number' || typeof data.sessions !== 'number') {
          return NextResponse.json(
            { error: 'Bounce rate requires bounces and sessions numbers' },
            { status: 400 }
          )
        }
        result = bounceRateCI(data.bounces, data.sessions, confidence)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Supported types: ai_visibility, conversion_rate, revenue, click_through_rate, session_duration, bounce_rate' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      type,
      confidence: confidence * 100,
      result,
      formatted: formatCI(result, type === 'revenue')
    })

  } catch (error) {
    console.error('Confidence interval calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate confidence interval' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const example = searchParams.get('example')

    if (example) {
      let result
      switch (example) {
        case 'ai_visibility':
          result = examples.aiVisibility()
          break
        case 'conversion_rate':
          result = examples.conversionRate()
          break
        case 'revenue':
          result = examples.revenue()
          break
        default:
          return NextResponse.json(
            { error: 'Invalid example. Supported: ai_visibility, conversion_rate, revenue' },
            { status: 400 }
          )
      }

      return NextResponse.json({
        success: true,
        example,
        result,
        formatted: formatCI(result, example === 'revenue')
      })
    }

    // Return all examples
    const allExamples = {
      ai_visibility: {
        result: examples.aiVisibility(),
        formatted: formatCI(examples.aiVisibility())
      },
      conversion_rate: {
        result: examples.conversionRate(),
        formatted: formatCI(examples.conversionRate())
      },
      revenue: {
        result: examples.revenue(),
        formatted: formatCI(examples.revenue(), true)
      }
    }

    return NextResponse.json({
      success: true,
      examples: allExamples,
      usage: {
        POST: {
          description: 'Calculate confidence intervals for various metrics',
          body: {
            type: 'ai_visibility | conversion_rate | revenue | click_through_rate | session_duration | bounce_rate',
            data: 'Object containing the required data for the metric type',
            confidence: 'Number between 0 and 1 (default: 0.95)'
          }
        },
        GET: {
          description: 'Get example calculations',
          query: '?example=ai_visibility|conversion_rate|revenue'
        }
      }
    })

  } catch (error) {
    console.error('Confidence interval API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
