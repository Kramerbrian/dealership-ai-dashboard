import { NextRequest } from 'next/server'
import { POST as calculateQAI } from '@/app/api/qai/calculate/route'

// Mock auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: () => ({ userId: 'test-user-id' })
}))

// Mock database
jest.mock('@/lib/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-user',
        clerk_id: 'test-user-id',
        tier: 'PRO'
      })
    },
    session: {
      create: jest.fn().mockResolvedValue({ id: 'test-session' })
    }
  }
}))

// Mock Redis
jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK')
  },
  cacheKeys: {
    qaiScore: (domain: string) => `qai:${domain}`,
    userSessions: (userId: string) => `sessions:${userId}`
  }
}))

describe('/api/qai/calculate', () => {
  it('calculates QAI score successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({
        domain: 'test-dealership.com',
        useGeographicPooling: false
      })
    })

    const response = await calculateQAI(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.score).toHaveProperty('qai_star_score')
    expect(data.score).toHaveProperty('piqr_score')
    expect(data.score).toHaveProperty('hrp_score')
    expect(data.score).toHaveProperty('vai_score')
    expect(data.score).toHaveProperty('oci_score')
    expect(data.score).toHaveProperty('breakdown')
  })

  it('returns 400 for missing domain', async () => {
    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await calculateQAI(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Domain is required')
  })

  it('returns 401 for unauthenticated user', async () => {
    // Mock auth to return null
    jest.doMock('@clerk/nextjs/server', () => ({
      auth: () => ({ userId: null })
    }))

    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({
        domain: 'test-dealership.com'
      })
    })

    const response = await calculateQAI(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('handles geographic pooling', async () => {
    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({
        domain: 'test-dealership.com',
        useGeographicPooling: true
      })
    })

    const response = await calculateQAI(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.score.geographic_pooling_applied).toBe(true)
  })
})
