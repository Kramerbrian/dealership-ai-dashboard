import { NextResponse } from 'next/server'
import { getVisibilityWeights } from '@/lib/formulas/registry'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

/**
 * GET /api/formulas/weights
 * Returns visibility weights for AI engines
 * Used by landing page and dashboard components
 */
export async function GET() {
  try {
    const weights = await getVisibilityWeights()
    
    return NextResponse.json(weights, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error: any) {
    console.error('[api/formulas/weights] Error:', error)
    
    // Return defaults on error
    return NextResponse.json(
      {
        ChatGPT: 0.35,
        Perplexity: 0.25,
        Gemini: 0.25,
        Copilot: 0.15,
      },
      {
        status: 200, // Still return 200 with defaults
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      }
    )
  }
}

