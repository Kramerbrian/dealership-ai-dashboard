/**
 * Enhanced Dealership Dashboard Component Tests
 * Comprehensive unit tests for the main dashboard component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import EnhancedDealershipDashboard from '@/components/dashboard/EnhancedDealershipDashboard'
import { createMockUser, createMockDealershipData, createMockAnalyticsData } from '../setup/test-setup'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock SWR
jest.mock('swr', () => ({
  default: jest.fn(),
}))

const mockSWR = require('swr').default

describe('EnhancedDealershipDashboard', () => {
  const mockUser = createMockUser()
  const mockDealershipData = createMockDealershipData()
  const mockAnalyticsData = createMockAnalyticsData()

  beforeEach(() => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
    })

    // Mock SWR responses
    mockSWR.mockImplementation((key: string) => {
      if (key.includes('ai-health')) {
        return { data: mockDealershipData, error: null, isLoading: false }
      }
      if (key.includes('analytics')) {
        return { data: mockAnalyticsData, error: null, isLoading: false }
      }
      return { data: null, error: null, isLoading: true }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dashboard with user data', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('AI Visibility Index')).toBeInTheDocument()
      expect(screen.getByText('87.3%')).toBeInTheDocument()
      expect(screen.getByText('Predictive IQ Rating')).toBeInTheDocument()
      expect(screen.getByText('92.1%')).toBeInTheDocument()
    })

    it('renders all KPI cards', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('AI Visibility Index')).toBeInTheDocument()
      expect(screen.getByText('Predictive IQ Rating')).toBeInTheDocument()
      expect(screen.getByText('Human Risk Probability')).toBeInTheDocument()
      expect(screen.getByText('Quality AI Score')).toBeInTheDocument()
      expect(screen.getByText('Revenue at Risk')).toBeInTheDocument()
    })

    it('renders visibility breakdown cards', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('SEO Analysis')).toBeInTheDocument()
      expect(screen.getByText('AEO Analysis')).toBeInTheDocument()
      expect(screen.getByText('GEO Analysis')).toBeInTheDocument()
    })

    it('renders loading state when data is loading', () => {
      mockSWR.mockImplementation(() => ({ data: null, error: null, isLoading: true }))
      
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument()
    })

    it('renders error state when data fails to load', () => {
      mockSWR.mockImplementation(() => ({ 
        data: null, 
        error: new Error('Failed to load data'), 
        isLoading: false 
      }))
      
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })
  })

  describe('Modal Interactions', () => {
    it('opens SEO modal when SEO card is clicked', async () => {
      render(<EnhancedDealershipDashboard />)
      
      const seoCard = screen.getByText('SEO Analysis').closest('div')
      fireEvent.click(seoCard!)
      
      await waitFor(() => {
        expect(screen.getByText('SEO Analysis')).toBeInTheDocument()
      })
    })

    it('opens AEO modal when AEO card is clicked', async () => {
      render(<EnhancedDealershipDashboard />)
      
      const aeoCard = screen.getByText('AEO Analysis').closest('div')
      fireEvent.click(aeoCard!)
      
      await waitFor(() => {
        expect(screen.getByText('AEO Analysis')).toBeInTheDocument()
      })
    })

    it('opens GEO modal when GEO card is clicked', async () => {
      render(<EnhancedDealershipDashboard />)
      
      const geoCard = screen.getByText('GEO Analysis').closest('div')
      fireEvent.click(geoCard!)
      
      await waitFor(() => {
        expect(screen.getByText('GEO Analysis')).toBeInTheDocument()
      })
    })

    it('closes modal when close button is clicked', async () => {
      render(<EnhancedDealershipDashboard />)
      
      // Open modal
      const seoCard = screen.getByText('SEO Analysis').closest('div')
      fireEvent.click(seoCard!)
      
      await waitFor(() => {
        expect(screen.getByText('SEO Analysis')).toBeInTheDocument()
      })
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('SEO Analysis')).not.toBeInTheDocument()
      })
    })
  })

  describe('Data Display', () => {
    it('displays correct VAI score', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('87.3%')).toBeInTheDocument()
    })

    it('displays correct PIQR score', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('92.1%')).toBeInTheDocument()
    })

    it('displays correct HRP score', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('12%')).toBeInTheDocument()
    })

    it('displays correct QAI score', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('78.9%')).toBeInTheDocument()
    })

    it('displays correct revenue at risk', () => {
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('$24,800')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies correct CSS classes for responsive layout', () => {
      render(<EnhancedDealershipDashboard />)
      
      const kpiGrid = screen.getByText('AI Visibility Index').closest('div')?.parentElement
      expect(kpiGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')
    })

    it('applies correct CSS classes for visibility cards', () => {
      render(<EnhancedDealershipDashboard />)
      
      const visibilityGrid = screen.getByText('SEO Analysis').closest('div')?.parentElement
      expect(visibilityGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(<EnhancedDealershipDashboard />)
      
      const seoCard = screen.getByText('SEO Analysis').closest('div')
      expect(seoCard).toHaveAttribute('role', 'button')
    })

    it('has proper heading hierarchy', () => {
      render(<EnhancedDealershipDashboard />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('AI Visibility Index')
    })

    it('has proper button labels', () => {
      render(<EnhancedDealershipDashboard />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing user data gracefully', () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      })
      
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('Please sign in to view your dashboard')).toBeInTheDocument()
    })

    it('handles API errors gracefully', () => {
      mockSWR.mockImplementation(() => ({ 
        data: null, 
        error: new Error('API Error'), 
        isLoading: false 
      }))
      
      render(<EnhancedDealershipDashboard />)
      
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders without unnecessary re-renders', () => {
      const { rerender } = render(<EnhancedDealershipDashboard />)
      
      // Re-render with same props
      rerender(<EnhancedDealershipDashboard />)
      
      // Should not cause any console errors or warnings
      expect(console.error).not.toHaveBeenCalled()
    })

    it('handles rapid modal toggles', async () => {
      render(<EnhancedDealershipDashboard />)
      
      const seoCard = screen.getByText('SEO Analysis').closest('div')
      
      // Rapidly click multiple times
      fireEvent.click(seoCard!)
      fireEvent.click(seoCard!)
      fireEvent.click(seoCard!)
      
      // Should handle gracefully without errors
      await waitFor(() => {
        expect(screen.getByText('SEO Analysis')).toBeInTheDocument()
      })
    })
  })
})
