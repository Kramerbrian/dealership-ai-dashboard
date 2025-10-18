/**
 * Test Setup Configuration
 * Centralized test configuration and utilities
 */

import { NextRequest } from 'next/server'
import { createMocks } from 'node-mocks-http'

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@dealershipai.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  subscription: 'pro',
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  user: createMockUser(),
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
})

export const createMockDealershipData = (overrides = {}) => ({
  id: 'test-dealership-123',
  name: 'Test Dealership',
  domain: 'testdealership.com',
  vai: 87.3,
  piqr: 92.1,
  hrp: 0.12,
  qai: 78.9,
  revenueAtRisk: 24800,
  lastUpdated: new Date().toISOString(),
  ...overrides,
})

export const createMockAnalyticsData = (overrides = {}) => ({
  sessions: 1250,
  pageViews: 3420,
  bounceRate: 0.42,
  avgSessionDuration: 180,
  conversionRate: 0.08,
  topPages: [
    { page: '/inventory', views: 1200 },
    { page: '/about', views: 800 },
    { page: '/contact', views: 600 },
  ],
  ...overrides,
})

export const createMockSEOData = (overrides = {}) => ({
  domain: 'testdealership.com',
  visibility: 87.3,
  trust: 92.1,
  risk: 0.12,
  keywords: 1250,
  backlinks: 340,
  domainAuthority: 45,
  ...overrides,
})

// API request helpers
export const createMockRequest = (options = {}) => {
  const { method = 'GET', url = '/api/test', body, headers = {} } = options
  
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export const createMockNextRequest = (options = {}) => {
  const { method = 'GET', url = '/api/test', body, headers = {} } = options
  
  const { req, res } = createMocks({
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  })
  
  return { req, res }
}

// Database mock helpers
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null }),
  })),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: createMockUser() }, error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: createMockSession() }, error: null }),
  },
})

// Cache mock helpers
export const createMockCache = () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  exists: jest.fn().mockResolvedValue(false),
})

// Google APIs mock helpers
export const createMockGoogleAPIs = () => ({
  getPageSpeedData: jest.fn().mockResolvedValue({
    performance: 85,
    accessibility: 92,
    bestPractices: 88,
    seo: 90,
  }),
  getSearchConsoleData: jest.fn().mockResolvedValue({
    clicks: 1250,
    impressions: 15000,
    ctr: 0.083,
    position: 12.5,
  }),
  getAnalyticsData: jest.fn().mockResolvedValue(createMockAnalyticsData()),
})

// Error helpers
export const createMockError = (message = 'Test error', status = 500) => {
  const error = new Error(message)
  ;(error as any).status = status
  return error
}

// Performance helpers
export const mockPerformanceNow = () => {
  let time = 0
  jest.spyOn(performance, 'now').mockImplementation(() => {
    time += 100
    return time
  })
  return () => jest.restoreAllMocks()
}

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_GA = 'G-TEST123'
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
  process.env.REDIS_URL = 'redis://test:6379'
  process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  
  // Mock console methods to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
}

// Cleanup helpers
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks()
  jest.restoreAllMocks()
  fetch.mockClear()
}

// Test timeout helpers
export const withTimeout = (testFn: () => Promise<void>, timeout = 10000) => {
  return async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timeout')), timeout)
    })
    
    await Promise.race([testFn(), timeoutPromise])
  }
}

// Assertion helpers
export const expectToBeValidDate = (date: any) => {
  expect(date).toBeDefined()
  expect(new Date(date).getTime()).not.toBeNaN()
}

export const expectToBeValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  expect(uuid).toMatch(uuidRegex)
}

export const expectToBeValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  expect(email).toMatch(emailRegex)
}

export const expectToBeValidURL = (url: string) => {
  expect(() => new URL(url)).not.toThrow()
}

// Mock data generators
export const generateMockTimeSeriesData = (days = 30) => {
  const data = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50,
      label: date.toLocaleDateString(),
    })
  }
  
  return data
}

export const generateMockCompetitorData = (count = 5) => {
  const competitors = []
  const domains = ['competitor1.com', 'competitor2.com', 'competitor3.com', 'competitor4.com', 'competitor5.com']
  
  for (let i = 0; i < count; i++) {
    competitors.push({
      id: `competitor-${i + 1}`,
      name: `Competitor ${i + 1}`,
      domain: domains[i] || `competitor${i + 1}.com`,
      vai: Math.floor(Math.random() * 40) + 60,
      marketShare: Math.floor(Math.random() * 20) + 5,
      lastUpdated: new Date().toISOString(),
    })
  }
  
  return competitors
}

export default {
  createMockUser,
  createMockSession,
  createMockDealershipData,
  createMockAnalyticsData,
  createMockSEOData,
  createMockRequest,
  createMockNextRequest,
  createMockSupabaseClient,
  createMockCache,
  createMockGoogleAPIs,
  createMockError,
  mockPerformanceNow,
  setupTestEnvironment,
  cleanupTestEnvironment,
  withTimeout,
  expectToBeValidDate,
  expectToBeValidUUID,
  expectToBeValidEmail,
  expectToBeValidURL,
  generateMockTimeSeriesData,
  generateMockCompetitorData,
}
