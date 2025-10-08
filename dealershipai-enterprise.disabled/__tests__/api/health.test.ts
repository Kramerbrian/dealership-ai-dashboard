import { NextRequest } from 'next/server'
import { GET } from '@/app/api/health/route'

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
process.env.STRIPE_SECRET_KEY = 'test-stripe-key'

describe('/api/health', () => {
  it('returns health status successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('services')
  })

  it('includes service status information', async () => {
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    
    const data = await response.json()
    expect(data.services).toHaveProperty('database')
    expect(data.services).toHaveProperty('ai')
    expect(data.services).toHaveProperty('stripe')
  })

  it('handles missing environment variables gracefully', async () => {
    // Temporarily remove env vars
    const originalOpenAI = process.env.OPENAI_API_KEY
    const originalAnthropic = process.env.ANTHROPIC_API_KEY
    const originalStripe = process.env.STRIPE_SECRET_KEY
    
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.STRIPE_SECRET_KEY
    
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.services.ai.status).toBe('unavailable')
    expect(data.services.stripe.status).toBe('unavailable')
    
    // Restore env vars
    process.env.OPENAI_API_KEY = originalOpenAI
    process.env.ANTHROPIC_API_KEY = originalAnthropic
    process.env.STRIPE_SECRET_KEY = originalStripe
  })
})
