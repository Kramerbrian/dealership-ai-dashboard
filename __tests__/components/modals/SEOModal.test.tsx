/**
 * SEO Modal Component Tests
 * Unit tests for the SEO analysis modal
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SEOModal from '@/components/modals/SEOModal'
import { createMockSEOData } from '../setup/test-setup'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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

describe('SEOModal', () => {
  const mockSEOData = createMockSEOData()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockSWR.mockImplementation(() => ({ 
      data: mockSEOData, 
      error: null, 
      isLoading: false 
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders when open', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(screen.getByText('SEO Analysis')).toBeInTheDocument()
      expect(screen.getByText('testdealership.com')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <SEOModal 
          isOpen={false} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(screen.queryByText('SEO Analysis')).not.toBeInTheDocument()
    })

    it('displays SEO metrics correctly', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(screen.getByText('87.3%')).toBeInTheDocument() // visibility
      expect(screen.getByText('92.1%')).toBeInTheDocument() // trust
      expect(screen.getByText('12%')).toBeInTheDocument() // risk
    })

    it('displays keyword and backlink data', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(screen.getByText('1,250')).toBeInTheDocument() // keywords
      expect(screen.getByText('340')).toBeInTheDocument() // backlinks
      expect(screen.getByText('45')).toBeInTheDocument() // domain authority
    })
  })

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay is clicked', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      const overlay = screen.getByTestId('modal-overlay')
      fireEvent.click(overlay)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when modal content is clicked', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      const modalContent = screen.getByTestId('modal-content')
      fireEvent.click(modalContent)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('shows loading state when data is loading', () => {
      mockSWR.mockImplementation(() => ({ 
        data: null, 
        error: null, 
        isLoading: true 
      }))
      
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(screen.getByText('Loading SEO data...')).toBeInTheDocument()
    })

    it('shows error state when data fails to load', () => {
      mockSWR.mockImplementation(() => ({ 
        data: null, 
        error: new Error('Failed to load'), 
        isLoading: false 
      }))
      
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(screen.getByText('Failed to load SEO data')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('formats numbers correctly', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      // Check for formatted numbers
      expect(screen.getByText('1,250')).toBeInTheDocument()
      expect(screen.getByText('340')).toBeInTheDocument()
    })

    it('displays progress bars with correct values', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars).toHaveLength(3) // visibility, trust, risk
    })

    it('shows trend indicators', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      // Look for trend arrows or indicators
      const trendElements = screen.getAllByText(/↗|↘|→/)
      expect(trendElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby')
    })

    it('traps focus within modal', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toHaveFocus()
    })

    it('closes on Escape key', () => {
      render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Performance', () => {
    it('renders without unnecessary re-renders', () => {
      const { rerender } = render(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      // Re-render with same props
      rerender(
        <SEOModal 
          isOpen={true} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      expect(console.error).not.toHaveBeenCalled()
    })

    it('handles rapid open/close cycles', async () => {
      const { rerender } = render(
        <SEOModal 
          isOpen={false} 
          onClose={mockOnClose} 
          domain="testdealership.com" 
        />
      )
      
      // Rapidly toggle open/close
      for (let i = 0; i < 5; i++) {
        rerender(
          <SEOModal 
            isOpen={true} 
            onClose={mockOnClose} 
            domain="testdealership.com" 
          />
        )
        rerender(
          <SEOModal 
            isOpen={false} 
            onClose={mockOnClose} 
            domain="testdealership.com" 
          />
        )
      }
      
      // Should handle gracefully without errors
      expect(console.error).not.toHaveBeenCalled()
    })
  })
})
