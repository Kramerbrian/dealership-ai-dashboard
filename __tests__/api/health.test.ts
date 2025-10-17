import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/health/route'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }))
    }))
  }))
}))

// Mock BullMQ
jest.mock('bullmq', () => ({
  Queue: jest.fn(() => ({
    getWaitingCount: jest.fn(() => Promise.resolve(0)),
    getActiveCount: jest.fn(() => Promise.resolve(0)),
    getCompletedCount: jest.fn(() => Promise.resolve(10)),
    getFailedCount: jest.fn(() => Promise.resolve(0)),
    getDelayedCount: jest.fn(() => Promise.resolve(0)),
    getJobs: jest.fn(() => Promise.resolve([])),
    getRepeatableJobs: jest.fn(() => Promise.resolve([]))
  }))
}))

describe('/api/health', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    process.env.REDIS_URL = 'redis://test:6379'
  })

  describe('GET', () => {
    it('returns health status with all services', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('services')
      expect(data.services).toHaveProperty('supabase')
      expect(data.services).toHaveProperty('redis')
      expect(data.services).toHaveProperty('bullmq')
      expect(data.services).toHaveProperty('environment')
    })

    it('returns degraded status when services are missing', async () => {
      // Remove environment variables
      delete process.env.SUPABASE_URL
      delete process.env.REDIS_URL

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('degraded')
    })

    it('includes system information', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data).toHaveProperty('system')
      expect(data.system).toHaveProperty('nodeVersion')
      expect(data.system).toHaveProperty('platform')
      expect(data.system).toHaveProperty('memory')
    })
  })

  describe('POST', () => {
    it('returns health status for specific service', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'POST',
        body: JSON.stringify({ service: 'supabase' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('service', 'supabase')
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
    })

    it('returns error for unknown service', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'POST',
        body: JSON.stringify({ service: 'unknown' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Unknown service')
    })

    it('returns error when service parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/health', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Service parameter required')
    })
  })
})
