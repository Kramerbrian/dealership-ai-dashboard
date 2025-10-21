import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    // Return mock data for demo (no database connection)
    const mockData = generateMockBreakdownData(days)
    return NextResponse.json({
      data: mockData,
      period: `${days} days`,
      lastUpdated: new Date().toISOString(),
      source: 'mock_data'
    })

  } catch (error) {
    console.error('AEO Breakdown API Error:', error)
    
    // Get days from URL in catch block
    const url = new URL(req.url)
    const errorDays = parseInt(url.searchParams.get('days') || '30')
    
    // Return mock data on error
    const mockData = generateMockBreakdownData(errorDays)
    return NextResponse.json({
      data: mockData,
      period: `${errorDays} days`,
      lastUpdated: new Date().toISOString(),
      source: 'error_fallback',
      error: 'Database connection failed, using mock data'
    })
  }
}

type BreakdownRow = {
  date: string
  engine: string
  surface_type: string
  query_count: number
  appearances: number
  appearance_rate_pct: number
  citations: number
  citation_rate_pct: number
}

function generateMockBreakdownData(days: number): BreakdownRow[] {
  const mockData: BreakdownRow[] = []
  const engines = ['google_sge', 'perplexity', 'gemini', 'chatgpt']
  const surfaceTypes = ['overview', 'snippet', 'paa', 'featured']
  
  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    engines.forEach(engine => {
      surfaceTypes.forEach(surfaceType => {
        const queryCount = Math.floor(Math.random() * 50) + 10
        const appearances = Math.floor(queryCount * (Math.random() * 0.4 + 0.1))
        const citations = Math.floor(appearances * (Math.random() * 0.3 + 0.1))
        
        mockData.push({
          date: date.toISOString().split('T')[0] as string,
          engine,
          surface_type: surfaceType,
          query_count: queryCount,
          appearances,
          appearance_rate_pct: Number(((appearances / queryCount) * 100).toFixed(2)),
          citations,
          citation_rate_pct: Number(((citations / appearances) * 100).toFixed(2))
        })
      })
    })
  }
  
  return mockData
}