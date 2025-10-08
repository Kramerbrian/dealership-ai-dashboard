import { NextRequest, NextResponse } from 'next/server'
import { testAIConnectivity, getAIStatus } from '@/lib/ai-apis'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const testConnectivity = searchParams.get('test') === 'true'

    if (testConnectivity) {
      const connectivity = await testAIConnectivity()
      return NextResponse.json({
        success: true,
        connectivity,
        message: 'AI API connectivity test completed'
      })
    }

    const status = getAIStatus()
    return NextResponse.json({
      success: true,
      status,
      message: 'AI API status retrieved'
    })
  } catch (error) {
    console.error('AI API test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'AI API test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, engine, context } = await req.json()

    if (!prompt || !engine) {
      return NextResponse.json(
        { error: 'Prompt and engine are required' },
        { status: 400 }
      )
    }

    const { queryAllPlatforms } = await import('@/lib/ai-apis')
    
    const response = await queryAllPlatforms(prompt, 'Sample Business')

    return NextResponse.json({
      success: true,
      response,
      message: 'AI query completed successfully'
    })
  } catch (error) {
    console.error('AI query error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'AI query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
