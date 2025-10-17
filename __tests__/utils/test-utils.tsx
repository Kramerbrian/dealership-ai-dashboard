import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider locale="en" messages={{}}>
      {children}
    </NextIntlClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock fetch with default responses
export const mockFetch = (response: any = {}) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    })
  ) as jest.Mock
}

// Mock fetch with error
export const mockFetchError = (error: string = 'Network Error') => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error(error))
  ) as jest.Mock
}

// Mock fetch with specific status
export const mockFetchStatus = (status: number, response: any = {}) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    })
  ) as jest.Mock
}

// Test data factories
export const createMockTrendData = (count: number = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    score: 70 + Math.random() * 20,
    vertical: ['sales', 'acquisition', 'service', 'parts'][i % 4],
    metric: 'DTRI',
    source: 'test',
  }))
}

export const createMockSOWData = (count: number = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    sow_id: `SOW-${Date.now()}-${i}`,
    dealer_id: ['sales', 'acquisition', 'service', 'parts'][i % 4],
    event_type: ['VDP_OPTIMIZATION_SOW', 'REVIEW_CRISIS_SOW', 'TSM_DEFENSIVE_MODE'][i % 3],
    title: `Test SOW ${i + 1}`,
    created_at: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + (14 - i) * 24 * 60 * 60 * 1000).toISOString(),
    predicted_roi_usd: 10000 + Math.random() * 50000,
    status: 'Pending Confirmation',
    days_overdue: i > 2 ? i - 2 : 0,
    urgency: i > 2 ? 'high' : 'low',
  }))
}

export const createMockSentinelEvents = (count: number = 8) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    dealer_id: ['sales', 'acquisition', 'service', 'parts'][i % 4],
    event_type: ['REVIEW_CRISIS_SOW', 'VDP_OPTIMIZATION_SOW', 'MONITORING_ALERT'][i % 3],
    metric_value: Math.random() * 100,
    severity: ['critical', 'warning', 'info'][i % 3],
    status: ['active', 'resolved', 'dismissed'][i % 3],
    timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
    metadata: { source: 'test' },
  }))
}

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
}

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.ResizeObserver = mockResizeObserver
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
