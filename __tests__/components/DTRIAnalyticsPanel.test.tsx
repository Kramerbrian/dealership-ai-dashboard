import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DTRIAnalyticsPanel from '@/app/(dashboard)/components/DTRIAnalyticsPanel'

// Mock fetch
global.fetch = jest.fn()

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

describe('DTRIAnalyticsPanel', () => {
  beforeEach(() => {
    // Reset fetch mock
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders the component with title and description', () => {
    // Mock successful API responses
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lastRun: new Date().toISOString() }),
      })

    render(<DTRIAnalyticsPanel />)
    
    expect(screen.getByText('Digital Trust Revenue Index (DTRI)')).toBeInTheDocument()
    expect(screen.getByText('Elasticity, Trust, and AI Visibility across all verticals')).toBeInTheDocument()
  })

  it('displays vertical KPI cards', async () => {
    // Mock API responses with data
    const mockTrendData = [
      { timestamp: '2024-01-01', score: 75, vertical: 'sales' },
      { timestamp: '2024-01-02', score: 78, vertical: 'sales' },
    ]

    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockTrendData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lastRun: new Date().toISOString() }),
      })

    render(<DTRIAnalyticsPanel />)

    await waitFor(() => {
      expect(screen.getByText('Sales')).toBeInTheDocument()
      expect(screen.getByText('Acquisition')).toBeInTheDocument()
      expect(screen.getByText('Service')).toBeInTheDocument()
      expect(screen.getByText('Parts')).toBeInTheDocument()
    })
  })

  it('shows auto refresh status when queue status is available', async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lastRun: new Date().toISOString() }),
      })

    render(<DTRIAnalyticsPanel />)

    await waitFor(() => {
      expect(screen.getByText('✅ Auto Refresh Enabled')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    ;(fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lastRun: new Date().toISOString() }),
      })

    render(<DTRIAnalyticsPanel />)

    // Component should still render even with API errors
    expect(screen.getByText('Digital Trust Revenue Index (DTRI)')).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    // Mock slow API response
    ;(fetch as jest.Mock)
      .mockImplementationOnce(() => new Promise(() => {})) // Never resolves
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ lastRun: new Date().toISOString() }),
      })

    render(<DTRIAnalyticsPanel />)
    
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument()
  })
})
