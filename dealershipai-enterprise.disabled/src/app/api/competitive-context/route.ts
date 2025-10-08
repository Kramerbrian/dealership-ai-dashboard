import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Extract domain and city from URL
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    const city = await getCityFromDomain(domain)

    // Get competitive data
    const [checksToday, competitors] = await Promise.all([
      getChecksToday(city),
      getCompetitors(city)
    ])

    return NextResponse.json({
      city,
      checks_today: checksToday,
      competitors
    })

  } catch (error) {
    console.error('Competitive context error:', error)
    return NextResponse.json(
      { error: 'Failed to get competitive context' },
      { status: 500 }
    )
  }
}

async function getCityFromDomain(domain: string): Promise<string> {
  try {
    // Try to get from cache first
    const cached = await redis.get(`city:${domain}`)
    if (cached) return cached as string

    // Mock city extraction (in real implementation, use geolocation API)
    const cityMap: Record<string, string> = {
      'honda': 'Los Angeles',
      'toyota': 'Chicago',
      'ford': 'Detroit',
      'chevrolet': 'Houston',
      'bmw': 'Miami',
      'mercedes': 'New York',
      'audi': 'San Francisco',
      'lexus': 'Seattle'
    }

    let city = 'Your City'
    for (const [brand, cityName] of Object.entries(cityMap)) {
      if (domain.toLowerCase().includes(brand)) {
        city = cityName
        break
      }
    }

    // Cache for 1 hour
    await redis.set(`city:${domain}`, city, { ex: 3600 })
    return city

  } catch (error) {
    return 'Your City'
  }
}

async function getChecksToday(city: string): Promise<number> {
  try {
    const key = `checks_today:${city}:${new Date().toISOString().split('T')[0]}`
    const count = await redis.get(key)
    return Number(count || 0)
  } catch (error) {
    return Math.floor(Math.random() * 20) + 5 // Fallback to random number
  }
}

async function getCompetitors(city: string): Promise<Array<{
  visible_name: string
  score: number
  recent_improvement: boolean
}>> {
  try {
    const cached = await redis.get(`competitors:${city}`)
    if (cached) return JSON.parse(cached as string)

    // Generate mock competitor data
    const competitors = [
      { visible_name: 'H***a D*****ship', score: 87, recent_improvement: true },
      { visible_name: 'T****a C*****', score: 82, recent_improvement: false },
      { visible_name: 'F*** M*****', score: 79, recent_improvement: true },
      { visible_name: 'C*******t D*****', score: 75, recent_improvement: false }
    ]

    // Cache for 30 minutes
    await redis.set(`competitors:${city}`, JSON.stringify(competitors), { ex: 1800 })
    return competitors

  } catch (error) {
    return [
      { visible_name: 'C*******r 1', score: 85, recent_improvement: true },
      { visible_name: 'C*******r 2', score: 78, recent_improvement: false }
    ]
  }
}
