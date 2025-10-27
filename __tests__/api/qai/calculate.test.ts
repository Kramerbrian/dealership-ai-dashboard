import { POST } from '@/app/api/qai/calculate/route'
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('/api/qai/calculate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null })

    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({ domain: 'test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when domain is missing', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })

    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Domain is required')
  })

  it('returns QAI score for valid request', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })

    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({ domain: 'test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.score).toHaveProperty('qai_star_score')
    expect(data.score).toHaveProperty('piqr_score')
    expect(data.score).toHaveProperty('hrp_score')
    expect(data.score).toHaveProperty('vai_score')
    expect(data.score).toHaveProperty('oci_score')
    expect(data.score).toHaveProperty('breakdown')
    expect(data.remaining).toBe(999)
  })

  it('handles geographic pooling option', async () => {
    mockAuth.mockResolvedValue({ userId: 'test-user-id' })

    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({ 
        domain: 'test.com',
        useGeographicPooling: true 
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('handles server errors gracefully', async () => {
    mockAuth.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/qai/calculate', {
      method: 'POST',
      body: JSON.stringify({ domain: 'test.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Database connection failed')
  })
})
