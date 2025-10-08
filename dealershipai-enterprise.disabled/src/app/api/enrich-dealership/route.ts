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

    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname

    // Check cache first
    const cached = await redis.get(`dealership:${domain}`)
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string))
    }

    // Extract dealership name from domain
    const name = extractDealershipName(domain)

    const result = {
      name,
      domain,
      extracted_at: new Date().toISOString()
    }

    // Cache for 24 hours
    await redis.set(`dealership:${domain}`, JSON.stringify(result), { ex: 86400 })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Dealership enrichment error:', error)
    return NextResponse.json(
      { error: 'Failed to enrich dealership data' },
      { status: 500 }
    )
  }
}

function extractDealershipName(domain: string): string {
  // Remove common TLDs and subdomains
  let name = domain
    .replace(/^www\./, '')
    .replace(/\.(com|net|org|co|us|ca|uk)$/, '')
    .replace(/[-_]/g, ' ')

  // Capitalize words
  name = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  // Handle common dealership patterns
  if (name.includes('Dealership') || name.includes('Dealer')) {
    return name
  }

  // Add "Dealership" if it's not already there
  return `${name} Dealership`
}
