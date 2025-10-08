import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { website, dealership_name, challenge, email, name, role } = body

    // Validate required fields
    if (!website || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create lead record
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const leadData = {
      id: leadId,
      website,
      dealership_name,
      challenge,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
      ip_address: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    }

    // Store in Redis
    await redis.set(`lead:${leadId}`, JSON.stringify(leadData), { ex: 86400 * 30 }) // 30 days

    // Update conversion metrics
    await Promise.all([
      redis.incr('metrics:form_completes'),
      redis.incr('metrics:leads_total'),
      redis.sadd('metrics:unique_websites', website),
      redis.sadd('metrics:unique_emails', email)
    ])

    // Trigger AI audit generation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/audit/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          website,
          email,
          dealership_name
        })
      })
    } catch (error) {
      console.error('Failed to trigger audit generation:', error)
      // Don't fail the lead capture if audit generation fails
    }

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Lead captured successfully'
    })

  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    )
  }
}